'use strict';
const {Contract} = require("fabric-contract-api");
class InsuranceClaim extends Contract {
    constructor() {
        super('mednetInsuranceclaim');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("insurance claim chaincode is successfully instantiated");
    }

    async insuranceClaim(ctx, receiptID, citizenID,citizenName) {
        const insuranceKey = ctx.stub.createCompositeKey('mednetInsuranceClaim', [receiptID, citizenID]);
        
        const receiptKey = ctx.stub.createCompositeKey('mednetReceipt', [receiptID, citizenID]);
        receiptBuffer= await ctx.stub.getState(receiptKey);
        const receiptObject = JSON.parse(receiptBuffer.toString());

        const citizenKey = ctx.stub.createCompositeKey('mednetCitizen', [citizenID, citizenName]);
        citizenBuffer= await ctx.stub.getState(citizenKey);
        const citizenObject = JSON.parse(citizenBuffer.toString());

        if(receiptObject.amount<=citizenObject.insuranceLimit){
            const insuranceObject = {
                receiptType: type,
                citizenKey: citizenKey,
                amount: receiptObject.amount,
                status : "claim approved"
            }
            citizenObject.insuranceLimit = citizenObject.insuranceLimit- receiptObject.amount;
            citizenBufferNew = Buffer.from(JSON.stringify(citizenObject));
            await ctx.stub.putState(citizenKey,citizenBufferNew);

            insuranceBuffer = Buffer.from(JSON.stringify(insuranceObject));
            await ctx.stub.putState(insuranceKey,insuranceBuffer);
            return insuranceObject;
        }
        else{
            console.log("insurance limit over");
        }
    }
}
module.exports=InsuranceClaim;