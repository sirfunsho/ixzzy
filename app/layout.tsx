import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { CartNotice } from "@/components/cart-notice";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IXZZY — Contemporary clothing from Nigeria",
  description:
    "IXZZY is a contemporary streetwear label from Lagos, Nigeria. Made in Nigeria. Made for now.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ink text-paper antialiased">
        <AuthSessionProvider>
        <AuthSessionProvider>
          <CartProvider>
            {children}
            <CartNotice />
            <CartDrawer />
          </CartProvider>
        </AuthSessionProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
