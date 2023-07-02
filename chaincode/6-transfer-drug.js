'use strict'
const { Contract } = require('fabric-contract-api'); 
class TransferDrugContract extends Contract {
    constructor() {
        super('mednetDrugTransfer');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("drug transfer chaincode is successfully instantiated");
    }
    async createPO(ctx, buyerID,buyerName, sellerID,sellerName, drugName, quantity) {
        if (ctx.clientIdentity.getMSPID() == "doctorMSP"){
            const poKey = ctx.stub.createCompositeKey('mednetPurchaseOrder', [buyerID, drugName]);
            const buyerKey = ctx.stub.createCompositeKey('mednetEntity',[buyerID,buyerName]);
            const sellerKey = ctx.stub.createCompositeKey('mednetEntity',[sellerID,sellerName]);

            const poObject = {
                poID: poKey,
                drugName: drugName,
                quantity: quantity,
                buyer: buyerKey,
                seller: sellerKey
            }
            const poObjectBuffer = Buffer.from(JSON.stringify(poObject));
            //putState
            await ctx.stub.putState(poKey, poObjectBuffer);
            ctx.stub.setEvent("purchase order initiated", poObjectBuffer)
            return true;
        }
        else{
            console.log("only a pharmacy can create drug purchase order")
        }
        
    }

    async createShipment(ctx, buyerID, drugName, listOfAssets, transporterID,transporterName) {
        const poKey = ctx.stub.createCompositeKey('mednetPurchaseOrder', [buyerID, drugName]);
        const poOjectBuffer = await ctx.stub.getState(poKey);
        const poOject = JSON.parse(poOjectBuffer.toString());
        if (Object.keys(listOfAssets).length == poOject.quantity ){
            const shipmentKey = ctx.stub.createCompositeKey('mednetShipment', [buyerID, drugName]);
            let i = 0;
            let asset = [];
            for (let key in listOfAssets){
                asset[i]= ctx.stub.createCompositeKey('mednetDrug', [listOfAssets.key, key]);
                i++;
            }
            const transporterKey = ctx.stub.createCompositeKey('mednetEntity',[transporterID,transporterName]);

            for (let key in listOfAssets){
                const productIDKey =ctx.stub.createCompositeKey('mednetDrug', [listOfAssets.key, key]);
                const drugBuffer = await ctx.stub.getState(productIDKey);
                const drugObject = JSON.parse(drugBuffer.toString());
                drugObject.owner = transporterKey;

                const updatedDrugBuffer = Buffer.from(JSON.stringify(drugObject));
                await ctx.stub.putState(productIDKey, updatedDrugBuffer);
            }

            const shipmentObject = {
                shipmentID: shipmentKey,
                creator: ctx.clientIdentity.getID() ,
                assets: asset,
                transporter: transporterKey,
                status:"in-transit"
            }
            

        
            const shipmentObjectBuffer = Buffer.from(JSON.stringify(shipmentObject));
            await ctx.stub.putState(shipmentKey, shipmentObjectBuffer);

            return shipmentObject;
        }
        else{
            console.log("drug quantity doesn't match");
        }
    }

    async updateShipment(ctx, buyerID, buyerName, drugName, transporterID,transporterName){
        if (ctx.clientIdentity.getMSPID() == "transporterMSP"){
            const shipmentKey = ctx.stub.createCompositeKey('mednetShipment', [buyerCRN, drugName]);
            const shipmentBuffer = await ctx.stub.getState(shipmentKey);
            const shipmentObject = JSON.parse(shipmentBuffer.toString());
            shipmentObject.status = "delivered";

            const updatedshipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));
            await ctx.stub.putState(shipmentKey, updatedshipmentBuffer);
            
            const transporterKey = ctx.stub.createCompositeKey('mednetEntity',[transporterID,transporterName]);
            const buyerKey = ctx.stub.createCompositeKey('mednetEntity',[buyerID,buyerName]);

            for (let x of shipmentObject.assets){
                const drugBuffer = await ctx.stub.getState(x);
                const drugObject = JSON.parse(drugBuffer.toString());
                drugObject.shipment.origin= drugObject.manufacturer;
                drugObject.shipment.transporter = transporterKey;
                drugObject.shipment.destination = buyerKey;
                drugObject.owner = buyerKey;
                const updatedDrugBuffer = Buffer.from(JSON.stringify(drugObject));
                await ctx.stub.putState(x, updatedDrugBuffer);
            }
            return  shipmentObject;
        }
        else{
            console.log("can only be calle dby a transporter");
        }

        
    }

    async retailDrug (ctx, drugName, serialNo, pharmacyID,pharmacyName, citizenID, citizenName){
        const pharmacyKey = ctx.stub.createCompositeKey('mednetEntity',[pharmacyID,pharmacyName]);

        const drugKey =ctx.stub.createCompositeKey('mednetDrug', [drugName, serialNo]);
        const drugBuffer = await ctx.stub.getState(drugKey);
        const drugObject = JSON.parse(drugBuffer.toString());

        const citizenKey = ctx.stub.createCompositeKey('mednetCitizen', [citizenID, citizenName]);

        if (drugObject.owner == pharmacyKey){
            drugObject.owner = citizenKey;
            const updatedDrugBuffer = Buffer.from(JSON.stringify(drugObject));
            await ctx.stub.putState(drugKey, updatedDrugBuffer);
            return drugObject;
        }
        else{
            console.log("function can only be called by the pharmacy who owns the drug");
        }
    }
}
module.exports=TransferDrugContract;