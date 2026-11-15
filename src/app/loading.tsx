import { Flower2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 animate-spin">
          <Flower2 className="w-full h-full text-primary" />
        </div>
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  );
}