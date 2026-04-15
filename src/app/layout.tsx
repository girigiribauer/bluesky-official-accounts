import Script from "next/script";
import { Suspense } from "react";
import { Metadata } from "next";
import { ModalProvider } from "src/components/ModalProvider";
import { ModalContents } from "src/components/ModalContents";

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
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/css/all.min.css" />
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#e7f3ff" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
<meta
          name="google-site-verification"
          content="w1ox6Vwl_FxXfyxTKWgNIkM7xnWHl7TQp1HZsrMm-O8"
        />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          <Script
            src="https://analytics.girigiribauer.com/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>
        <main>
          <Suspense fallback={null}>
            <ModalProvider>
              {children}
              <ModalContents />
            </ModalProvider>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
