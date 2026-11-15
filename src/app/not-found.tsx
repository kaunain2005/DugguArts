import Link from "next/link";
import { Flower2, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Flower2 className="w-12 h-12 text-primary" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-6xl font-bold text-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text mb-4">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}