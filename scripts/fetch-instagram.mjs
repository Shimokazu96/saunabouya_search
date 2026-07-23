import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const businessId = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ID;

if (!accessToken || !businessId) {
  console.error(
    "Missing env: NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN or NEXT_PUBLIC_INSTAGRAM_BUSINESS_ID"
  );
  process.exit(1);
}

const FIELDS =
  "caption,media_url,media_type,thumbnail_url,permalink,timestamp,username";

async function fetchPage(after = "") {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: FIELDS,
    ...(after ? { after } : {}),
  });
  const url = `https://graph.facebook.com/v21.0/${businessId}/media?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAll() {
  const posts = [];
  let after = "";

  while (true) {
    const page = await fetchPage(after);
    posts.push(...(page.data ?? []));
    console.log(`  fetched ${posts.length} posts so far...`);

    after = page.paging?.cursors?.after ?? "";
    if (!after) break;
  }

  return posts;
}

const posts = await fetchAll();
console.log(`Total: ${posts.length} posts`);

const outDir = join(__dirname, "..", "public", "data");
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "instagram-posts.json");
writeFileSync(
  outPath,
  JSON.stringify({ updatedAt: new Date().toISOString(), data: posts }, null, 2)
);
console.log(`Saved to ${outPath}`);
