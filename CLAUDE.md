# Claude開発ガイド - Stack-Story

## 🎯 プロジェクト概要
GitHubリポジトリの技術スタック分析 + AI記事生成ツール - 技術構成図の可視化から解説記事まで一貫生成

## 🚨 設計上の重大な問題と対策

### 現在の問題
1. **OpenAI API依存**: メイン機能（リポジトリ要約分析）がOpenAI APIに依存している
2. **API制限対応不備**: レート制限・コスト制限・キー未設定時の対策が不十分
3. **フォールバック品質**: API失敗時のフォールバック処理が意味のない結果を返す

### 設計原則の再定義
```
絶対原則: ユーザーが意味のある結果を得られない機能は提供してはならない

OpenAI API利用時の必須考慮事項:
1. APIキー未設定時 → 機能無効化 or 明確なエラー表示
2. レート制限到達時 → 適切な待機 or 代替手段提示  
3. コスト制限考慮 → 使用量制限 or ユーザー選択制
4. API障害時 → ルールベース代替 or 機能停止
```

### 正しいアーキテクチャ
```
メイン機能: OpenAI API使用（高品質AI要約）
  ↓ 失敗時
代替機能: ルールベース分析（品質は劣るが意味のある結果）
  ↓ 失敗時  
エラー表示: 「現在分析できません」（無意味な結果は返さない）
```

## 🏗️ 技術スタック
- **フレームワーク**: Next.js 14 + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **データベース**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **認証**: NextAuth.js
- **API連携**: GitHub API + OpenAI API
- **可視化**: React Flow / Mermaid.js
- **デプロイ**: Vercel

## 📋 開発ルール

### コマンド実行ルール
```bash
# 開発環境
npm run dev         # 開発サーバー起動
npm run build       # プロダクションビルド
npm run start       # プロダクションサーバー起動

# コード品質
npm run lint        # ESLint実行
npm run type-check  # TypeScript型チェック
npm run format      # Prettier実行

# データベース
npx prisma generate # Prismaクライアント生成
npx prisma db push  # スキーマ反映
npx prisma studio   # データベースGUI

# テスト
npm run test        # Jest実行
npm run test:watch  # テスト監視モード
```

### コード規約
1. **TypeScript**: 厳密な型定義必須
2. **コンポーネント**: 関数コンポーネント + hooks
3. **ファイル命名**: kebab-case（コンポーネントはPascalCase）
4. **import順**: 外部ライブラリ → 内部モジュール → 相対パス
5. **エラーハンドリング**: try-catch + エラーバウンダリー

### Git運用
- コミット前に必ず`npm run lint`と`npm run type-check`実行
- コミットメッセージは日本語でOK
- featureブランチで開発、mainにマージ

## 📁 プロジェクト構造
```
stack-story/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── analyze/       # リポジトリ分析API
│   │   │   ├── generate/      # 記事生成API
│   │   │   └── auth/          # 認証API
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── analyze/           # 分析ページ
│   │   └── layout.tsx         # レイアウト
│   ├── components/            # UIコンポーネント
│   │   ├── ui/               # Shadcn/ui コンポーネント
│   │   ├── analyzer/         # 分析関連コンポーネント
│   │   ├── visualizer/       # 可視化コンポーネント
│   │   └── editor/           # 記事編集コンポーネント
│   ├── lib/                  # ユーティリティ
│   │   ├── github.ts         # GitHub API
│   │   ├── openai.ts         # OpenAI API
│   │   ├── analyzer.ts       # 技術スタック分析
│   │   └── db.ts             # Prisma クライアント
│   ├── types/                # TypeScript型定義
│   └── utils/                # ヘルパー関数
├── prisma/                   # Prismaスキーマ
├── public/                   # 静的ファイル
└── CLAUDE.md                 # このファイル
```

## 🚀 開発優先順位

### Phase 1: 基本機能実装
1. ✅ プロジェクト初期化・CLAUDE.md作成
2. 🔄 Next.js + TypeScriptセットアップ
3. 🔄 PostgreSQL + Prisma設定
4. 🔄 基本UI構築（Tailwind + Shadcn/ui）
5. 🔄 GitHub API連携

