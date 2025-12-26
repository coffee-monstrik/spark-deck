"use client";

import { usePathname, useRouter } from "next/navigation";

import { useGameStore } from "@/lib/game/store";

type Props = {
  label?: string;
  variant?: "link" | "button";
};

export const StopControl = ({ label = "Stop now", variant = "link" }: Props) => {
  const { dispatch } = useGameStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    dispatch({ type: "setLastRoute", payload: pathname });
    dispatch({ type: "stop" });
    router.push("/stop");
  };

  if (variant === "button") {
    return (
      <button type="button" className="stop-control-button" onClick={handleClick}>
        {label}
      </button>
    );
  }

  return (
    <button type="button" className="game-stop-link" onClick={handleClick}>
      {label}
    </button>
  );
};
