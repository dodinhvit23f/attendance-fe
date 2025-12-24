import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/root/client-layout";
import EmotionCacheRegistry from "@/components/root/emotion-cache-registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solpyra Attendence",
  description: "Ứng Dụng Chấm Công Trực Tuyến",
};


export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <EmotionCacheRegistry options={{ key: 'mui' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </EmotionCacheRegistry>
      </body>
      </html>
  );
}


