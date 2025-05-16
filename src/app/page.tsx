import Image from "next/image";
import { CanvasContainer } from "./CanvasContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <CanvasContainer />
    </main>
  );
}
