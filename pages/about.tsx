import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const BIO_LINES = [
  "📣 関西を中心に実際に訪れて良かった所を紹介します！",
  "✈️ 2023/10に10日間フィンランド行ってきたよ",
  "🧑‍💻 大阪在住/20代/Webエンジニア",
];

const ACTIVITY_AREAS = [
  { label: "大阪", note: "中心" },
  { label: "東京" },
  { label: "北海道" },
  { label: "フィンランド", note: "海外" },
];

const SNS_LINKS = [
  {
    name: "Instagram",
    handle: "@saunabouya",
    url: "https://www.instagram.com/saunabouya/",
  },
  {
    name: "X",
    handle: "@saunabouya",
    url: "https://x.com/saunabouya",
  },
  {
    name: "TikTok",
    handle: "@saunabouya",
    url: "https://www.tiktok.com/@saunabouya",
  },
  {
    name: "YouTube",
    handle: "さうな坊や",
    url: "https://www.youtube.com/@saunabouya",
  },
];

const About: NextPage = () => {
  const pageTitle = "さうな坊やについて | さうな坊やの投稿検索";
  const pageDescription =
    "さうな坊やのプロフィールと活動地域、SNSをご紹介します。関西を中心にサウナ施設を実際に訪れてレポートしています。";
  const ogImageUrl = SITE_URL ? `${SITE_URL}/apple-touch-icon.png` : "";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:locale" content="ja_JP" />
        <meta name="twitter:card" content="summary" />
        {SITE_URL ? (
          <link rel="canonical" href={`${SITE_URL}/about`} />
        ) : null}
        {SITE_URL ? (
          <meta property="og:url" content={`${SITE_URL}/about`} />
        ) : null}
        {ogImageUrl ? (
          <meta property="og:image" content={ogImageUrl} />
        ) : null}
        {ogImageUrl ? (
          <meta name="twitter:image" content={ogImageUrl} />
        ) : null}
      </Head>
      <main className="flex min-h-screen flex-col items-center py-6 sm:py-10">
        <div className="flex w-full max-w-2xl flex-col gap-5 px-4 sm:gap-6">
          <header className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-boya-mist px-3.5 py-1.5 text-sm font-medium text-boya-navy/70 transition hover:bg-boya-sand"
            >
              ← 投稿検索に戻る
            </Link>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/62">
                About
              </p>
              <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-semibold tracking-tight text-boya-navy">
                さうな坊やについて
              </h1>
            </div>
          </header>

          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-boya-navy">
              さうな坊やとは
            </h2>
            <ul className="flex flex-col gap-3">
              {BIO_LINES.map((line) => (
                <li
                  key={line}
                  className="text-sm leading-7 text-boya-ink sm:text-base"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-boya-navy">活動地域</h2>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_AREAS.map(({ label, note }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-boya-mist px-3.5 py-1.5 text-sm font-medium text-boya-navy/78"
                >
                  {label}
                  {note ? (
                    <span className="text-[11px] text-boya-navy/50">{note}</span>
                  ) : null}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-boya-navy">SNS</h2>
            <div className="flex flex-col gap-3">
              {SNS_LINKS.map(({ name, handle, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-boya-line px-5 py-4 transition hover:border-boya-navy/20 hover:bg-boya-mist"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-boya-navy">
                      {name}
                    </span>
                    <span className="text-xs text-boya-navy/55">{handle}</span>
                  </div>
                  <span className="text-sm text-boya-navy/40 transition group-hover:text-boya-navy/70">
                    →
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default About;
