import { initializeApp } from "firebase-admin/app";

initializeApp();

export { handelBillingAlert } from "./billing/billing.alert.js";
export {
  updateModelCall,
  updateModelCallDev,
} from "./models/model.callable.js";
