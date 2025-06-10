# 食品分析アプリ

食品の栄養価や成分を分析するReactアプリケーション。

## 概要

このアプリケーションは、食品の写真を撮影またはアップロードして栄養価を分析し、健康的な食生活をサポートします。

## 機能

- 食品画像の認識と分析
- 栄養価の表示（カロリー、タンパク質、炭水化物、脂質など）
- 食品データベースの検索
- 食事記録の管理
- 栄養摂取量の追跡

## 技術スタック

- React 18 + TypeScript
- Google Gemini 2.5 Flash API
- Cloudflare Pages
- CSS3 (モダンデザイン)

## セットアップ

### 前提条件

- Node.js (v16以上)
- npm または yarn
- Google Gemini API キー

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/satopi084/food-analyzer-app.git
cd food-analyzer-app

# 依存関係をインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してGemini API keyを設定
```

### 環境変数設定

`.env`ファイルを作成し、以下を設定：

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API キーは [Google AI Studio](https://makersuite.google.com/app/apikey) から取得できます。

### 開発サーバー起動

```bash
npm start
# http://localhost:3000 でアクセス
```

## Cloudflare Pages デプロイ

### 自動デプロイ（推奨）

1. [Cloudflare Pages](https://pages.cloudflare.com/) にログイン
2. 「Create a project」→「Connect to Git」を選択
3. GitHubリポジトリを選択
4. ビルド設定：
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (デフォルト)
5. 環境変数を設定：
   - `REACT_APP_GEMINI_API_KEY`: Gemini API キー
6. 「Save and Deploy」をクリック

### 手動デプロイ

```bash
# プロダクションビルド
npm run build

# Wrangler CLI でデプロイ（オプション）
npm install -g wrangler
wrangler pages deploy build
```

## 使い方

1. アプリケーションにアクセス
2. 料理の写真をアップロード（ドラッグ&ドロップ対応）
3. Gemini AIによる栄養価分析を実行
4. 栄養価情報と食生活アドバイスを確認

## ライセンス

MIT License