import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AiChatWidget } from '@/components/ui/AiChatWidget';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnAble — AI Learning Assessment for Dyslexia, Dysgraphia & Dyscalculia",
  description: "AI-powered early screening and personalised game-based learning for children with Dyslexia, Dysgraphia, and Dyscalculia. Free, instant, and available in English, Hindi, and Marathi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AiChatWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
