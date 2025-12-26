import { loadDecks } from "@/lib/decks/load";
import { Landing } from "./components/landing";
import { Footer } from "./components/footer";

export default async function Home() {
  const decks = await loadDecks();
  return (
    <>
      <Landing decks={decks} />
      <Footer />
    </>
  );
}
