# Stack Story

GitHub技術スタック分析・可視化ツール - リポジトリの技術構成を自動解析して、インタラクティブな図表と解説記事を生成

## 🚀 機能

### コア機能
- **GitHub API連携**: パブリックリポジトリの自動分析
- **技術スタック検出**: 設定ファイルから技術・フレームワーク・依存関係を自動抽出
- **インタラクティブ可視化**: React Flowによる技術関係図の表示
- **AI記事生成**: OpenAIを使った技術解説記事の自動生成（開発中）

### サポート技術
- **JavaScript/TypeScript**: package.json, tsconfig.json
- **Python**: requirements.txt, pyproject.toml, Pipfile
- **Rust**: Cargo.toml
- **Go**: go.mod
- **Java**: pom.xml, build.gradle
- **PHP**: composer.json
- **Ruby**: Gemfile
- **Docker**: Dockerfile, docker-compose.yml

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **データベース**: PostgreSQL + Prisma
- **可視化**: React Flow
- **API**: GitHub API + OpenAI API
- **デプロイ**: Vercel

## 📦 セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/yamadatarousan/stack-story.git
cd stack-story
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`を作成して以下を設定：

```env
# GitHub API
GITHUB_TOKEN=your_github_token_here

# OpenAI API (記事生成機能用)
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stack_story"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. データベースの設定
```bash
npm run db:push
npm run db:generate
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 🧪 テスト・品質チェック

```bash
# 型チェック
npm run type-check

# リンター
npm run lint

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジレポート
npm run test:coverage

# ビルド確認
npm run build
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でアカウント作成
2. GitHubリポジトリを連携
3. 環境変数を設定：
   - `GITHUB_TOKEN`
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (Vercel Postgres)
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

### 手動デプロイ
```bash
npm run build
npm start
```

## 📊 CI/CD

GitHub Actionsによる自動化：

- **CI**: プッシュ・PR時の品質チェック（Lint、型チェック、テスト、ビルド）
- **Deploy**: mainブランチへのマージ時の自動デプロイ
- **PR Preview**: プルリクエスト時のプレビューデプロイ
- **Dependency Check**: 定期的なセキュリティ監査

## 🔧 使用方法

1. **GitHub URL入力**: 分析したいリポジトリのURLを入力
2. **自動分析**: 技術スタック・依存関係・プロジェクト構造を解析
3. **結果表示**: 検出された技術の一覧と詳細情報を表示
4. **可視化**: インタラクティブな技術関係図で探索
5. **エクスポート**: 分析結果をJSONでダウンロード

## 📋 開発ガイド

### プロジェクト構造
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   └── page.tsx           # メインページ
├── components/            # UIコンポーネント
│   ├── analyzer/          # 分析関連
│   ├── visualizer/        # 可視化関連
│   └── ui/               # 基本UIコンポーネント
├── lib/                  # ユーティリティ
│   ├── github.ts         # GitHub API
│   ├── analyzer.ts       # 分析エンジン
│   └── flow-utils.ts     # 可視化ユーティリティ
└── types/                # TypeScript型定義
```

### 開発のベストプラクティス

1. **型安全性**: 厳密なTypeScript設定
2. **コンポーネント設計**: 関数コンポーネント + hooks
3. **エラーハンドリング**: try-catch + エラーバウンダリー
4. **テスト**: Jest + Testing Library
5. **コード品質**: ESLint + Prettier

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [React Flow](https://reactflow.dev/) - 図表可視化
- [GitHub API](https://docs.github.com/en/rest) - リポジトリ情報取得
- [OpenAI API](https://openai.com/api/) - AI記事生成

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>