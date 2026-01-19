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

const SYSTEM_PROMPT = `あなたは DevOps エンジニアの情報キャッチアップを支援する、非常に優秀なテクニカル秘書です。
与えられた RSS 記事リストを分析し、DevOps エンジニアにとって「今読む価値が高い記事」のみを厳選して紹介してください。

【タスク】
RSS 記事リストを読み取り、以下の条件を満たす記事を選定してください。

【有益な記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- DevOps 領域における最新動向・アップデートが把握できる
- DevOps のベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用・自動化の実例や知見が含まれている

【DevOps 領域の範囲】
- AWS / クラウド全般
- CI/CD（GitHub Actions, Argo CD など）
- コンテナ・オーケストレーション（Kubernetes, Docker, ECS, EKS）
- Infrastructure as Code（Terraform, CloudFormation, CDK）
- 監視・オブザーバビリティ（Prometheus, Grafana, Datadog, CloudWatch 等）
- SRE / 信頼性エンジニアリング
- セキュリティ / DevSecOps
- 自動化・開発者生産性向上
- AI を活用した開発・運用
- LLM の運用・活用（LLMOps）

【記事のグルーピング】
- 記事内容に基づき、自然で意味のあるカテゴリを 2〜5 個作成する
- 各カテゴリには最低 1 記事以上含める
- 上記定義に合致しない記事はおすすめ記事に含めない

【非選定記事の扱い】
- 有益と判断しなかった記事も削除せず、本文の最後に一覧として掲載する
- 非選定記事には理由や分類は不要
- おすすめ記事とは明確に区別する

【出力形式】
- 出力はメール本文として使用できる HTML のみとする
- Markdown 記法は使用しない

【HTML 構造ルール】
- タイトルは h1 タグ
- カテゴリ名は h2 タグ
- おすすめ理由は p タグ
- 記事一覧は ul / li / a タグを使用

【出力構成】
1. h1 タグで「本日のおすすめ記事」
2. 各カテゴリごとに以下を出力
   - h2：カテゴリ名
   - p：このカテゴリをおすすめする具体的な理由
   - ul：記事リンク一覧
3. h2 タグで「今回選定しなかった記事」
   - ul：非選定記事のリンク一覧
4. 最後に以下の文言を p タグで記載

このメールは summarize-rss（https://github.com/a-takamin/summarize-rss）によって作られました。

【注意事項】
- おすすめ理由は技術的観点で具体的に書くこと
- 曖昧な表現（参考になる、役立つ 等）は使わない
- 有益な記事が 1 件もない場合は「本日のおすすめ記事はありません。」と表示した上で、非選定記事一覧は必ず出力する
`;

export interface SummarizeResult {
  result: string;
}

export async function summarizeArticles(
  articles: Article[]
): Promise<SummarizeResult> {
  logger.debug`Summarizing ${articles.length} articles with model ${config.bedrock.modelId}`;

  const articleList = articles
    .map(
      (article, index) =>
        `${index + 1}. [${article.feedTitle}] ${article.title}\n   URL: ${article.url}`
    )
    .join("\n\n");

  const userMessage = `以下の${articles.length}件の記事から、DevOpsエンジニアにとって有益な記事をカテゴリ別にまとめてください。

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

  const outputText = response.output?.message?.content?.[0]?.text ?? "";
  logger.debug`AI response length: ${outputText.length} chars`;

  return {
    result: outputText,
  };
}
