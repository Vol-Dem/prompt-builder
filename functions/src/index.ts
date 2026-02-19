import { initializeApp } from "firebase-admin/app";

initializeApp();

export { handelBillingAlert } from "./billing/billing.alert";
export { updateModelCall, updateModelCallDev } from "./models/model.callable";
