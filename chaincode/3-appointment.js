'use strict'
const { Contract } = require('fabric-contract-api'); 

class AppointmentContract extends Contract{
    constructor() {
        super('mednetAppointment');
    }
    // instantiate function
    async instantiate(ctx) {
        console.log("appointment chaincode is successfully instantiated");
    }
    async requestAppointment(ctx,citizenID,hospitalID,citizenName,specialization,age){
        if ((ctx.clientIdentity.getMSPID() == "citizenMSP")){
            //creating citizen composite key to add in appointment request
            const citizenKey= ctx.stub.createCompositeKey('mednetCitizen', [citizenID, citizenName]);
            //creating appointment request key
            const appointmentKey = ctx.stub.createCompositeKey('mednetAppointment',[specialization,citizenID])
            //creating appointment request object
            const appointmentObject = {
                citizenID: citizenID,
                citizenKey: citizenKey,
                specialization: specialization,
                citizenAge: age,
                appointmentStatus: "pending",
                hospital: hospitalID
            }
            const appointmentBuffer = Buffer.from(JSON.stringify(appointmentObject));
            await ctx.stub.putState(appointmentKey, appointmentBuffer);

            ctx.stub.setEvent("appointment request", appointmentBuffer)
            return true;
        }
        else{
            console.log("appointment request can only be raised by citizens");
        }
    }
    async confirmAppointment(ctx,hospitalID,citizenID,specialization){
        if ((ctx.clientIdentity.getMSPID() == "hospitalMSP")){
            //creating appointment composite key to fetch appointment object
            const appointmentKey = ctx.stub.createCompositeKey('mednetAppointment',[specialization,citizenID])
            //fetching appointment object
            const oldappointmentBuffer =await ctx.stub.getstate(appointmentKey);
            const appointmentObject = JSON.parse(oldappointmentBuffer.toString());
            //confirming the appointment
            if (appointmentObject.hospital===hospitalID && appointmentObject.specialization ==specialization){
                appointmentObject.appointmentStatus == "confirmed";
                const appointmentBuffer = Buffer.from(JSON.stringify(appointmentObject));
                await ctx.stub.putState(appointmentKey, appointmentBuffer);
                ctx.stub.setEvent("appointment confirmed", appointmentBuffer)
                return true;
            }
            else{
                console.log("either the hospital or the specialization doesn't match")
            }
        }
        else{
            console.log("appointment can only be confirmed by a hospital");
        }

    }
}
module.exports= AppointmentContract;

