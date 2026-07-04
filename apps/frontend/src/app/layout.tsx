import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Index Baskets · Robinhood Chain",
  description:
    "Mint and redeem onchain index baskets of tokenized stocks on Robinhood Chain",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
