import { NextResponse } from 'next/server';

function normalizeDate(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return new Date(value).toISOString();
  if (typeof value === 'object' && value.$date) return new Date(value.$date).toISOString();
  return null;
}

function normalizeFolder(item: any): any {
  return {
    id: item.id?.toString() || '',
    name: item.name?.toString() || '',
    createdAt: normalizeDate(item.createdAt),
    updatedAt: normalizeDate(item.updatedAt),
    // Ignorer les champs complexes comme instructions
  };
}

export async function GET() {
  try {
    const response = await fetch('http://localhost:5000/api/folders', {
      headers: { 'Content-Type': 'application/json' },
    });
    const text = await response.text();
    const log = process.env.NODE_ENV === 'development' ? console.log : () => {};
    log(`[DEBUG] Backend response for /folders: Status ${response.status}, Body: ${text}`);
    if (!response.ok) {
      console.error(`[ERROR] Backend failed for /folders: ${text} (Status: ${response.status})`);
      return NextResponse.json({ error: 'Folders not found' }, { status: response.status });
    }
    const data = JSON.parse(text);
    // Normaliser les données
    const normalizedData = Array.isArray(data) ? data.map(normalizeFolder) : [];
    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const dataToSend = {
      name: name.toString(),
    };

    const response = await fetch('http://localhost:5000/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    const text = await response.text();
    const log = process.env.NODE_ENV === 'development' ? console.log : () => {};
    log(`[DEBUG] Backend response for POST /folders: Status ${response.status}, Body: ${text}`);
    if (!response.ok) {
      console.error(`[ERROR] Backend failed for POST /folders: ${text} (Status: ${response.status})`);
      throw new Error('Failed to create folder on backend');
    }

    const data = JSON.parse(text);
    // Normaliser la réponse
    const normalizedData = normalizeFolder(data);
    return NextResponse.json(normalizedData, { status: response.status });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}