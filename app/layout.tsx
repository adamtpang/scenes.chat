import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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
      <body>
        <Script id="posthog-fleet" strategy="afterInteractive">{`(function(){if(window.__posthogFleet)return;window.__posthogFleet=1;var s=document.createElement('script');s.async=true;s.src='https://us-assets.i.posthog.com/static/array.js';s.onload=function(){if(!window.posthog||!window.posthog.init)return;window.posthog.init('phc_FCpCP9mIsb9IcxpX0Qqi6FmJ48sVvscAYIrZmtRHIq4',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only',capture_pageview:'history_change',capture_pageleave:true,autocapture:false,disable_session_recording:true,disable_surveys:true,loaded:function(p){p.register({site:location.hostname})}});};document.head.appendChild(s);})();`}</Script>{children}</body>
    </html>
  );
}
