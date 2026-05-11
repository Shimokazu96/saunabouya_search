import { getInstagramPosts } from "@/pages/api/instagram";
import fs from "fs/promises";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import path from "path";
import { useEffect, useState } from "react";

const INITIAL_VISIBLE_COUNT = 12;
const CACHE_MAX_AGE_MS = 1000 * 60 * 60;
const DEV_MAX_PAGES = 1;
const DEV_MAX_POSTS = 24;
const INSTAGRAM_CACHE_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "instagram-posts.json"
);
const PAGE_TITLE = "さうな坊やの投稿検索 | サウナ施設・地域別アーカイブ";
const PAGE_DESCRIPTION =
  "さうな坊やのInstagram投稿を施設名や地域名で検索できるアーカイブページです。大阪・東京・北海道などのサウナ情報を見やすく一覧できます。";
const SITE_NAME = "さうな坊やの投稿検索";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

type Card = {
  id: string;
  username: string;
  caption: string;
  permalink: string;
  media_url: string;
  media_type: InstagramMediaType;
  thumbnail_url: string;
  timestamp: string;
};

type InstagramPostsResponse = {
  data: InstagramPost[];
  paging?: {
    cursors?: {
      after?: string;
    };
  };
};

type InstagramPost = {
  id?: string;
  username?: string;
  caption?: string;
  permalink?: string;
  media_url?: string;
  media_type?: InstagramMediaType;
  thumbnail_url?: string;
  timestamp?: string;
};

type Props = {
  data: Card[];
};

type InstagramCache = {
  updatedAt: number;
  data: Card[];
};

const isValidRemoteUrl = (value: string) => value.startsWith("http");

const normalizeCard = (post: InstagramPost): Card | null => {
  if (!post.permalink || !post.media_type) {
    return null;
  }

  return {
    id: post.id ?? post.permalink,
    username: post.username ?? "saunabouya",
    caption: post.caption ?? "",
    permalink: post.permalink,
    media_url: post.media_url ?? "",
    media_type: post.media_type,
    thumbnail_url: post.thumbnail_url ?? "",
    timestamp: post.timestamp ?? "",
  };
};

const getImageSource = (card: Card) => {
  if (card.media_type === "VIDEO" && isValidRemoteUrl(card.thumbnail_url)) {
    return card.thumbnail_url;
  }

  if (
    (card.media_type === "IMAGE" || card.media_type === "CAROUSEL_ALBUM") &&
    isValidRemoteUrl(card.media_url)
  ) {
    return card.media_url;
  }

  if (isValidRemoteUrl(card.thumbnail_url)) {
    return card.thumbnail_url;
  }

  if (isValidRemoteUrl(card.media_url)) {
    return card.media_url;
  }

  return "/noimage.png";
};

