"use client";

import { GameProvider } from "../lib/game/store";

type Props = {
  children: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  return <GameProvider>{children}</GameProvider>;
};
