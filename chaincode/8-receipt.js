'use strict';
const {Contract} = require("fabric-contract-api");
class CreateReceipt extends Contract {
    constructor() {
        super('mednetCreateReceipt');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("receipt registration chaincode is successfully instantiated");
    }
    //receipt can be of three type- pharmacy receipt, testlab receipt or the hospital receipt
    //the same can be mentioned in the type of receipt
    async addReceipt(ctx, receiptID,amount, type, generatingEntityID,entityName, citizenID,citizenName) {
        const receiptKey = ctx.stub.createCompositeKey('mednetReceipt', [receiptID, citizenID]);
        const entityKey = ctx.stub.createCompositeKey('mednetEntity',[generatingEntityID,entityName])
        const citizenKey = ctx.stub.createCompositeKey('mednetEntity',[citizenID,citizenName])
        const receiptObject = {
            receiptID: receiptID,
            receiptType: type,
            citizenKey: citizenKey,
            entityKey: entityKey,
            amount: amount
        }
        const receiptBuffer = Buffer.from(JSON.stringify(receiptObject));
        await ctx.stub.putState(receiptKey,receiptBuffer);
        return receiptObject;
    }
}

module.exports=CreateReceipt;