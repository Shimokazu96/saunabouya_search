import { getInstagramPosts } from "@/pages/api/instagram";
import fs from "fs/promises";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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
const PAGE_TITLE = "関西のサウナ・銭湯投稿検索｜さうな坊や";
const SITE_NAME = "さうな坊やの投稿検索";

const getPageDescription = (count: number) =>
  `大阪・京都・兵庫を中心に、さうな坊やが実際に訪問したサウナ・銭湯のInstagram投稿${count}件を、施設名や地域名から検索できます。`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const CANONICAL_URL = "https://search.saunabouya.com/";
const OGP_IMAGE_URL = "https://search.saunabouya.com/apple-touch-icon.png";
const QUICK_SEARCH_AREAS = ["大阪", "兵庫", "京都"] as const;

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
  lastUpdatedAt: string | null;
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

const getWebsiteStructuredData = (description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL || "https://search.saunabouya.com",
  description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${
      SITE_URL || "https://search.saunabouya.com"
    }/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

const getStructuredData = (data: Card[], description: string) => {
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
    description,
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
    const devData = cachedData.slice(0, DEV_MAX_POSTS);
    return {
      props: {
        data: devData,
        lastUpdatedAt: devData[0]?.timestamp ?? null,
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
      const responseData = (error as { response?: { data?: unknown } })
        ?.response?.data;
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
      lastUpdatedAt: data[0]?.timestamp ?? null,
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

const Home: NextPage<Props> = ({ data, lastUpdatedAt }) => {
  const router = useRouter();
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
  const pageDescription = getPageDescription(data.length);
  const structuredData = getStructuredData(data, pageDescription);
  const websiteStructuredData = getWebsiteStructuredData(pageDescription);
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [normalizedSearchText]);

  useEffect(() => {
    const q = router.query.q;
    if (typeof q === "string" && q) {
      setSearchText(q);
    }
  }, [router.query.q]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    void router.replace(
      value ? { pathname: "/", query: { q: value } } : "/",
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:locale" content="ja_JP" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:image" content={OGP_IMAGE_URL} />
        <meta name="twitter:image" content={OGP_IMAGE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center py-6 sm:py-10">
        <div className="flex w-full max-w-6xl flex-col gap-5 px-4 sm:gap-6">
          <header className="flex flex-col gap-6 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="whitespace-nowrap text-xs font-semibold text-boya-navy/62 sm:tracking-[0.16em]">
                  さうな坊や サウナ投稿アーカイブ
                </p>
                <Link
                  href="/about"
                  className="shrink-0 whitespace-nowrap text-xs font-medium text-boya-navy/55 transition hover:text-boya-navy"
                >
                  さうな坊やについて
                </Link>
              </div>
              <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-semibold tracking-tight text-boya-navy">
                関西のサウナ・銭湯投稿を検索
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-boya-ink/80 sm:text-base">
                さうな坊やが実際に訪問したサウナ・銭湯のInstagram投稿を、施設名や地域名から検索できます。大阪・京都・兵庫を中心に、東京など全国各地の投稿を掲載しています。
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-boya-navy/55">
                <span>運営：大阪在住のサウナ系クリエイター「さうな坊や」</span>
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">✓</span>
                  実際に訪問した施設のみ掲載
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
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
                    onChange={(event) => handleSearch(event.target.value)}
                    className="w-full border-0 bg-transparent text-base text-boya-navy outline-none placeholder:text-boya-navy/42"
                    placeholder="施設名・地域名を入力"
                    aria-label="施設名や地域を入力"
                  />
                </span>
                <p className="text-xs text-boya-navy/45">
                  例：大阪、京都、神戸
                </p>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_SEARCH_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleSearch(area)}
                    className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                      searchText === area
                        ? "bg-boya-navy text-white"
                        : "bg-boya-mist text-boya-navy hover:bg-boya-sand"
                    }`}
                  >
                    {area}
                  </button>
                ))}
                {searchText ? (
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-boya-line px-3.5 py-1.5 text-sm font-medium text-boya-navy/55 transition hover:bg-boya-mist"
                    onClick={() => handleSearch("")}
                  >
                    クリア
                  </button>
                ) : null}
              </div>
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
                {hasKeywordFilter
                  ? `${filteredCards.length}件を表示中`
                  : `Instagram投稿 ${data.length}件を掲載`}
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

        <footer className="mt-4 w-full max-w-6xl px-4 pb-6">
          <div className="flex flex-col items-center gap-2 border-t border-boya-line pt-4">
            <nav
              className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-boya-navy/45"
              aria-label="SNSリンク"
            >
              <a
                href="https://www.instagram.com/sauna_bouya/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-boya-navy"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@sauna_bouya"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-boya-navy"
              >
                TikTok
              </a>
              <a
                href="https://www.youtube.com/@sauna_bouya"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-boya-navy"
              >
                YouTube
              </a>
              <Link href="/about" className="transition hover:text-boya-navy">
                さうな坊やについて
              </Link>
            </nav>
            {lastUpdatedAt ? (
              <p className="text-[11px] text-boya-navy/35">
                最終更新 {formatDate(lastUpdatedAt)}
              </p>
            ) : null}
          </div>
        </footer>
      </main>
    </>
  );
};

export default Home;
