import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const response = await fetch(`http://localhost:5000/api/folders/${id}`);
  if (!response.ok) {
    return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}