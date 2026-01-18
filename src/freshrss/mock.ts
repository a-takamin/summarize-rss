// FreshRSS モッククライアント（ローカル開発用）

import type { Article, IFreshRSSClient } from "./client.js";
import { createLogger } from "../logger.js";

const logger = createLogger("freshrss-mock");

// ローカル開発用のサンプル記事
const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-1",
    title: "Kubernetes 1.30 がリリース - 新機能まとめ",
    url: "https://example.com/k8s-1.30",
    feedTitle: "Tech News",
  },
  {
    id: "mock-2",
    title: "GitHub Actions で CI/CD パイプラインを構築する",
    url: "https://example.com/github-actions-cicd",
    feedTitle: "Tech News",
  },
  {
    id: "mock-3",
    title: "今日の晩ごはんレシピ 10 選",
    url: "https://example.com/dinner-recipes",
    feedTitle: "Cooking Daily",
  },
  {
    id: "mock-4",
    title: "Terraform 1.8 の新機能と移行ガイド",
    url: "https://example.com/terraform-1.8",
    feedTitle: "Tech News",
  },
  {
    id: "mock-5",
    title: "AWS Lambda のコールドスタートを最小化する方法",
    url: "https://example.com/lambda-cold-start",
    feedTitle: "AWS",
  },
  {
    id: "mock-6",
    title: "AWS EC2 の新しいインスタンスタイプ発表",
    url: "https://example.com/aws-ec2-new-instance-types",
    feedTitle: "AWS",
  },
  {
    id: "mock-7",
    title: "OpenTelemetry で分散トレーシングを実装する",
    url: "https://example.com/opentelemetry-tracing",
    feedTitle: "Tech News",
  },
  {
    id: "mock-8",
    title: "DevSecOps のベストプラクティス 2025",
    url: "https://example.com/devsecops-2025",
    feedTitle: "Tech News",
  },
];

export class MockFreshRSSClient implements IFreshRSSClient {
  async getMyCategories(): Promise<string[]> {
    logger.debug("Mock: Returning mock categories");
    return ["user/-/label/Tech", "user/-/label/News"];
  }

  async getUnreadArticles(_id: string): Promise<Article[]> {
    logger.debug("Mock: Returning mock articles");
    return MOCK_ARTICLES;
  }

  async markAsRead(articleIds: string[]): Promise<void> {
    logger.debug`Mock: Marking ${articleIds.length} articles as read (no-op)`;
  }
}