const extractTags = (caption: string) => {
  return Array.from(new Set(caption.match(/#[^\s#]+/g) ?? [])).slice(0, 3);
};

const getExcerpt = (caption: string) => {
  const compact = caption
    .replace(/#[^\s#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) {
    return "気になった投稿をそのまま Instagram で確認できます。";
  }

  return compact.length > 84 ? `${compact.slice(0, 84)}...` : compact;
};

const formatDate = (timestamp: string) => {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
};

const getStructuredData = (data: Card[]) => {
  const topPosts = data.slice(0, 8).map((card, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: card.permalink,
    name: getExcerpt(card.caption),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    inLanguage: "ja",
    ...(SITE_URL ? { url: SITE_URL } : {}),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: topPosts,
    },
  };
};

const readInstagramCache = async () => {
  try {
    const cacheFile = await fs.readFile(INSTAGRAM_CACHE_PATH, "utf8");
    const parsed = JSON.parse(cacheFile) as InstagramCache;

    if (Date.now() - parsed.updatedAt > CACHE_MAX_AGE_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const writeInstagramCache = async (data: Card[]) => {
  try {
    await fs.mkdir(path.dirname(INSTAGRAM_CACHE_PATH), { recursive: true });
    await fs.writeFile(
      INSTAGRAM_CACHE_PATH,
      JSON.stringify({
        updatedAt: Date.now(),
        data,
      } satisfies InstagramCache)
    );
  } catch (error) {
    console.error("Failed to write Instagram cache:", error);
  }
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const cachedData = await readInstagramCache();

  if (process.env.NODE_ENV === "development" && cachedData) {
    return {
      props: {
        data: cachedData.slice(0, DEV_MAX_POSTS),
      },
      revalidate: 60,
    };
  }

  let data: Card[] = [];
  let after = "";
  let hasNextPage = true;
  let pageCount = 0;
  const maxPages =
    process.env.NODE_ENV === "development"
      ? DEV_MAX_PAGES
      : Number.POSITIVE_INFINITY;

  while (hasNextPage && pageCount < maxPages) {
    try {
      const response = (await getInstagramPosts(
        after
      )) as InstagramPostsResponse;
      const normalizedCards = response.data
        .map(normalizeCard)
        .filter((card): card is Card => card !== null);

      data = data.concat(normalizedCards);
      after = response.paging?.cursors?.after ?? "";
      hasNextPage = Boolean(after);
      pageCount += 1;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const responseData = (
        error as { response?: { data?: unknown } }
      )?.response?.data;
      console.error(
        "Error fetching Instagram data:",
        errorMessage,
        responseData ?? ""
      );
      hasNextPage = false;
    }
  }

  if (data.length > 0) {
    await writeInstagramCache(data);
  } else if (cachedData) {
    data =
      process.env.NODE_ENV === "development"
        ? cachedData.slice(0, DEV_MAX_POSTS)
        : cachedData;
  }

  if (process.env.NODE_ENV === "development") {
    data = data.slice(0, DEV_MAX_POSTS);
  }

  return {
    props: {
      data,
    },
    revalidate: 3600,
  };
};

function PostCard({ card, index }: { card: Card; index: number }) {
  const [imageSrc, setImageSrc] = useState(getImageSource(card));
  const [isLoaded, setIsLoaded] = useState(false);
  const tags = extractTags(card.caption);
  const excerpt = getExcerpt(card.caption);
  const publishedDate = formatDate(card.timestamp);

  return (
    <a
      href={card.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-boya-line bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-boya-navy/20 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-boya-mist">
        <div
          className="bg-media-shimmer animate-shimmer absolute inset-0"
          aria-hidden="true"
        />
        <Image
          unoptimized
          src={imageSrc}
          alt={`${card.username}の投稿`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
          priority={index < 4}
          className={`object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoadingComplete={() => setIsLoaded(true)}
          onError={() => {
            if (imageSrc !== "/noimage.png") {
              setImageSrc("/noimage.png");
            } else {
              setIsLoaded(true);
            }
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-boya-navy/20 to-transparent" />
        {card.media_type === "VIDEO" ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-boya-navy shadow-sm">
            動画
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-boya-navy/70">
          <span className="truncate font-semibold text-boya-navy/88">
            @{card.username}
          </span>
          {publishedDate ? (
            <time dateTime={card.timestamp} className="shrink-0">
              {publishedDate}
            </time>
          ) : null}
        </div>
        <p className="min-h-[3.6em] text-sm leading-6 text-boya-ink">
          {excerpt}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={`${card.id}-${tag}`}
                className="inline-flex items-center rounded-full bg-boya-mist px-2.5 py-1 text-[11px] font-medium text-boya-navy/78"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center rounded-full bg-boya-blush px-2.5 py-1 text-[11px] font-medium text-boya-navy/65">
              投稿を開いて詳しく見る
            </span>
          )}
        </div>
        <span className="inline-flex text-sm font-semibold text-boya-navy transition group-hover:text-boya-navy/80">
          Instagramで見る
        </span>
      </div>
    </a>
  );
}

const Home: NextPage<Props> = ({ data }) => {
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const normalizedSearchText = searchText
    .normalize("NFKC")
    .trim()
    .toLowerCase();
  const hasKeywordFilter = normalizedSearchText.length >= 2;
  const filteredCards = hasKeywordFilter
    ? data.filter((card) =>
        card.caption.toLowerCase().includes("#" + normalizedSearchText)
      )
    : data;
  const visibleCards = filteredCards.slice(0, visibleCount);
  const resultTitle = hasKeywordFilter
    ? `「${searchText.trim()}」の結果`
    : "すべての投稿";
  const structuredData = getStructuredData(data);
  const ogImageUrl = SITE_URL ? `${SITE_URL}/apple-touch-icon.png` : "";

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [normalizedSearchText]);

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:locale" content="ja_JP" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        {SITE_URL ? <link rel="canonical" href={SITE_URL} /> : null}
        {SITE_URL ? <meta property="og:url" content={SITE_URL} /> : null}
        {ogImageUrl ? <meta property="og:image" content={ogImageUrl} /> : null}
        {ogImageUrl ? <meta name="twitter:image" content={ogImageUrl} /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center py-6 sm:py-10">
        <div className="flex w-full max-w-6xl flex-col gap-5 px-4 sm:gap-6">
          <header className="flex flex-col gap-6 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/62">
                Saunabouya Archive
              </p>
              <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-semibold tracking-tight text-boya-navy">
                さうな坊やの投稿を
                <br className="sm:hidden" />
                見やすく検索
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-boya-ink/80 sm:text-base">
                施設名や地域名で過去の投稿を探せる一覧です。気になる投稿を見つけたら、そのまま
                Instagram で確認できます。
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="flex w-full flex-col gap-2 sm:max-w-md">
                <span className="text-sm font-medium text-boya-navy/90">
                  キーワード
                </span>
                <span className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-boya-line bg-boya-mist px-4 py-3 transition focus-within:border-boya-navy/40 focus-within:ring-4 focus-within:ring-boya-sand">
                  <span
                    className="text-lg text-boya-navy/48"
                    aria-hidden="true"
                  >
                    ⌕
                  </span>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="w-full border-0 bg-transparent text-base text-boya-navy outline-none placeholder:text-boya-navy/42"
                    placeholder="例: 心斎橋 / 梅田 / 施設名"
                    aria-label="施設名や地域を入力"
                  />
                </span>
              </label>
              {searchText ? (
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-boya-mist px-4 py-2 text-sm font-medium text-boya-navy transition hover:bg-boya-sand"
                  onClick={() => setSearchText("")}
                >
                  クリア
                </button>
              ) : null}
            </div>
          </header>

          <section
            className="flex flex-col gap-5"
            aria-labelledby="results-heading"
          >
            <div className="flex flex-col gap-2">
              <h2
                id="results-heading"
                className="text-[1.35rem] font-semibold text-boya-navy"
              >
                {resultTitle}
              </h2>
              <p className="text-sm text-boya-ink/80 sm:text-base">
                {filteredCards.length}件を表示しています。
              </p>
            </div>

            {filteredCards.length === 0 ? (
              <div className="flex flex-col gap-3 rounded-[28px] border border-boya-line bg-white px-6 py-10 text-center shadow-sm sm:px-8">
                <h3 className="text-xl font-semibold text-boya-navy">
                  該当する投稿が見つかりませんでした。
                </h3>
                <p className="text-sm leading-7 text-boya-ink/80 sm:text-base">
                  別の地域名や施設名で試すと、近い投稿が見つかるかもしれません。
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                aria-label="投稿一覧"
              >
                {visibleCards.map((card, index) => (
                  <PostCard key={card.id} card={card} index={index} />
                ))}
              </div>
            )}

            {visibleCount < filteredCards.length ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-boya-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2b3366]"
                  onClick={() =>
                    setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)
                  }
                >
                  もっと見る
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
