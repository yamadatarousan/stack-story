# Vercelデプロイガイド

## 🚀 本番環境へのデプロイ手順

### 1. Vercelアカウントの準備

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubアカウントと連携

### 2. データベースの設定

#### Vercel Postgresの作成
1. Vercelダッシュボードで新しいプロジェクトを作成
2. 「Storage」タブで「Create Database」→「Postgres」を選択
3. データベース名: `stack-story-db`
4. リージョン: Tokyo (nrt1)

#### 環境変数の自動設定
Vercel Postgresを作成すると以下の環境変数が自動設定されます：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`

### 3. 必要な環境変数の設定

Vercelプロジェクトの「Settings」→「Environment Variables」で以下を設定：

#### 必須の環境変数
```bash
# GitHub API Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# NextAuth設定
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
```

#### オプションの環境変数
```bash
# OpenAI API Key (記事生成機能用)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. GitHub Actionsの設定

#### Vercelトークンの設定
1. Vercel → Settings → Tokens で新しいトークンを作成
2. GitHub リポジトリの Settings → Secrets and variables → Actions で以下を設定：

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### Organization IDとProject IDの取得
```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトディレクトリでログイン
vercel login

# IDを取得
vercel ls
```

### 5. データベースのマイグレーション

#### 本番データベースの初期化
```bash
# 本番環境のDATABASE_URLを使用
DATABASE_URL="your_vercel_postgres_url" npx prisma db push

# または
DATABASE_URL="your_vercel_postgres_url" npx prisma migrate deploy
```

### 6. デプロイの実行

#### 手動デプロイ
```bash
# Vercel CLIでデプロイ
vercel --prod
```

#### 自動デプロイ
- `main`ブランチにプッシュすると自動でデプロイされます
- GitHub Actionsが設定済みです

### 7. 環境変数の例

#### 開発環境 (.env.local)
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL="postgresql://username:password@localhost:5432/stack_story"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret
```

#### 本番環境 (Vercel)
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POSTGRES_URL=postgresql://... (Vercelが自動設定)
POSTGRES_PRISMA_URL=postgresql://... (Vercelが自動設定)
POSTGRES_URL_NON_POOLING=postgresql://... (Vercelが自動設定)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
```

## 🔧 トラブルシューティング

### データベース接続エラー
```bash
# Prismaクライアントの再生成
npx prisma generate

# データベースの状態確認
npx prisma db push --preview-feature
```

### ビルドエラー
```bash
# 依存関係の確認
npm ci

# TypeScript型チェック
npm run type-check

# ローカルビルドテスト
npm run build
```

### 環境変数が反映されない
1. Vercelダッシュボードで環境変数を確認
2. デプロイ後の再デプロイを実行
3. 環境変数の値にスペースや特殊文字が含まれていないか確認

### GitHub Actionsが失敗する
1. リポジトリのSecretsが正しく設定されているか確認
2. Vercelトークンの権限を確認
3. ワークフローファイルの文法エラーをチェック

## 📊 パフォーマンス最適化

### 本番環境での推奨設定
1. **リージョン**: Asia-Northeast (Tokyo)
2. **Function Region**: nrt1
3. **データベース**: Connection Poolingを有効化
4. **イメージ最適化**: Next.jsの自動最適化を活用

### モニタリング
1. Vercel Analytics を有効化
2. エラー監視の設定
3. パフォーマンスメトリクスの確認

## 🔄 継続的デプロイメント

### ブランチ戦略
- `main`: 本番環境
- `develop`: ステージング環境（オプション）
- `feature/*`: プレビューデプロイ

### デプロイフロー
1. Feature ブランチでプレビューデプロイ
2. プルリクエストでコードレビュー
3. `main`ブランチマージで本番デプロイ

## 📋 デプロイ後のチェックリスト

- [ ] アプリケーションが正常に動作する
- [ ] データベース接続が正常
- [ ] GitHub API連携が動作する
- [ ] エラーログに問題がない
- [ ] パフォーマンスが適切
- [ ] SSL証明書が正常
- [ ] カスタムドメインの設定（必要に応じて）

## 🔐 セキュリティ

### 本番環境でのセキュリティ設定
1. 環境変数の適切な管理
2. APIトークンの定期的な更新
3. データベースアクセスの制限
4. HTTPS の強制
5. セキュリティヘッダーの設定

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>