// Amazon SES メール送信クライアント

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { Article } from "../freshrss/client.js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const logger = createLogger("ses");
const client = new SESv2Client({ region: config.ses.region });

function buildArticleList(articles: Article[]): string {
  return articles
    .map(
      (article) =>
        `- [${article.feedTitle}] ${article.title}\n  ${article.url}`
    )
    .join("\n\n");
}

function buildEmailBody(
  selectedArticles: Article[],
  unselectedArticles: Article[]
): string {
  let body = "";

  if (selectedArticles.length > 0) {
    body += `■ おすすめ記事 (${selectedArticles.length}件)\n\n`;
    body += buildArticleList(selectedArticles);
  } else {
    body += "■ おすすめ記事\n\n本日のおすすめ記事はありませんでした。";
  }

  if (unselectedArticles.length > 0) {
    body += `\n\n■ その他の記事 (${unselectedArticles.length}件)\n\n`;
    body += buildArticleList(unselectedArticles);
  }

  body += `\n\n---\nこのメールは summarize-rss により自動送信されました。`;
  return body;
}

function buildArticleListHtml(articles: Article[]): string {
  return articles
    .map(
      (article) =>
        `<li>
          <strong>[${escapeHtml(article.feedTitle)}]</strong>
          <a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a>
        </li>`
    )
    .join("\n");
}

function buildEmailHtml(
  selectedArticles: Article[],
  unselectedArticles: Article[]
): string {
  let selectedSection = "";
  if (selectedArticles.length > 0) {
    selectedSection = `
      <h2>おすすめ記事 (${selectedArticles.length}件)</h2>
      <ul>${buildArticleListHtml(selectedArticles)}</ul>`;
  } else {
    selectedSection = `
      <h2>おすすめ記事</h2>
      <p>本日のおすすめ記事はありませんでした。</p>`;
  }

  let unselectedSection = "";
  if (unselectedArticles.length > 0) {
    unselectedSection = `
      <h2 style="color: #666;">その他の記事 (${unselectedArticles.length}件)</h2>
      <ul style="color: #666;">${buildArticleListHtml(unselectedArticles)}</ul>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  ${selectedSection}
  ${unselectedSection}
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

export async function sendEmail(
  selectedArticles: Article[],
  unselectedArticles: Article[]
): Promise<void> {
  const totalCount = selectedArticles.length + unselectedArticles.length;
  logger.debug`Sending email with ${selectedArticles.length} selected, ${unselectedArticles.length} unselected articles to ${config.ses.toAddress}`;
  const command = new SendEmailCommand({
    FromEmailAddress: config.ses.fromAddress,
    Destination: {
      ToAddresses: [config.ses.toAddress],
    },
    Content: {
      Simple: {
        Subject: {
          Data: `[RSS] 本日の記事 (おすすめ${selectedArticles.length}件 / 全${totalCount}件)`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: buildEmailBody(selectedArticles, unselectedArticles),
            Charset: "UTF-8",
          },
          Html: {
            Data: buildEmailHtml(selectedArticles, unselectedArticles),
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  await client.send(command);
  logger.debug("Email sent successfully");
}
