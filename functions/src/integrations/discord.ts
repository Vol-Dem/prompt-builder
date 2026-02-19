export type DiscordMessage = {
  username: string;
  content: string;
  avatar_url: string;
};

/**
 * Sends a notification to Discord.
 * @param {string} webhookUrl - Discord webhook URL.
 * @param {{username: string, content: string, avatar_url: string}} data - Message data.
 */
export const sendDiscordMessage = async (
  webhookUrl: string,
  data: DiscordMessage,
) => {
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

/**
 * Sends a billing notification to Discord.
 * @param {string} message - Message.
 */
export const sendDiscordBillingMessage = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) return;

  await sendDiscordMessage(webhookUrl, {
    username: "Firebase Billing",
    content: message,
    avatar_url:
      "https://firebase.google.com/static/images/brand-guidelines/logo-logomark.png",
  });
};
