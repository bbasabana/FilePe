"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-surface">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="loader-dot h-2 w-2 rounded-full bg-primary"
            aria-hidden
          />
        ))}
      </div>
      <span className="text-sm text-ink-secondary">FilePe</span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    hydrate().then((ok) => {
      if (ok) router.replace("/dashboard");
      else router.replace("/login");
    });
  }, [mounted, hydrate, router]);

  return <Loader />;
}
