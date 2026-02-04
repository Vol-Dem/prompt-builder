import { CloudBillingClient } from "@google-cloud/billing";
import { logger } from "firebase-functions/logger";

import { PROJECT_NAME } from "../variables/constants.js";

const billing = new CloudBillingClient();

/**
 * Checks whether billing is enabled.
 */
export const isBillingEnabled = async () => {
  try {
    const [res] = await billing.getProjectBillingInfo({
      name: PROJECT_NAME,
    });

    logger.debug(`Billing INfo string: ${JSON.stringify(res)}`);
    return res.billingEnabled;
  } catch (err) {
    logger.error(
      `Unable to determine if billing is enabled on specified project, assuming billing is enabled ${err}`,
    );
    return false;
  }
};

/**
 * Disables billing.
 */
export const disableBilling = async () => {
  try {
    const billingEnabled = await isBillingEnabled();
    if (!billingEnabled) return;
    const [res] = await billing.updateProjectBillingInfo({
      name: PROJECT_NAME,
      projectBillingInfo: { billingAccountName: "" }, // Disable billing
    });

    logger.debug(`Billing successfully disabled ${JSON.stringify(res)}`);
  } catch (err) {
    logger.error(`Something went wrong while disabling billing: ${err}`);
  }
};
