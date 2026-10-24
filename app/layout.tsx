import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import AppHeader from "@/components/layout/AppHeader";
import PreviewBanner from "@/components/layout/PreviewBanner";
import { isPreviewMode } from "@/lib/data/source";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudyHub",
    template: "%s · StudyHub",
  },
  description: "College notes, lecture documents and unit mastery in one workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const preview = isPreviewMode();

  return (
    <html
      lang="en"
      data-preview={preview ? "" : undefined}
      className={`${inter.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-fg">
        {preview && <PreviewBanner />}
        <AppHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
