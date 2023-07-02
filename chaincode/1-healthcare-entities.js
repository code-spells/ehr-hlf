'use strict'
const { Contract } = require('fabric-contract-api'); 

class RegisterationContract extends Contract {
    constructor() {
        super('mednetRegistration');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("registration chaincode is successfully instantiated");
    }
    /*entityID is the unique id provided to each peer of all organizations, also making it part 
    of a particular entitytype. entityName is the name of the organization(name of hospital, path
    labs, drug manufacturer,trasporter, pharmacy and insurer),similarly there's citizenID and doctorID*/

    async registerEntity(ctx, entityID, entityName, entityType,location){
        //creating composite key for entity registration
        const entityKey = ctx.stub.createCompositeKey('mednetEntity', [entityID, entityName]);
        //creating entity object
        const entityObject  = {
            entityID: entityID,
            entityKey : entityKey,
            name: entityName,
            type: entityType,
            location:location
        }
        //creating entityObject buffer
        const entityBuffer = Buffer.from(JSON.stringify(entityObject));
        //putState
        await ctx.stub.putState(entityKey, entityBuffer);

        return entityObject;
    }
    async registerCitizen(ctx, citizenID, citizenName, citizenAge ,domicile, insuranceEntityID, insurerName, insuranceLimit){
        //creating composite key for citizen registration
        const citizenKey = ctx.stub.createCompositeKey('mednetCitizen', [citizenID, citizenName]);
        //creating insurance company key
        const InsurerKey = ctx.stub.createCompositeKey('mednetEntity', [insuranceEntityID, insurerName]);
        //creating citizen object
        const citizenObject  = {
            citizenID: citizenID,
            citizenKey : citizenKey,
            name: citizenName,
            age: citizenAge,
            domicile: domicile,
            insurerName: insurerName,
            insurerKey: InsurerKey,
            insuranceLimit: insuranceLimit
        }
        //creating citizenObject buffer
        const citizenBuffer = Buffer.from(JSON.stringify(citizenObject));
        //putState
        await ctx.stub.putState(citizenKey, citizenBuffer);

        return citizenObject;
    }
    async registerDoctor(ctx,hospitalID,hospitalName,doctorID,doctorName,doctorSpecialization){
        if(ctx.clientIdentity.getMSPID() == "hospitalMSP"){
            //creating composite key for doctoc's registration
            const doctorKey = ctx.stub.createCompositeKey('mednetDoctor', [doctorID, doctorName]);
            //creating composite key for  hospital
            const hospitalKey = ctx.stub.createCompositeKey('mednetEntity', [hospitalID,hospitalName]);
            //creating doctorOject
            const doctorObject = {
                doctorID: doctorID,
                doctorKey: doctorKey,
                name: doctorName,
                hospitalkey: hospitalKey,
                specialization: doctorSpecialization
            }
            //creating doctorObject Buffer
            const doctorBuffer = Buffer.from(JSON.stringify(doctorObject));
            //putState
            await ctx.stub.putState(doctorKey, doctorBuffer);
            return doctorObject;
        }
        else{
            console.log("doctors can only be registered by hospitals");
        }
    }
    async registerSpecialization (ctx,hospitalID,listofdoctorIDs,specialization){
        if(ctx.clientIdentity.getMSPID() == "hospitalMSP"){
            //creating composite key for specialization registration
            const specializationKey = ctx.stub.createCompositeKey('mednetSpecialization', [hospitalID, specialization]);
            //fetching hospital compositekey using hospitalID
            const hospitalKeyIterator = await ctx.stub.getStateByPartialCompositeKey('mednetEntity',[hospitalID]);
            const hospitalCompKeyObject = await hospitalKeyIterator.next();
            //creating specialization object
            const specializationObject = {
                specializationKey: specializationKey,
                specialization: specialization,
                listofdoctors: listofdoctorIDs,
                hospitalkey: hospitalCompKeyObject.value.key
            }
            //creating specialization object buffer
            const specializationBuffer = Buffer.from(JSON.stringify(specializationObject));
            //putState
            await ctx.stub.putState(specializationKey, specializationBuffer);
            return specializationObject;
        }
        else{
            console.log("specializations can only be registered by hospitals");
        }
    }
}
module.exports= RegisterationContract;