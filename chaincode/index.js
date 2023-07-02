'use strict';

const RegisterationContract = require("./1-healthcare-entities.js");
const HealthRecordsContract = require("./2-healthcare-citizen-records.js")
const AppointmentContract = require("./3-appointment.js")
const MedicalPrescriptionContract = require("./4-medical-prescription.js")
const DrugRegisteration = require("./5-healthcare-add-drug.js")
const TransferDrugContract = require("./6-transfer-drug.js")
const TestLabContract = require("./7-medical-testlabs.js")
const CreateReceipt = require("./8-receipt.js")
const InsuranceClaim = require("./9-citizen-insurance.js")

module.exports.RegisterationContract = RegisterationContract;
module.exports.HealthRecordsContract = HealthRecordsContract;
module.exports.AppointmentContract = AppointmentContract;
module.exports.MedicalPrescriptionContract = MedicalPrescriptionContract;
module.exports.DrugRegisteration = DrugRegisteration;
module.exports.TransferDrugContract = TransferDrugContract;
module.exports.TestLabContract = TestLabContract;
module.exports.CreateReceipt = CreateReceipt;
module.exports.InsuranceClaim = InsuranceClaim;


module.exports.contracts = [RegisterationContract,HealthRecordsContract,AppointmentContract,MedicalPrescriptionContract,DrugRegisteration,TransferDrugContract,TestLabContract,CreateReceipt,InsuranceClaim];
