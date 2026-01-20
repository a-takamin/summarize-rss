# summarize-rss

RSS フィードから未読記事を取得し、AI で分析・要約してメール配信してくれるツール。

## 機能

- **FreshRSS 連携**: FreshRSS から未読記事を取得し、処理後に既読化
  - ※ 一応 FreshRSS 以外でも GReader API に対応していれば動く
- **AI 記事分析**: Amazon Bedrock を使って有益そうな記事を選定・分類
- **メール配信**: Amazon SES で要約メールを送信

## 処理フロー

```
FreshRSS (未読記事取得)
    ↓
Amazon Bedrock (AI分析・カテゴリ分類・HTML生成)
    ↓
Amazon SES (メール送信)
    ↓
FreshRSS (記事を既読化)
```

## ロードマップ

やりたいことは Project に書きます。

## Contribute について

public にしていますが自分用のアプリケーションなため、基本的に受け付けていません。
