import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const description =
  "An interactive live testnet walkthrough: mint and redeem onchain index baskets of tokenized stocks on Robinhood Chain, priced live by Chainlink.";

export const metadata: Metadata = {
  metadataBase: new URL("https://robinhood-chain-dapp.vercel.app"),
  title: "Index Baskets · Robinhood Chain",
  description,
  openGraph: {
    title: "Index Baskets on Robinhood Chain",
    description,
    url: "/",
    siteName: "Index Baskets on Robinhood Chain",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Index Baskets on Robinhood Chain",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <SiteHeader />
          <main className="w-full flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
