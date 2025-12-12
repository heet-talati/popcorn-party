"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function GlobalLayout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
