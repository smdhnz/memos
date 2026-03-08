# Memos KV & Image Manager

Discord風のインターフェースで、テキストや画像を自由に保存・管理できるミニマルなメモアプリです。

## 特徴

- **Discord風 UI**: メッセージと画像をシームレスに投稿できるチャットライクなインターフェース。
- **マルチメディア対応**: テキスト投稿に加え、1つのメモに複数の画像を添付可能。
- **クライアントサイド画像圧縮**: 送信前にブラウザ側で画像を FullHD (1920x1080) / WebP 形式に圧縮。巨大な画像も高速かつ安定してアップロード可能。
- **コードブロック対応**: ``` で囲った部分をコピーボタン付きの洗練されたブロックとして表示。
- **ドラッグ＆ドロップ/ペースト**: 画像ファイルを直接フィールドにドラッグしたり、クリップボードからペーストして貼り付け可能。
- **レスポンシブデザイン**:
  - **スマホ**: 削除ボタンを常時表示し、ブラウザ標準の confirm で素早く操作。
  - **PC**: ホバー時にアクションを表示し、誤操作防止のためのポップアップ確認を搭載。
- **高セキュリティ**:
  - Discord OAuth による認証。
  - ホワイトリスト形式のログイン制限（特定のユーザーIDのみ許可）。
  - Vercel Blob (Private) による画像の非公開保護。

## 技術スタック

- **Framework**: Next.js 16 (App Router / Turbopack)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Auth.js v5 (Discord Provider)
- **Storage**: Vercel Blob (Private mode)
- **Image Processing**: sharp (Server) / Canvas API (Client)
- **Env Management**: t3-env

## データベース構造

`memos` テーブル 1つで全てのデータを管理しています。

| カラム名    | 型        | 説明                                         |
| :---------- | :-------- | :------------------------------------------- |
| `id`        | uuid      | メモの一意なID。デフォルトでランダム生成。   |
| `userId`    | text      | 作成したDiscordユーザーの固定ID。            |
| `content`   | text      | メモのテキスト本文。Markdown形式をサポート。 |
| `imageUrls` | text[]    | Vercel Blobに保存された画像のURL配列。       |
| `createdAt` | timestamp | 作成日時。                                   |
| `updatedAt` | timestamp | 最終更新日時。                               |

## 環境変数の設定

`.env` ファイルを作成し、以下の項目を設定してください。

```env
# Database (Neon)
DATABASE_URL="postgresql://..."

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Authentication (Auth.js)
AUTH_SECRET="openssl rand -base64 32 等で生成"
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."

# Authorization
ALLOWED_USER_IDS="269627500211077120,..." # カンマ区切りでDiscordユーザーIDを指定
```

## 開発・セットアップ

### 依存関係のインストール

```bash
bun install
```

### データベースの同期

```bash
bun run drizzle-kit push
```

### 開発サーバーの起動

```bash
bun run dev
```

## Next.js 16 の新機能「Proxy」

このプロジェクトでは、従来の `middleware.ts` に代わり、Next.js 16 から導入された `proxy.ts` を使用して認証リダイレクトを制御しています。

## ライセンス

MIT
