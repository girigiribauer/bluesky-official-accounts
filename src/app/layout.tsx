import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "../globals.scss";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_EXTERNAL_URL ?? ""),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <main className="main">
          <Suspense fallback="Notion から断続的に読み込んでいます">
            {children}
          </Suspense>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
