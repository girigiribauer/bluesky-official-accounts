import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Metadata } from "next";
import { ModalProvider } from "src/hooks/useModal";

import "../globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_EXTERNAL_URL ?? ""),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Bluesky 公式アカウント移行まとめ",
        alternateName: "Bluesky 公式アカウント移行まとめ",
        url: "https://bluesky-official-accounts.vercel.app/",
      },
    ],
  };

  return (
    <html lang="ja">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="theme-color" content="#e7f3ff" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://embed.bsky.app/static/embed.js"
          charSet="utf-8"
        ></script>
        <meta
          name="google-site-verification"
          content="w1ox6Vwl_FxXfyxTKWgNIkM7xnWHl7TQp1HZsrMm-O8"
        />
        <script defer src="https://analytics.girigiribauer.com/script.js" data-website-id="c8be324f-6a9c-4331-9132-3f9e49c8effa"></script>
      </head>
      <body>
        <main className="main">
          <Suspense fallback="Notion から断続的に読み込んでいます">
            <ModalProvider>{children}</ModalProvider>
          </Suspense>
        </main>
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  );
}
