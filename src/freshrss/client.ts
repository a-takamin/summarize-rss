// FreshRSS クライアントのインターフェースと型定義

export interface Article {
  id: string;
  title: string;
  url: string;
  feedTitle: string;
}

export interface IFreshRSSClient {
  getMyCategories(): Promise<string[]>;
  getUnreadArticles(id: string): Promise<Article[]>;
  markAsRead(articleIds: string[]): Promise<void>;
}
