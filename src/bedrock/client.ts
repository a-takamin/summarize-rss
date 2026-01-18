// Amazon Bedrock クライアント (Claude 4.5 Haiku)

import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { Article } from "../freshrss/client.js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const logger = createLogger("bedrock");
const client = new BedrockRuntimeClient({ region: config.bedrock.region });

const SYSTEM_PROMPT = `あなたは DevOps エンジニアのアシスタントです。
与えられた RSS 記事のタイトル一覧から、DevOps エンジニアにとって有益そうな記事を選別してください。

選別基準:
- Kubernetes, Docker, コンテナ技術
- CI/CD, GitHub Actions
- Infrastructure as Code (Terraform, CloudFormation, aws-cdk など)
- クラウド (AWS のみ)
- 監視、ロギング、オブザーバビリティ
- セキュリティ、DevSecOps
- SRE、信頼性エンジニアリング
- 自動化、効率化、生産性向上
- LLM-as-a-Judge

出力形式:
選別した記事の番号をカンマ区切りで出力してください。
例: 1,3,5,7

有益な記事がない場合は「なし」と出力してください。`;

export interface FilterResult {
  selectedArticles: Article[];
  unselectedArticles: Article[];
}

export async function filterArticles(articles: Article[]): Promise<FilterResult> {
  if (articles.length === 0) {
    logger.debug("No articles to filter");
    return { selectedArticles: [], unselectedArticles: [] };
  }

  logger.debug`Filtering ${articles.length} articles with model ${config.bedrock.modelId}`;
  const articleList = articles
    .map((article, index) => `${index + 1}. ${article.title}`)
    .join("\n");

  const userMessage = `以下の記事タイトルから、DevOps エンジニアにとって有益そうな記事を選別してください。

${articleList}`;

  const command = new ConverseCommand({
    modelId: config.bedrock.modelId,
    messages: [
      {
        role: "user",
        content: [{ text: userMessage }],
      },
    ],
    system: [{ text: SYSTEM_PROMPT }],
  });

  const response = await client.send(command);

  const outputText =
    response.output?.message?.content?.[0]?.text ?? "";

  if (outputText === "なし" || outputText.trim() === "") {
    logger.debug("No relevant articles found by AI");
    return { selectedArticles: [], unselectedArticles: articles };
  }

  logger.debug`AI response: ${outputText}`;
  // 番号をパースして記事を選択
  const selectedIndices = outputText
    .split(",")
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => !isNaN(i) && i >= 0 && i < articles.length);

  const selectedIndexSet = new Set(selectedIndices);
  const selectedArticles = selectedIndices
    .map((i) => articles[i])
    .filter((a): a is Article => a !== undefined);
  const unselectedArticles = articles.filter(
    (_, i) => !selectedIndexSet.has(i)
  );

  return { selectedArticles, unselectedArticles };
}
