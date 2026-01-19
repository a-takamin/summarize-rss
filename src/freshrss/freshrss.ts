import { config } from "../config.js";
import { createLogger } from "../logger.js";
import type { Article, IFreshRSSClient } from "./client.js";

const logger = createLogger("freshrss");

interface StreamContentsResponse {
  items: Array<{
    id: string;
    title: string;
    canonical: Array<{ href: string }>;
    origin: { title: string };
  }>;
}

export class FreshRSSClient implements IFreshRSSClient {
  private authToken: string | null = null;

  private async authenticate(): Promise<string> {
    if (this.authToken) {
      return this.authToken;
    }

    logger.debug("Authenticating with FreshRSS...");
    const response = await fetch(
      `${config.freshrss.baseUrl}/api/greader.php/accounts/ClientLogin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          Email: config.freshrss.username,
          Passwd: config.freshrss.password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`FreshRSS authentication failed: ${response.status}`);
    }

    const text = await response.text();
    const authLine = text.split("\n").find((line) => line.startsWith("Auth="));
    if (!authLine) {
      throw new Error("FreshRSS authentication response missing Auth token");
    }

    this.authToken = authLine.replace("Auth=", "");
    logger.debug("Authentication successful");
    return this.authToken;
  }

  async getMyCategories(): Promise<string[]> {
    const token = await this.authenticate();

    logger.debug("Fetching my categories...");

    const response = await fetch(
      `${config.freshrss.baseUrl}/api/greader.php/reader/api/0/tag/list?output=json`,
      {
        headers: {
          Authorization: `GoogleLogin auth=${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    // 自分が定義したフォルダは type="folder" で取得できる
    const data = await response.json();
    const tags: string[] = data.tags
      .filter((tag: unknown) => (tag as { type: string }).type === "folder")
      .map((tag: unknown) => (tag as { id: string }).id);

    return tags;
  }

  async getUnreadArticles(id: string): Promise<Article[]> {
    const token = await this.authenticate();

    logger.debug("Fetching unread articles...");
    const alreadyReadArticles = `user/-/state/com.google/read`;
    const response = await fetch(
      `${config.freshrss.baseUrl}/api/greader.php/reader/api/0/stream/contents/${id}?xt=${alreadyReadArticles}&n=1000`,
      {
        headers: {
          Authorization: `GoogleLogin auth=${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unread articles: ${response.status}`);
    }

    const data = (await response.json()) as StreamContentsResponse;

    return data.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.canonical[0]?.href ?? "",
      feedTitle: item.origin.title,
    }));
  }

  async markAsRead(articleIds: string[]): Promise<void> {
    if (articleIds.length === 0) {
      logger.debug("No articles to mark as read");
      return;
    }

    logger.debug`Marking ${articleIds.length} articles as read...`;
    const token = await this.authenticate();

    // トークンを取得
    const tokenResponse = await fetch(
      `${config.freshrss.baseUrl}/api/greader.php/reader/api/0/token`,
      {
        headers: {
          Authorization: `GoogleLogin auth=${token}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get edit token: ${tokenResponse.status}`);
    }

    const editToken = await tokenResponse.text();

    // 既読にする
    const body = new URLSearchParams();
    body.append("a", "user/-/state/com.google/read");
    body.append("T", editToken);
    for (const id of articleIds) {
      body.append("i", id);
    }

    const response = await fetch(
      `${config.freshrss.baseUrl}/api/greader.php/reader/api/0/edit-tag`,
      {
        method: "POST",
        headers: {
          Authorization: `GoogleLogin auth=${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark articles as read: ${response.status}`);
    }
  }
}
