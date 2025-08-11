import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch('http://localhost:5000/api/tools');
    if (!response.ok) {
      return NextResponse.json({ error: 'Échec de la récupération des outils' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch('http://localhost:5000/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Échec de la création de l\'outil' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création de l\'outil:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}