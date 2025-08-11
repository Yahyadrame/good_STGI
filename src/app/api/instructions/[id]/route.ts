import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Désactive le cache statique

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const response = await fetch(`http://localhost:5000/api/instructions/${id}?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Force une nouvelle requête sans cache
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Instruction non trouvée' }, { status: response.status });
    }
    const text = await response.text(); // Obtenir la réponse brute
    console.log('Réponse brute du backend:', text);
    const data = JSON.parse(text); // Parser manuellement
    console.log('Données parsées du backend:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’instruction:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}