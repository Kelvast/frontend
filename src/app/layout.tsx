import type { Metadata } from "next";
import { FC } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--loaded-font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--loaded-font-heading" });

export const metadata: Metadata = {
  title: "Kelvast",
  description: "A browser-based 3D MMORPG. No pay-to-win. No installs.",
};

interface Props {
  children: React.ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
};

export default RootLayout;
