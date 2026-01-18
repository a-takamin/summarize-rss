// summarize-rss エントリーポイント

import type { IFreshRSSClient } from "./freshrss/client.js";
import { FreshRSSClient } from "./freshrss/freshrss.js";
import { MockFreshRSSClient } from "./freshrss/mock.js";
import { filterArticles } from "./bedrock/client.js";
import { sendEmail } from "./ses/client.js";
import { setupLogger, createLogger } from "./logger.js";
import { config } from "./config.js";

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

  // 1. FreshRSS から未読記事を取得
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

    // 2. Bedrock で記事を選別
    logger.info("Filtering articles with Bedrock...");
    const { selectedArticles } = await filterArticles(articles);
    logger.info`Selected ${selectedArticles.length} articles`;
    
    // 3. SES でメール送信
    logger.info("Sending email via SES...");
    await sendEmail(selectedArticles);
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
