import "@/styles/global.css";

import type { Metadata } from "next";
import React, { Suspense } from "react";
import Providers from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";

import Loading from "./loading";

export const metadata: Metadata = {
  title: "SihotangHotKicks",
  icons: [
    {
      rel: "icon",
      url: "/logo.svg",
    },
    {
      rel: "apple-touch-icon",
      url: "/logo.svg",
    },
  ],
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <Providers>
          <ConditionalLayout>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

// Enable edge runtime, but you are required to disable the `migrate` function in `src/libs/DB.ts`
// Unfortunately, this also means it will also disable the automatic migration of the database
// And, you will have to manually migrate it with `drizzle-kit push`
// export const runtime = 'edge';
