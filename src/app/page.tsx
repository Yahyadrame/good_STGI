'use client';

import { useEffect, useState } from 'react';
import { NavigationSidebar } from '@/app/features/editor/components/NavigationSidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Folder } from '@/app/features/types';

function normalizeFolder(item: any): Folder {
  return {
    id: item.id?.toString() || '',
    name: item.name?.toString() || '',
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
  };
}

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeTool, setActiveTool] = useState('folders');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch('/api/folders');
        if (!response.ok) throw new Error('Erreur lors du chargement des dossiers');
        const data = await response.json();
        const log = process.env.NODE_ENV === 'development' ? console.log : () => {};
        log('Raw response from /api/folders:', JSON.stringify(data));
        // Normaliser les données
        const normalizedFolders: Folder[] = Array.isArray(data) ? data.map(normalizeFolder) : [];
        setFolders(normalizedFolders);
        setError(null);
      } catch (err) {
        console.error('Error fetching folders:', err);
        setError('Impossible de charger les dossiers.');
      }
    };
    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    const name = prompt('Nom du dossier :');
    if (name) {
      try {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error('Erreur lors de la création du dossier');
        const newFolder = await response.json();
        // Normaliser la nouvelle donnée
        const normalizedFolder = normalizeFolder(newFolder);
        setFolders([...folders, normalizedFolder]);
      } catch (err) {
        console.error('Error creating folder:', err);
        setError('Impossible de créer le dossier.');
      }
    }
  };

  if (error) {
    return (
      <main className="flex min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-gray-50">
      <NavigationSidebar activeTool={activeTool} onChangeActiveTool={setActiveTool} folders={folders} />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dossiers</h1>
            <Button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nouveau dossier
            </Button>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Sélectionnez un dossier dans la barre latérale pour voir ses instructions.</p>
          </div>
        </div>
      </div>
    </main>
  );
}