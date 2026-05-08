# さうな坊やの投稿検索

Instagram 投稿を地域名やキーワードで探せる Next.js アプリです。

## 開発

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認できます。

## 主要ファイル

- `pages/index.tsx`
  一覧ページと検索 UI
- `lib/instagramMetadata.ts`
  投稿キャプションやハッシュタグから施設名・地域情報を抽出
- `pages/api/instagram.ts`
  Instagram Graph API 取得処理

## ビルド

```bash
npm run build
```

ローカル環境によっては `graph.facebook.com` に到達できず、投稿取得でフォールバックログが出ることがありますが、キャッシュがあればビルドは継続できます。
