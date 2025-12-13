import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          © {new Date().getFullYear()} {APP_NAME}
        </p>
        <p>Made with 🧀 by a group of 5 lazy guys.</p>
      </div>
    </footer>
  );
}
