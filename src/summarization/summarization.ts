import { parseArgs } from "node:util";
import type { BedrockModelID } from "../bedrock/model.js";
import { MODEL } from "../bedrock/model.js";

export type SummarizationConfigID =
  | "aws"
  | "tech-event"
  | "tech-company-blog"
  | "tech-trend"
  | "official-blog";

export type SummarizationConfig = {
  prompt: string;
  modelId: BedrockModelID;
};

export interface SummarizationConfigRepository {
  get(id: SummarizationConfigID): SummarizationConfig;
}

export class DefaultSummarizationConfigRepository implements SummarizationConfigRepository {
  get(id: SummarizationConfigID): SummarizationConfig {
    const config = SummarizationConfigMap[id];
    if (!config) {
      throw new Error(`Unknown SummarizationConfigID: ${id}`);
    }
    return config;
  }
}

// いつか外部に出すかも。
const SummarizationConfigMap: Record<
  SummarizationConfigID,
  SummarizationConfig
> = {
  aws: {
    prompt: `【タスク】
RSS 記事リストを読み取り、DevOps, SRE エンジニアにとって「読む価値が高い記事」のみを厳選して紹介してください。

【読む価値が高い記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- AWS の最新アップデート・新機能情報が把握できる
- DevOps 領域にまつわるサービスのベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用の実例や知見が学べる

【DevOps・SRE 領域の範囲】
- CI/CD (CodeBuild など)
- コンテナ・オーケストレーション（ECS, EKS）
- Infrastructure as Code（CloudFormation, aws-cdk）
- 監視・オブザーバビリティ（CloudWatch など）
- SRE / 信頼性エンジニアリング
- セキュリティ・ガバナンス（SecurityHub, TrustedAdvisor, GuardDuty など）
- 自動化・開発者生産性向上（Kiro, その他自動化など）

【記事のグルーピング】
- 記事内容に基づき、自然で意味のあるカテゴリを数個作成する
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
`,
    modelId: MODEL.CLAUDE_SONNET_4_5.id,
  },
  "tech-event": {
    prompt: `【タスク】
RSS 記事リストを読み取り、DevOps, SRE エンジニアにとって「読む価値が高い記事」のみを厳選して紹介してください。

【読む価値が高い記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- DevOps・SRE 領域における最新動向・アップデートが把握できる
- DevOps・SRE のベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用・自動化の実例や知見が含まれている

【DevOps・SRE 領域の範囲】
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
- 記事内容に基づき、自然で意味のあるカテゴリを数個作成する
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
`,
    modelId: MODEL.CLAUDE_SONNET_4_5.id,
  },
  "tech-company-blog": {
    prompt: `【タスク】
RSS 記事リストを読み取り、DevOps, SRE エンジニアにとって「読む価値が高い記事」のみを厳選して紹介してください。

【読む価値が高い記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- DevOps・SRE 領域における最新動向・アップデートが把握できる
- DevOps・SRE のベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用・自動化の実例や知見が含まれている

【DevOps・SRE 領域の範囲】
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
- 記事内容に基づき、自然で意味のあるカテゴリを数個作成する
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
`,
    modelId: MODEL.CLAUDE_SONNET_4_5.id,
  },
  "tech-trend": {
    prompt: `DevOps エンジニアにとって「今読む価値が高い記事」のみを厳選して紹介してください。

【タスク】
RSS 記事リストを読み取り、以下の条件を満たす記事を選定してください。

【有益な記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- DevOps・SRE 領域における最新動向・アップデートが把握できる
- DevOps・SRE のベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用・自動化の実例や知見が含まれている

【DevOps・SRE 領域の範囲】
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
`,
    modelId: MODEL.CLAUDE_SONNET_4_5.id,
  },
  "official-blog": {
    prompt: `DevOps エンジニアにとって「今読む価値が高い記事」のみを厳選して紹介してください。

【タスク】
RSS 記事リストを読み取り、以下の条件を満たす記事を選定してください。

【有益な記事の定義】
次のいずれかに明確に該当するもののみを対象とします。

- DevOps・SRE 領域における最新動向・アップデートが把握できる
- DevOps・SRE のベストプラクティス、実践的ノウハウ、具体的な導入・運用事例が学べる
- AI / LLM を活用した開発・運用・自動化の実例や知見が含まれている

【DevOps・SRE 領域の範囲】
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
`,
    modelId: MODEL.CLAUDE_SONNET_4_5.id,
  },
};
