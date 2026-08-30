import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const title = "Scenes — make internet friends, properly";
const description =
  "Scenes puts you in a small room with a few people who should know you, and gives you something real to talk about. An experiment in making friends online.";

export const metadata: Metadata = {
  metadataBase: new URL("https://scenes.chat"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://scenes.chat",
    siteName: "Scenes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
