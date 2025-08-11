import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page non trouvée</h1>
      <p className="text-lg text-gray-600 mb-6">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Retour à l&apos;accueil
        </Button>
      </Link>
    </div>
  );
}