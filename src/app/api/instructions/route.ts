import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  try {
    const response = await fetch(`http://localhost:5000/api/instructions${folderId ? `?folderId=${folderId}` : ''}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch instructions' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching instructions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch('http://localhost:5000/api/instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to create instruction' }, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating instruction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch('http://localhost:5000/api/instructions/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to reorder instructions' }, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error reordering instructions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}