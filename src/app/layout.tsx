import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/store/StoreProvider";
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from "@/mock/initialData";
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
  title: "SimuPhish - Real-Time Chat",
  description: "Production Real-Time Chat with WebSockets, Redux Toolkit, and Cloudinary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialMessages = Object.values(INITIAL_MESSAGES).flat();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-[#f1f5f9]">
        <StoreProvider
          initialConversations={INITIAL_CONVERSATIONS}
          initialMessages={initialMessages}
        >
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
