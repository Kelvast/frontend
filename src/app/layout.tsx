import type { Metadata } from "next";
import { FC } from "react";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "../context/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kelvast",
  description: "Browser-based MMORPG. A living, persistent world full of adventure. Coming soon.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Kelvast",
    description: "Browser-based MMORPG. A living, persistent world full of adventure. Coming soon.",
    type: "website",
    url: "https://kelvast.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelvast",
    description: "Browser-based MMORPG. A living, persistent world full of adventure. Coming soon.",
  },
};

interface Props {
  children: React.ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
