"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthContext";
import { APP_NAME } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }
  const profileUsername = profile?.username || null;
  const profileHref = user
    ? profileUsername
      ? `/profile/${profileUsername}`
      : "/profile"
    : "/profile";
  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: profileHref, label: "Profile" },
  ];

  return (
    <header className="border-b bg-muted/90 backdrop-blur supports-backdrop-filter:bg-muted/70 shadow-sm dark:bg-neutral-900/80 dark:supports-backdrop-filter:bg-neutral-900/60 dark:border-neutral-800 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu for mobile version */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-900 dark:text-gray-100"
                aria-label="Open navigation menu"
                title="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="md:hidden"
            >
              {links.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  onClick={() => router.push(link.href)}
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* App branding */}
          <Link
            href="/"
            className="font-semibold text-lg text-gray-900 dark:text-gray-100"
          >
            {APP_NAME}
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const base = "text-sm transition-colors";
            const active = "text-gray-900 dark:text-gray-100 font-medium";
            const inactive =
              "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100";
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`${base} ${isActive ? active : inactive}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <Sun className="h-4 w-4 hidden dark:inline" />
            <Moon className="h-4 w-4 inline dark:hidden" />
          </Button>

          {/* User account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 dark:border-neutral-700"
              >
                <User className="h-4 w-4" aria-label="profile-button" />
                <span className="hidden sm:inline">
                  {loading ? "..." : user ? user.email || "Account" : "Sign in"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => router.push(profileHref)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => router.push("/login")}>
                    Log in
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/signup")}>
                    Sign up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
