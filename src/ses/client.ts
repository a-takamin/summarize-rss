// Amazon SES メール送信クライアント

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const logger = createLogger("ses");
const client = new SESv2Client({ region: config.ses.region });

export async function sendEmail(title: string, body: string): Promise<void> {
  logger.debug`Sending email of ${title} articles to ${config.ses.toAddress}`;

  const command = new SendEmailCommand({
    FromEmailAddress: config.ses.fromAddress,
    Destination: {
      ToAddresses: [config.ses.toAddress],
    },
    Content: {
      Simple: {
        Subject: {
          Data: title,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: body,
            Charset: "UTF-8",
          },
          Html: {
            Data: body,
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  await client.send(command);
  logger.debug("Email sent successfully");
}
