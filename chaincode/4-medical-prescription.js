'use strict'
const{Contract} =require('fabric-contract-api'); 

class MedicalPrescriptionContract extends Contract{
    constructor() {
        super('mednetPrescription');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("prescription chaincode is successfully instantiated");
    }
    async createMedicalPrescription (ctx,citizenID,doctorID,hospitalID,prescriptionID,citizenAge,listOfTestsPrescribed,listOfDrugsPrescribed,additionalDocument){
        //validating if called by a doctor
        if (ctx.clientIdentity.getMSPID() == "doctorMSP"){
            //create composite key for medical prescription
            const prescriptionKey = ctx.stub.createCompositeKey('mednetPrescription',[citizenID,prescriptionID])
            const prescriptionObject = {
                prescriptionKey:prescriptionKey,
                citizenID: citizenID,
                doctorID: doctorID,
                hospitalID: hospitalID,
                age: citizenAge,
                tests: listOfTestsPrescribed,
                drugs : listOfDrugsPrescribed,
                document:additionalDocument,
                createdAt: ctx.stub.getTxTimestamp(),
                updatedAt: ctx.stub.getTxTimestamp(),
                lastViewedby:""
            }
            const prescriptionBuffer =  Buffer.from(JSON.stringify(prescriptionObject));
            //putState
            await ctx.stub.putState(prescriptionKey, prescriptionBuffer);
            return prescriptionObject;
        }
        else{
            console.log("medical prescriptions can only be created by doctors")
        }
    }
    async updateMedicalPrescription (ctx,citizenID,doctorID,hospitalID,prescriptionID,listOfTestsPrescribed,listOfDrugsPrescribed,additionalDocument){
        //validating if called by a doctor
        if (ctx.clientIdentity.getMSPID() == "doctorMSP"){
            //create composite key for medical prescription  to fetch the prescription object
            const prescriptionKey = ctx.stub.createCompositeKey('mednetPrescription',[citizenID,prescriptionID])
            const oldPrescriptionBuffer = await ctx.stub.getState(prescriptionKey);
            const prescriptionObject = JSON.parse(oldPrescriptionBuffer.toString());
            if (prescriptionObject.hospitalID===hospitalID && prescriptionObject.doctorID ==doctorID){
                prescriptionObject.tests =listOfTestsPrescribed;
                prescriptionObject.drugs=listOfDrugsPrescribed;
                prescriptionObject.document = additionalDocument;
                prescriptionObject.updatedAt = ctx.stub.getTxTimestamp();
                prescriptionObject.lastViewedby = "";
                const prescriptionBuffer =  Buffer.from(JSON.stringify(prescriptionObject));
                //putState
                await ctx.stub.putState(prescriptionKey, prescriptionBuffer);
                return prescriptionObject;
            }
            else{
                console.log("prescriptions can only be updated by the same doctor and hospital who created it");
            }
        }
        else{
            console.log("medical prescriptions can only be updated by doctors")
        }
    }
    async pullMedicalPrescription (ctx,citizenID,prescriptionID){
        if (ctx.clientIdentity.getMSPID() == "doctorMSP" || ctx.clientIdentity.getMSPID() == "citizenMSP" || ctx.clientIdentity.getMSPID() == "pharmacyMSP" || ctx.clientIdentity.getMSPID() == "testlabMSP"){
            //create composite key for medical prescription  to fetch the prescription object
            const prescriptionKey = ctx.stub.createCompositeKey('mednetPrescription',[citizenID,prescriptionID])
            const oldPrescriptionBuffer = await ctx.stub.getState(prescriptionKey);
            const prescriptionObject = JSON.parse(oldPrescriptionBuffer.toString());
            prescriptionObject.lastViewedby= ctx.clientIdentity.getID();
            const prescriptionBuffer =  Buffer.from(JSON.stringify(prescriptionObject));
            //putState
            await ctx.stub.putState(prescriptionKey, prescriptionBuffer);
            return prescriptionObject;
        }
        else{
            console.log("medical prescriptions can only be viewed by doctors,citizens, pharmacies or testlabs")
        }
    }
}
module.exports=MedicalPrescriptionContract;

