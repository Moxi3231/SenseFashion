
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutWrap from "./layoutWrap";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viz",
  description: "Visulization of Data and Scheduling Scraping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
      </head>
      <body className={inter.className}>
        <LayoutWrap children={children}></LayoutWrap>
      </body>
    </html>
  );
}
