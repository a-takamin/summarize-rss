import type {
  SummarizationConfig,
  SummarizationConfigID,
} from "../summarization/summarization.js";

export type FreshRSSCategoryID = string;

export type FreshRSSCategoryConfig = {
  owner: string;
  summarizeConfigID: SummarizationConfigID;
};

export function getCategoryConfig(
  categoryId: FreshRSSCategoryID
): FreshRSSCategoryConfig | null {
  return FreshRSSCategoryConfigMap[categoryId] ?? null;
}

const FreshRSSCategoryConfigMap: Record<
  FreshRSSCategoryID,
  FreshRSSCategoryConfig
> = {
  "user/-/label/AWS": {
    owner: "a_takamin",
    summarizeConfigID: "aws",
  },
  "user/-/label/技術イベント": {
    owner: "a_takamin",
    summarizeConfigID: "tech-event",
  },
  "user/-/label/企業技術ブログ": {
    owner: "a_takamin",
    summarizeConfigID: "tech-company-blog",
  },
  "user/-/label/技術トレンド": {
    owner: "a_takamin",
    summarizeConfigID: "tech-trend",
  },
  "user/-/label/公式ブログ": {
    owner: "a_takamin",
    summarizeConfigID: "official-blog",
  },
};