### Phase 2: 分析機能
1. 🔄 リポジトリ情報取得
2. 🔄 package.json/依存関係解析
3. 🔄 技術スタック特定ロジック
4. 🔄 React Flow技術構成図生成
5. 🔄 データベース保存機能

### Phase 3: AI記事生成
1. 🔄 OpenAI API連携
2. 🔄 技術解説記事生成
3. 🔄 記事編集・プレビュー機能
4. 🔄 Markdown/HTML出力
5. 🔄 記事保存・管理

### Phase 4: UX向上・追加機能
1. 🔄 認証機能（NextAuth.js）
2. 🔄 ダッシュボード
3. 🔄 分析履歴管理
4. 🔄 記事テンプレート
5. 🔄 ソーシャル共有機能

## 🎯 現在の開発状況
- ✅ プロジェクト初期化
- ✅ CLAUDE.md作成
- 🔄 Next.js環境構築

## 🔧 使用例（予定）
```bash
# 基本的な使用フロー
1. GitHubリポジトリURL入力
2. 技術スタック自動分析
3. 構成図生成・表示
4. AI記事生成・編集
5. 記事保存・共有

# 分析可能な技術
- JavaScript/TypeScript (package.json)
- Python (requirements.txt, pyproject.toml)
- Java (pom.xml, build.gradle)
- Go (go.mod)
- Rust (Cargo.toml)
- PHP (composer.json)
- Ruby (Gemfile)
```

## 🎯 実装予定機能

### コア機能
- [x] プロジェクト初期化
- [ ] GitHub API連携
- [ ] 技術スタック分析エンジン
- [ ] React Flow可視化
- [ ] OpenAI記事生成
- [ ] 記事編集機能

### データベース設計
- [ ] User（ユーザー）
- [ ] Repository（リポジトリ）
- [ ] Analysis（分析結果）
- [ ] Article（生成記事）
- [ ] Template（記事テンプレート）

### UI/UX機能
- [ ] レスポンシブデザイン
- [ ] ダークモード対応
- [ ] 可視化インタラクション
- [ ] 記事プレビュー
- [ ] 分析進捗表示

### 高度な機能
- [ ] 複数リポジトリ一括分析
- [ ] カスタム記事テンプレート
- [ ] 技術トレンド分析
- [ ] 記事品質評価
- [ ] SEO最適化

## 🚨 ハマり検出・回避ルール

### 自動アラート条件
Claudeは以下を検出したら**必ず🚨アラートを出すこと**：

1. **同じファイルを4回以上連続編集**
2. **同じエラーパターンが3回以上出現**  
3. **ユーザーが「まだ」「また」「やっぱり」を使用**
4. **複数のデバッグアプローチを試しても15分以上解決しない**
5. **API制限やレート制限で5分以上待機**

### アラート文言
「🚨 ハマり検出: 別のAI(GPT-4/Gemini)に相談するか、アプローチを変更しませんか？現在のアプローチを見直して、よりシンプルな解決策を探しましょう。」

### 強制実行ルール
- このルールは他の開発ルールと同等の優先度で**必ず実行する**
- アラート後は必ずユーザーに方針転換を提案する
- 「もっとシンプルな方法はありませんか？」を積極的に提案する

## 🏆 目標パフォーマンス
- **分析速度**: 中規模リポジトリ 30秒以内
- **記事生成**: 2000文字程度 60秒以内
- **Lighthouse**: 90点以上
- **分析精度**: 主要技術90%以上検出

## 🔧 設計思想
- **直感的**: 技術者でなくても理解できるUI
- **高品質**: 実際のブログ記事として使える品質
- **拡張性**: 新しい技術・言語への対応が容易
- **効率性**: 一度の分析で複数の成果物を生成

## 🔗 環境変数
```env
# GitHub API
GITHUB_TOKEN=your_github_token

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🔧 次のタスク
1. Next.js + TypeScriptプロジェクト初期化
2. PostgreSQL + Prisma設定
3. 基本UI構築（Tailwind + Shadcn/ui）
4. GitHub API連携実装
5. 技術スタック分析ロジック実装