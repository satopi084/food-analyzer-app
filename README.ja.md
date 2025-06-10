# 食品分析・俳句生成アプリ

食品画像の栄養価分析と料理以外の画像での俳句生成を行うReactアプリケーション。

## 概要

このアプリケーションは、アップロードされた画像を自動分析し、食品の場合は栄養価分析、料理以外の場合は俳句を生成します。Google Gemini AIを活用した多機能画像解析ツールです。

## 機能

- **智能画像分析**: 食品と非食品を自動判別
- **栄養価分析**: 食品画像から詳細な栄養情報を表示（カロリー、タンパク質、炭水化物、脂質、食物繊維など）
- **俳句生成**: 料理以外の画像から日本の伝統的な5-7-5俳句を自動生成
- **健康アドバイス**: 栄養価に基づいた食生活のアドバイス提供
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **AI API**: Google Gemini 2.0 Flash
- **デプロイ**: Cloudflare Pages + Functions
- **スタイリング**: CSS3 (モダンデザイン)
- **セキュリティ**: サーバーレス関数によるAPI キー保護

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

**開発環境用**: `.env`ファイルを作成し、以下を設定：

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini API キーは [Google AI Studio](https://makersuite.google.com/app/apikey) から取得できます。

**本番環境（Cloudflare Pages）**: 
セキュリティのため、APIキーはサーバーレス関数で処理されます。

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
   - `GEMINI_API_KEY`: Gemini API キー（サーバーレス関数用）
6. 「Save and Deploy」をクリック

**重要**: セキュリティのため、本番環境では`REACT_APP_`プレフィックスを使用しません。

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
2. 画像をアップロード（ドラッグ&ドロップ対応）
3. AI による自動分析：
   - **食品画像**: 栄養価分析と健康アドバイスを表示
   - **料理以外**: 画像の内容に基づいた俳句を生成
4. 結果を確認・楽しむ

## アーキテクチャ

- **開発環境**: フロントエンドから直接Gemini API呼び出し
- **本番環境**: Cloudflare Functionsでプロキシ経由でAPI呼び出し（セキュリティ強化）

## ライセンス

MIT License