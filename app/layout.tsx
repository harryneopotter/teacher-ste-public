import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tanya Kaushik - Creative Writing Teacher | Young Voices Program",
  description: "Join Tanya Kaushik's Creative Writing Program for Grades 4-7. Nurturing young writers through poetry, stories, and creative expression. Online group classes with personal attention.",
  keywords: "creative writing, English teacher, children writing, poetry, storytelling, grades 4-7, online classes, Tanya Kaushik",
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    shortcut: { url: '/favicon.svg' }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
