// summarize-rss エントリーポイント

import type { IFreshRSSClient } from "./freshrss/client.js";
import { FreshRSSClient } from "./freshrss/freshrss.js";
import { MockFreshRSSClient } from "./freshrss/mock.js";
import { summarizeArticles } from "./bedrock/client.js";
import { sendEmail } from "./ses/client.js";
import { setupLogger, createLogger } from "./logger.js";
import { config } from "./config.js";
import { DefaultSummarizationConfigRepository } from "./summarization/summarization.js";
import { getCategoryConfig } from "./freshrss/freshRSSCategoryConfig.js";

const logger = createLogger("main");

function createFreshRSSClient(): IFreshRSSClient {
  if (config.freshrss.useMock) {
    logger.info("Using mock FreshRSS client");
    return new MockFreshRSSClient();
  }
  return new FreshRSSClient();
}

async function main(): Promise<void> {
  await setupLogger();

  logger.info("Starting summarize-rss...");
  const summarizationConfigRepository =
    new DefaultSummarizationConfigRepository();

  // FreshRSS から未読記事を取得
  logger.info("Fetching unread articles from FreshRSS...");
  const freshrss = createFreshRSSClient();
  const categories = await freshrss.getMyCategories();

  for (const category of categories) {
    logger.info`Found folder: ${category}`;
    const articles = await freshrss.getUnreadArticles(category);
    if (articles.length === 0) {
      logger.info("No unread articles. Exiting.");
      continue;
    }

    // カテゴリに対する設定を取得
    const freshRSSCategoryConfig = getCategoryConfig(category);
    if (!freshRSSCategoryConfig) {
      logger.warn`Category config not found for "${category}", skipping...`;
      continue;
    }
    const summarizeConfig = summarizationConfigRepository.get(
      freshRSSCategoryConfig.summarizeConfigID
    );
    logger.info`Using summarization config: ${freshRSSCategoryConfig.summarizeConfigID}`;

    // Bedrock で記事をカテゴリ別にまとめる
    logger.info`Summarizing ${articles.length} articles with Bedrock...`;
    const { result } = await summarizeArticles(articles, summarizeConfig);
    logger.info("Summarization complete.");

    // 3. SES でメール送信
    logger.info("Sending email via SES...");
    const title = `【${category}】本日のおすすめ記事！ (${articles.length}件)`;
    await sendEmail(title, result);
    logger.info("Email sent successfully");

    // 4. 取得した記事をすべて既読にする
    logger.info("Marking all articles as read...");
    const articleIds = articles.map((a) => a.id);
    await freshrss.markAsRead(articleIds);
    logger.info("All articles marked as read");

    logger.info("Done!");
  }
}

main().catch((error) => {
  logger.error`Error: ${error}`;
  process.exit(1);
});
