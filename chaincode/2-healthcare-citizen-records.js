'use strict'
const { Contract } = require('fabric-contract-api'); 

class HealthRecordsContract extends Contract{
    constructor() {
        super('mednetRecords');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("health record chaincode is successfully instantiated");
    }
    async createHealthRecords (ctx,citizenID,citizenName,recordID,citizenRecordHash){
        //validate if the health record is initially created by a hospital
        if(ctx.clientIdentity.getMSPID() == "hospitalMSP"){
            //create composite key for record
            recordKey = ctx.stub.createCompositeKey('mednetRecord', [citizenID, recordID]);
            //create record object
            recordObject = {
                recordKey:recordKey,
                recordID:recordID,
                name: citizenName,
                citizenID: citizenID,
                hospital: ctx.clientIdentity.getID(),
                recordHash: citizenRecordHash,
                createdate: ctx.stub.getTxTimestamp(),
                updatedate: ctx.stub.getTxTimestamp(),
                lastviewinghospital: "",
                lastviewed: ""
            }
            //create record object buffer
            const recordBuffer = Buffer.from(JSON.stringify(recordObject));
            //putState
            await ctx.stub.putState(recordKey, recordBuffer);

            return recordObject;
        }
        else{
            console.log("records can only be created by a hospital");
        }
    }

    async updatehealthrecords (ctx,citizenID,recordID,updatedRecordHash){
        if(ctx.clientIdentity.getMSPID() == "hospitalMSP"){
            //creating composite key for record to get state
            recordKey = ctx.stub.createCompositeKey('mednetRecord', [citizenID, recordID]);
            //fetching record object
            const oldRecordBuffer = await ctx.stub.getState(recordKey);
            const recordObject = JSON.parse(oldRecordBuffer.toString());
            //updating record object
            recordObject.recordHash = updatedRecordHash;
            recordObject.updatetime = ctx.stub.getTxTimestamp()
            recordObject.hospital = ctx.clientIdentity.getID()
            //creating updated record object buffer
            const recordBuffer = Buffer.from(JSON.stringify(recordObject));
            await ctx.stub.putState(recordKey, recordBuffer);

            return recordObject;
        }
        else{
            console.log("records can only be updated by a hospital");
        }
    }
    async pullhealthrecords (ctx,citizenID){
        //validating if record is being viewed by a hospital
        if(ctx.clientIdentity.getMSPID() == "hospitalMSP"){
            //getting record composite keys using citizenID
            const recordKeyIterator = await ctx.stub.getStateByPartialCompositeKey('mednetRecord',[citizenID]);
            const recordCompKeyObject = await recordKeyIterator.next();
            const recordKey = recordCompKeyObject.value.key;
            //getting record object
            const recordObjectBuffer =await ctx.stub.getstate(recordKey);
            const recordObject = JSON.parse(recordObjectBuffer.toString());
            //updating view time in record Object
            recordObject.lastviewinghospital = ctx.clientIdentity.getID();
            recordObject.lastviewed = ctx.stub.getTxTimestamp()
            //putting updated Object state
            const recordBuffer = Buffer.from(JSON.stringify(recordObject));
            await ctx.stub.putState(recordKey, recordBuffer);
            return recordObject;
        }
        else{
            console.log("records can only be viewed by a hospital");
        }
    }
}

module.exports= HealthRecordsContract;