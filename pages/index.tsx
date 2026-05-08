import styles from "@/styles/Home.module.css";
import { getInstagramPosts } from "@/pages/api/instagram";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";

const QUICK_FILTERS = ["大阪", "東京", "北海道", "福岡", "名古屋", "Finland"];
const INITIAL_VISIBLE_COUNT = 12;

type Card = {
  id: string;
  username: string;
  caption: string;
  permalink: string;
  media_url: string;
  media_type: "IMAGE" | "VIDEO";
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
  media_type?: "IMAGE" | "VIDEO";
  thumbnail_url?: string;
  timestamp?: string;
};

type Props = {
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

  if (card.media_type === "IMAGE" && isValidRemoteUrl(card.media_url)) {
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
    return "タップして Instagram の投稿をチェック";
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

const getSearchTarget = (card: Card) =>
  `${card.caption} ${card.username}`.toLowerCase();

export const getStaticProps: GetStaticProps<Props> = async () => {
  let data: Card[] = [];
  let after = "";
  let hasNextPage = true;

  while (hasNextPage) {
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
    } catch (error) {
      console.error("Error fetching data:", error);
      hasNextPage = false;
    }
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
      className={styles.card}
      href={card.permalink}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.mediaFrame}>
        <div className={styles.imageShimmer} aria-hidden="true" />
        <Image
          unoptimized
          src={imageSrc}
          alt={`${card.username}の投稿`}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
          priority={index < 4}
          className={`${styles.cardImage} ${
            isLoaded ? styles.cardImageLoaded : ""
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
        <div className={styles.imageOverlay} />
        <div className={styles.mediaTopRow}>
          <span className={styles.mediaType}>
            {card.media_type === "VIDEO" ? "VIDEO" : "PHOTO"}
          </span>
          <span className={styles.openPill}>Instagram</span>
        </div>
        {card.media_type === "VIDEO" ? (
          <div className={styles.videoPill}>Play post</div>
        ) : null}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.cardUser}>@{card.username}</span>
          {publishedDate ? (
            <time dateTime={card.timestamp} className={styles.cardDate}>
              {publishedDate}
            </time>
          ) : null}
        </div>
        <p className={styles.cardCaption}>{excerpt}</p>
        <div className={styles.tagRow}>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span key={`${card.id}-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))
          ) : (
            <span className={styles.tagMuted}>気になる投稿をすぐ開けます</span>
          )}
        </div>
      </div>
    </a>
  );
}

const Home: NextPage<Props> = ({ data }) => {
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const normalizedSearchText = searchText.trim().toLowerCase();
  const filteredCards =
    normalizedSearchText.length >= 2
      ? data.filter((card) =>
          getSearchTarget(card).includes(normalizedSearchText)
        )
      : data;
  const visibleCards = filteredCards.slice(0, visibleCount);
  const videoCount = data.filter((card) => card.media_type === "VIDEO").length;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [normalizedSearchText]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Saunabouya Archive</p>
          <h1 className={styles.title}>
            さうな坊やのサウナ旅を、すばやく気持ちよく探せるアーカイブ。
          </h1>
          <p className={styles.lead}>
            施設名や地域を入力すると、気になる投稿だけをすっと絞り込めます。動画も一覧では軽いサムネイル表示にして、まず見つけやすくしました。
          </p>

          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{data.length}</span>
              <span className={styles.statLabel}>投稿アーカイブ</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{filteredCards.length}</span>
              <span className={styles.statLabel}>検索結果</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{videoCount}</span>
              <span className={styles.statLabel}>動画投稿</span>
            </div>
          </div>
        </section>

        <section className={styles.searchPanel}>
          <div className={styles.searchPanelHeader}>
            <div>
              <p className={styles.searchLabel}>Search</p>
              <p className={styles.searchHint}>
                2文字以上で絞り込み。施設名、地域名、ユーザー名の一部でも探せます。
              </p>
            </div>
            {searchText ? (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setSearchText("")}
              >
                クリア
              </button>
            ) : null}
          </div>

          <label className={styles.searchField}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className={styles.searchInput}
              placeholder="施設名や地域を入力"
              aria-label="施設名や地域を入力"
            />
          </label>

          <div className={styles.quickFilters}>
            {QUICK_FILTERS.map((filter) => {
              const isActive = searchText === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  className={`${styles.filterChip} ${
                    isActive ? styles.filterChipActive : ""
                  }`}
                  onClick={() => setSearchText(filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {filteredCards.length === 0 ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyEyebrow}>No posts found</p>
            <h2 className={styles.emptyTitle}>
              まだヒットする投稿が見つかりませんでした。
            </h2>
            <p className={styles.emptyText}>
              別の地域名や施設名で試すと、近い投稿が見つかるかもしれません。
            </p>
          </section>
        ) : (
          <section className={styles.grid}>
            {visibleCards.map((card, index) => (
              <PostCard key={card.id} card={card} index={index} />
            ))}
          </section>
        )}

        {visibleCount < filteredCards.length ? (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={() =>
                setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)
              }
            >
              もっと見る
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
