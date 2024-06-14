import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Suspense fallback="Notion から断続的に読み込んでいます">
          {children}
        </Suspense>
      </body>
    </html>
  );
}
