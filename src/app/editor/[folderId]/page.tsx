'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavigationSidebar } from '@/app/features/editor/components/NavigationSidebar';
import { InstructionList } from '@/app/features/editor/components/InstructionList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

export default function FolderPage() {
  const { folderId } = useParams();
  const router = useRouter();
  const [instructions, setInstructions] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructions = async () => {
    try {
      const response = await fetch(`/api/instructions?folderId=${folderId}`);
      if (!response.ok) {
        throw new Error('Échec de la récupération des instructions');
      }
      const data = await response.json();
      setInstructions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchInstructions();
  }, [folderId]);

  const handleAddInstruction = async (title: string) => {
    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, folderId }),
      });
      if (!response.ok) {
        throw new Error('Échec de la création de l’instruction');
      }
      await fetchInstructions(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la création de l’instruction:', error);
      setError('Impossible de créer l’instruction');
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = instructions.findIndex((instr) => instr.id.toString() === active.id);
    const newIndex = instructions.findIndex((instr) => instr.id.toString() === over.id);
    const newInstructions = arrayMove(instructions, oldIndex, newIndex);
    setInstructions(newInstructions);

    try {
      await fetch('/api/instructions/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions: newInstructions.map((instr, index) => ({ id: instr.id, order: index })),
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la réorganisation des instructions:', error);
      setError('Impossible de réorganiser les instructions');
      // Revenir à l'état précédent en cas d'erreur
      await fetchInstructions();
    }
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <NavigationSidebar activeTool="instructions" onChangeActiveTool={() => {}} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
              <Button
                onClick={() => router.push('/')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retour à l’accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <NavigationSidebar activeTool="instructions" onChangeActiveTool={() => {}} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Instructions</h1>
            <Button
              onClick={() => {
                const title = prompt('Entrez le titre de la nouvelle instruction :');
                if (title) handleAddInstruction(title);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter une instruction
            </Button>
          </div>
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={instructions.map((instr) => instr.id.toString())} strategy={verticalListSortingStrategy}>
              <InstructionList instructions={instructions} folderId={folderId} />
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}