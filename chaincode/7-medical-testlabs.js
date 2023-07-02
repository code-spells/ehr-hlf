'use strict'
const { Contract } = require('fabric-contract-api'); 

class TestLabContract extends Contract {
    constructor() {
        super('mednetLabtest');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("test lab chaincode is successfully instantiated");
    }
    async initiateLabTest (ctx, testName,testID, testlabID,testLabName, citizenID, citizenName){
        const labKey = ctx.stub.createCompositeKey('mednetEntity',[testlabID,testLabName]);
        const citizenKey = ctx.stub.createCompositeKey('mednetCitizen',[citizenID,citizenName]);
        const labTestKey =ctx.stub.createCompositeKey('mednetLabtest', [testID, citizenID]);

        const labTestObject = {
            testName:testName,
            citizenKey:citizenKey,
            labKey:labKey,
            testResults: "in progress"
        }
        testLabBuffer = Buffer.from(JSON.stringify(labTestObject));
        await ctx.stub.putState(labTestKey,testLabBuffer);
        return labTestObject;
    }
    async updateLabTest (ctx, testResults,testID, citizenID){
        const labTestKey =ctx.stub.createCompositeKey('mednetLabtest', [testID, citizenID]);
        const labTestBuffer = await ctx.stub.getState(labTestKey);
        const labTestObject = JSON.parse(labTestBuffer.toString())
        labTestObject.testResults = testResults;
        const labTestBufferNew =  Buffer.from(JSON.stringify(labTestObject));
        ctx.stub.putState(labTestKey,labTestBufferNew);
        return labTestObject;
    }

}

module.exports=TestLabContract;