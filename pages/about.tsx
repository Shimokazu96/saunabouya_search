import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://search.saunabouya.com";

const BIO_LINES = [
  { icon: "📣", text: "実際に訪れて良かったサウナ・銭湯だけを紹介しています" },
  { icon: "✈️", text: "2023/10に10日間フィンランドへ遠征" },
  { icon: "🧑‍💻", text: "大阪在住/Webエンジニア" },
];

const SITE_FEATURES = [
  { icon: "🔍", text: "施設名や地域名でInstagram投稿を検索できる" },
  { icon: "🗾", text: "大阪・神戸・東京など地域別に絞り込める" },
  { icon: "📸", text: "気になる投稿はそのままInstagramで確認できる" },
];

const CENTRAL_AREAS = ["大阪", "兵庫", "京都"];

type SnsIcon = "instagram" | "tiktok" | "youtube" | "email";

const SNS_LINKS: Array<{
  name: string;
  handle: string;
  url: string;
  icon: SnsIcon;
  external: boolean;
}> = [
  {
    name: "Instagram",
    handle: "@sauna_bouya",
    url: "https://www.instagram.com/sauna_bouya/",
    icon: "instagram",
    external: true,
  },
  {
    name: "TikTok",
    handle: "@sauna_bouya",
    url: "https://www.tiktok.com/@sauna_bouya",
    icon: "tiktok",
    external: true,
  },
  {
    name: "YouTube",
    handle: "@sauna_bouya",
    url: "https://www.youtube.com/@sauna_bouya",
    icon: "youtube",
    external: true,
  },
  {
    name: "メール",
    handle: "saunabouya@gmail.com",
    url: "mailto:saunabouya@gmail.com",
    icon: "email",
    external: false,
  },
];

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.25 8.25 0 004.84 1.54V7c-.94 0-1.82-.26-2.57-.31z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconLine() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

const snsIcons: Record<SnsIcon, React.ReactNode> = {
  instagram: <IconInstagram />,
  tiktok: <IconTikTok />,
  youtube: <IconYouTube />,
  email: <IconEmail />,
};

