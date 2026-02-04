import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import { logger } from "firebase-functions/logger";

import { sendDiscordBillingMessage } from "../integrations/discord.js";
import { disableBilling, isBillingEnabled } from "./billing.service.js";
import { MIN_COST_DIF_FOR_ALERT } from "../variables/constants.js";

/**
 * Handles Google Cloud Billing budget alerts.
 *
 * Trigger:
 * - Pub/Sub topic: `projects/aide-tools/topics/billing`
 *
 * Responsibilities:
 * - Detects when billing reaches alert thresholds
 * - Sends budget notifications to Discord
 * - Enables maintenance mode when budget is exceeded
 * - Disables billing when 100% of the budget is reached
 * - Persists last reported cost to avoid spam
 *
 * Behavior:
 * - Sends incremental budget usage alerts
 * - When budget is exceeded:
 *   - Sets `application/info.maintenance = true`
 *   - Disables project billing
 *   - Sends an urgent Discord alert
 *
 * Data sources:
 * - Pub/Sub billing message
 * - Realtime DB: `/billing`
 * - Firestore: `application/info`
 *
 * Failure handling:
 * - Errors are logged
 * - Billing disable failures do not crash execution
 */
export const handelBillingAlert = onMessagePublished(
  "projects/aide-tools/topics/billing",
  async (event) => {
    const eventData = event.data.message.json;
    const billingRef = getDatabase().ref("billing");
    const billingData = (await billingRef.once("value")).val();
    let { lastReportedCost, lastReportedIntervalStart } = billingData;
    const budgetExceeded = eventData.costAmount >= eventData.budgetAmount;
    const isNewBillingCycle =
      eventData.costIntervalStart !== lastReportedIntervalStart;

    if (isNewBillingCycle) lastReportedCost = 0;

    if (
      !budgetExceeded &&
      eventData.costAmount - lastReportedCost < MIN_COST_DIF_FOR_ALERT
    )
      return;

    const promises = [];

    if (budgetExceeded) {
      await getFirestore()
        .collection("application")
        .doc("info")
        .set({ maintenance: true }, { merge: true });
      const billingEnabled = await isBillingEnabled();
      logger.debug(`Billing is enabled: ${billingEnabled}`);
      promises.push(
        sendDiscordBillingMessage(
          `**ALERT**: 100% of your budget used. Current bill: $${eventData.costAmount} ${eventData.currencyCode}`,
        ),
      );
      disableBilling();
    } else {
      const percentageUsed = Math.floor(
        (eventData.costAmount / eventData.budgetAmount) * 100,
      );
      promises.push(
        sendDiscordBillingMessage(
          `Current bill $${eventData.costAmount} ${eventData.currencyCode}. \n${percentageUsed}% of your budget`,
        ),
      );
    }

    promises.push(
      billingRef.update({
        lastReportedCost: eventData.costAmount,
        lastReportedIntervalStart: eventData.costIntervalStart,
      }),
    );

    await Promise.all(promises);
  },
);
