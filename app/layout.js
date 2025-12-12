import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { AuthProvider } from "@/components/auth/AuthContext";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: APP_NAME,
  description: "Track and discover movies and TV shows.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
