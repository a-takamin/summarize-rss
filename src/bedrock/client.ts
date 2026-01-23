// Amazon Bedrock クライアント (Claude Sonnet 4.5)

import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { Article } from "../freshrss/client.js";
import { config } from "../config.js";
import { createLogger } from "../logger.js";

const logger = createLogger("bedrock");
const client = new BedrockRuntimeClient({ region: config.bedrock.region });
const systemPrompt = `あなたはカテゴライズのプロです。ユーザーからの指示に従い、提供された記事リストを適切にカテゴライズし、Markdown で返答してください。`;

export interface SummarizeResult {
  result: string;
}

export async function summarizeArticles(
  articles: Article[],
  summarizeConfig: { prompt: string; modelId: string }
): Promise<SummarizeResult> {
  logger.debug`Summarizing ${articles.length} articles with model ${summarizeConfig.modelId}`;

  const articleList = articles
    .map(
      (article, index) =>
        `${index + 1}. [${article.feedTitle}] ${article.title}\n   URL: ${article.url}`
    )
    .join("\n\n");

  const userMessage = `${summarizeConfig.prompt}

【記事リスト】
${articleList}`;

  const command = new ConverseCommand({
    modelId: summarizeConfig.modelId,
    messages: [
      {
        role: "user",
        content: [{ text: userMessage }],
      },
    ],
    system: [{ text: systemPrompt }],
  });

  const response = await client.send(command);

  const outputText = response.output?.message?.content?.[0]?.text ?? "";
  logger.debug`AI response length: ${outputText.length} chars`;

  return {
    result: outputText,
  };
}
