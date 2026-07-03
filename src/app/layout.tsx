import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { BRAND } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.slogan}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Zine is a clean, fast, 6-second looping video platform for memes, gaming, Roblox, Minecraft, edits, and creators. Short videos that loop different.",
  keywords: [
    "Zine",
    "short video",
    "6 second video",
    "loops",
    "gaming clips",
    "Roblox",
    "Minecraft",
    "memes",
    "edits",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zine.video",
  ),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "Short videos that loop different.",
    siteName: BRAND.name,
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 2000,
        height: 600,
        alt: "Zine — short videos that loop different.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: "Short videos that loop different.",
    images: ["/banner.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050c0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