const About: NextPage = () => {
  const pageTitle = "さうな坊やについて | さうな坊やの投稿検索";
  const pageDescription =
    "さうな坊やは大阪在住のサウナクリエイター。関西を中心に全国各地のサウナ・銭湯をInstagram・TikTokで紹介しています。";
  const ogImageUrl = `${SITE_URL}/saunabouya-avatar.png`;

  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "さうな坊や",
    alternateName: "sauna_bouya",
    description:
      "大阪在住。大阪・京都・兵庫を拠点に、関西を中心に全国各地のサウナ・銭湯を巡るクリエイター。Instagramで400件以上の投稿を掲載。",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/saunabouya-avatar.png`,
    email: "saunabouya@gmail.com",
    homeLocation: { "@type": "Place", name: "大阪府" },
    sameAs: [
      "https://www.instagram.com/sauna_bouya/",
      "https://www.tiktok.com/@sauna_bouya",
      "https://www.youtube.com/@sauna_bouya",
    ],
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personStructuredData),
          }}
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center py-6 sm:py-10">
        <div className="flex w-full max-w-2xl flex-col gap-5 px-4 sm:gap-6">
          {/* 戻るリンク */}
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-boya-navy/65 shadow-sm ring-1 ring-boya-line transition hover:bg-boya-mist"
          >
            ← 投稿検索に戻る
          </Link>

          {/* プロフィールカード */}
          <div className="overflow-hidden rounded-[28px] border border-boya-line bg-white shadow-sm">
            <div className="h-28 bg-boya-navy" />
            <div className="flex flex-col items-center px-6 pb-7 text-center">
              <div className="-mt-14 overflow-hidden rounded-full border-4 border-white shadow-sm">
                <Image
                  src="/saunabouya-avatar.png"
                  alt="さうな坊やのアイコン"
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              </div>
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-boya-navy">
                  さうな坊や
                </h1>
                <p className="text-sm text-boya-navy/50">@sauna_bouya</p>
                <p className="mt-1 text-sm leading-6 text-boya-ink/75">
                  関西を中心に全国の
                  <br className="sm:hidden" />
                  サウナ・銭湯を巡るクリエイター
                </p>
              </div>
              <div className="mt-6 flex w-full items-center divide-x divide-boya-line border-t border-boya-line pt-6">
                <div className="flex flex-1 flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-boya-navy">
                    400+
                  </span>
                  <span className="text-xs text-boya-navy/50">
                    Instagram投稿数
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5">
                  <span className="text-base font-semibold text-boya-navy">
                    大阪在住
                  </span>
                  <span className="text-xs text-boya-navy/50">活動拠点</span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-0.5">
                  <span className="text-base font-semibold text-boya-navy">
                    全国
                  </span>
                  <span className="text-xs text-boya-navy/50">活動範囲</span>
                </div>
              </div>
            </div>
          </div>

          {/* さうな坊やとは */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                Profile
              </p>
              <h2 className="text-lg font-semibold text-boya-navy">
                さうな坊やとは
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-7 text-boya-ink sm:text-base">
                大阪在住のサウナクリエイター。大阪・京都・兵庫を拠点に関西を中心としながら、北海道から九州まで全国各地のサウナ・銭湯を実際に訪れて紹介しています。
              </p>
              <p className="text-sm leading-7 text-boya-ink sm:text-base">
                Instagramでは累計
                <strong className="font-semibold text-boya-navy">
                  400件以上
                </strong>
                の投稿を掲載しています。
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {BIO_LINES.map(({ icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-4 rounded-2xl bg-boya-mist px-4 py-3.5"
                >
                  <span className="mt-0.5 shrink-0 text-xl leading-none">
                    {icon}
                  </span>
                  <span className="text-sm leading-7 text-boya-ink sm:text-base">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* このサイトについて */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                About Site
              </p>
              <h2 className="text-lg font-semibold text-boya-navy">
                このサイトについて
              </h2>
            </div>
            <p className="text-sm leading-7 text-boya-ink sm:text-base">
              Instagramでは過去の投稿を遡るのが難しいという声をもとに、施設名や地域名でさうな坊やの投稿を検索できるアーカイブサイトを作りました。
            </p>
            <ul className="flex flex-col gap-3">
              {SITE_FEATURES.map(({ icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-4 rounded-2xl bg-boya-mist px-4 py-3.5"
                >
                  <span className="mt-0.5 shrink-0 text-xl leading-none">
                    {icon}
                  </span>
                  <span className="text-sm leading-7 text-boya-ink sm:text-base">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-boya-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-boya-cocoa"
            >
              投稿を検索する →
            </Link>
          </section>

          {/* 活動地域 */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                Area
              </p>
              <h2 className="text-lg font-semibold text-boya-navy">活動地域</h2>
            </div>
            <p className="text-sm leading-7 text-boya-ink sm:text-base">
              大阪・京都・兵庫を中心とした関西が活動の拠点です。北海道から九州まで、全国各地にも積極的に遠征しています。
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-boya-navy/50">
                  拠点エリア
                </p>
                <div className="flex flex-wrap gap-2">
                  {CENTRAL_AREAS.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center rounded-full bg-boya-navy px-3.5 py-1.5 text-sm font-medium text-white"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-boya-navy/50">
                  活動範囲
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-boya-mist px-3.5 py-1.5 text-sm font-medium text-boya-navy/78">
                  全国各地
                </span>
              </div>
            </div>
          </section>

          {/* SNS */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                  Social
                </p>
                <h2 className="text-lg font-semibold text-boya-navy">SNS</h2>
              </div>
              <span className="rounded-full bg-boya-mist px-3 py-1 text-xs font-medium text-boya-navy/60">
                公式アカウント
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SNS_LINKS.map(({ name, handle, url, icon, external }) => (
                <a
                  key={name}
                  href={url}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-boya-line px-4 py-5 text-center transition hover:border-boya-navy/20 hover:bg-boya-mist"
                >
                  <span className="text-boya-navy/65 transition group-hover:text-boya-navy">
                    {snsIcons[icon]}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-boya-navy">
                      {name}
                    </span>
                    <span className="break-all text-xs text-boya-navy/50">
                      {handle}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* LINEスタンプ */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                LINE
              </p>
              <h2 className="text-lg font-semibold text-boya-navy">
                LINEスタンプ
              </h2>
            </div>
            <p className="text-sm leading-7 text-boya-ink sm:text-base">
              さうな坊やのオリジナルLINEスタンプを販売中です。ぜひご利用ください！
            </p>
            <a
              href="https://store.line.me/stickershop/product/32850881/ja"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border border-boya-line px-5 py-4 transition hover:border-boya-navy/20 hover:bg-boya-mist"
            >
              <span className="text-boya-navy/65 transition group-hover:text-boya-navy">
                <IconLine />
              </span>
              <span className="text-sm font-semibold text-boya-navy">
                LINEスタンプを見る
              </span>
            </a>
          </section>

          {/* PR・取材依頼 */}
          <section className="flex flex-col gap-5 rounded-[28px] border border-boya-line bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-boya-navy/50">
                Contact
              </p>
              <h2 className="text-lg font-semibold text-boya-navy">
                PR・取材依頼
              </h2>
            </div>
            <p className="text-sm leading-7 text-boya-ink sm:text-base">
              PR・取材・コラボレーションのご依頼はインスタのDMまたはメールにてお気軽にお問い合わせください。
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/sauna_bouya/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-2xl border border-boya-line px-5 py-4 transition hover:border-boya-navy/20 hover:bg-boya-mist"
              >
                <span className="text-boya-navy/65 transition group-hover:text-boya-navy">
                  <IconInstagram />
                </span>
                <span className="text-sm font-semibold text-boya-navy">
                  @sauna_bouya にDM
                </span>
              </a>
              <a
                href="mailto:saunabouya@gmail.com"
                className="group inline-flex items-center gap-3 rounded-2xl border border-boya-line px-5 py-4 transition hover:border-boya-navy/20 hover:bg-boya-mist"
              >
                <span className="text-boya-navy/65 transition group-hover:text-boya-navy">
                  <IconEmail />
                </span>
                <span className="text-sm font-semibold text-boya-navy">
                  saunabouya@gmail.com
                </span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default About;
