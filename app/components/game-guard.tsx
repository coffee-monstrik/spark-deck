"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useGameStore } from "@/lib/game/store";

type Props = {
  children: React.ReactNode;
  allowStopped?: boolean;
  allowWhenFinished?: boolean;
};

// Redirects visitors back to landing when there is no active game,
// or to the relevant end screens when a game has finished/stopped.
export const GameGuard = ({
  children,
  allowStopped = false,
  allowWhenFinished = false,
}: Props) => {
  const { state } = useGameStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const shouldRedirectHome = state.status === "idle" || !state.deck.id;
    if (shouldRedirectHome) {
      router.replace("/");
      return;
    }

    if (!allowStopped && state.status === "stopped") {
      router.replace("/stop");
      return;
    }

    if (!allowWhenFinished && state.winState === "deck-finished") {
      router.replace("/final");
      return;
    }

    setChecking(false);
  }, [allowStopped, allowWhenFinished, router, state, pathname]);

  if (checking) {
    return null;
  }

  return <>{children}</>;
};
