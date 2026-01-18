// Amazon SES メール送信クライアント

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { Article } from "../freshrss/client.js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const logger = createLogger("ses");
const client = new SESv2Client({ region: config.aws.region });

function buildEmailBody(articles: Article[]): string {
  if (articles.length === 0) {
    return "本日のおすすめ記事はありませんでした。";
  }

  const articleList = articles
    .map(
      (article) =>
        `- [${article.feedTitle}] ${article.title}\n  ${article.url}`
    )
    .join("\n\n");

  return `本日のおすすめ記事 (${articles.length}件)

${articleList}

---
このメールは summarize-rss により自動送信されました。`;
}

function buildEmailHtml(articles: Article[]): string {
  if (articles.length === 0) {
    return "<p>本日のおすすめ記事はありませんでした。</p>";
  }

  const articleList = articles
    .map(
      (article) =>
        `<li>
          <strong>[${escapeHtml(article.feedTitle)}]</strong>
          <a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a>
        </li>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <h2>本日のおすすめ記事 (${articles.length}件)</h2>
  <ul>
    ${articleList}
  </ul>
  <hr>
  <p style="color: #666; font-size: 12px;">
    このメールは summarize-rss により自動送信されました。
  </p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmail(articles: Article[]): Promise<void> {
  logger.debug`Sending email with ${articles.length} articles to ${config.ses.toAddress}`;
  const command = new SendEmailCommand({
    FromEmailAddress: config.ses.fromAddress,
    Destination: {
      ToAddresses: [config.ses.toAddress],
    },
    Content: {
      Simple: {
        Subject: {
          Data: `[RSS] 本日のおすすめ記事 (${articles.length}件)`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: buildEmailBody(articles),
            Charset: "UTF-8",
          },
          Html: {
            Data: buildEmailHtml(articles),
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  await client.send(command);
  logger.debug("Email sent successfully");
}
