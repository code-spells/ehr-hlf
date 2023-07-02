'use strict'
const { Contract } = require('fabric-contract-api'); 
class DrugRegisteration extends Contract {
    constructor() {
        super('mednetDrugRegistration');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("drug registration chaincode is successfully instantiated");
    }
    
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, entityID) {
        if(ctx.clientIdentity.getMSPID() == "manufacturerMSP"){
            const drugKey = ctx.stub.createCompositeKey('mednetDrug', [drugName, serialNo]);
            
            const manufacturerKeyIterator = await ctx.stub.getStateByPartialCompositeKey('mednetEntity',[entityID]);
            const manufactureCompKeyObject = await manufacturerKeyIterator.next();
            
            const drugObject = {
                drugKey : drugKey,
                name: drugName,
                manufacturer: manufactureCompKeyObject.value.key,
                manufacturingDate: mfgDate,
                expiryDate: expDate, 
                owner: manufactureCompKeyObject.value.key,
                shipment: {}
            }
            const drugBuffer = Buffer.from(JSON.stringify(drugObject));
            //putState
            await ctx.stub.putState(drugKey, drugBuffer);

            return drugObject;
        }
        else{
            console.log("drugs can only be added by a manufacturer");
        }
    }
}
module.exports=DrugRegisteration;