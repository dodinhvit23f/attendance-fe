import type {Metadata, Viewport} from "next";
import {Roboto} from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/root/client-layout";
import EmotionCacheRegistry from "@/components/root/emotion-cache-registry";
import { DevToolsBlocker } from "@/components/DevToolsBlocker";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Solpyra Attendance",
    template: "%s | Solpyra Attendance",
  },
  description: "Ứng Dụng Chấm Công Trực Tuyến - Quản lý điểm danh nhân viên hiệu quả",
  keywords: ["attendance", "check-in", "employee management", "chấm công", "quản lý nhân viên"],
  authors: [{ name: "Solpyra Team" }],
  creator: "Solpyra",

  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://attendance.solpyra.com",
    title: "Solpyra Attendance",
    description: "Ứng Dụng Chấm Công Trực Tuyến - Quản lý điểm danh nhân viên hiệu quả",
    siteName: "Solpyra Attendance",
  },

  twitter: {
    card: "summary_large_image",
    title: "Solpyra Attendance",
    description: "Ứng Dụng Chấm Công Trực Tuyến - Quản lý điểm danh nhân viên hiệu quả",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <html lang="vi">
      <body className={roboto.variable}>
      <DevToolsBlocker />
      <EmotionCacheRegistry options={{ key: 'mui' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </EmotionCacheRegistry>
      </body>
      </html>
  );
}


