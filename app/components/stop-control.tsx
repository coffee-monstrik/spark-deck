"use client";

import { useRouter } from "next/navigation";

import { useGameStore } from "@/lib/game/store";

type Props = {
  label?: string;
  variant?: "link" | "button";
};

export const StopControl = ({ label = "Stop now", variant = "link" }: Props) => {
  const { dispatch } = useGameStore();
  const router = useRouter();

  const handleClick = () => {
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
