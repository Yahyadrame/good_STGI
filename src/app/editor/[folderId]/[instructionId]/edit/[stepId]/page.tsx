"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Editor } from '@/app/features/editor/components/editor'; // Corrigé : majuscule pour correspondre au nom du fichier
import { Button } from '@/components/ui/button';
import { Step } from '@/app/features/types';

export default function EditStepPage() {
  const { instructionId, stepId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: stepData, isLoading, error } = useQuery<Step>({
    queryKey: ['step', stepId],
    queryFn: async () => {
      const response = await fetch(`/api/steps/${stepId}?t=${Date.now()}`); // Ajouté pour éviter le cache
      if (!response.ok) throw new Error(`Étape ${stepId} non trouvée`);
      const data = await response.json();
      console.log('Raw response from /api/steps/', stepId, ':', data); // Simplifié pour éviter JSON.stringify
      return {
        id: String(data.id),
        instructionId: String(data.instructionId),
        action: data.action || '',
        component: data.component || null,
        location: data.location || null,
        toolId: String(data.toolId) || null,
        details: data.details || '',
        objective: data.objective || '',
        media: data.media || null,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache de 5 minutes
  });

  const mutation = useMutation({
    mutationFn: async ({ mediaUrl, details, objective }: { mediaUrl: string; details?: string; objective?: string }) => {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }, // Utilisation de JSON au lieu de FormData
        body: JSON.stringify({
          action: stepData?.action || '',
          component: stepData?.component || '',
          location: stepData?.location || '',
          toolId: stepData?.toolId || '',
          details: details || stepData?.details || '',
          objective: objective || stepData?.objective || '',
          media: mediaUrl || stepData?.media || null,
        }),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['step', stepId] });
      router.push(`/editor/${instructionId}/1`);
    },
    onError: (err) => {
      console.error('Error saving step:', err);
    },
  });

  const handleSave = (stepData: { image?: string; text?: { details: string; objective: string }; video?: string }) => {
    mutation.mutate({
      mediaUrl: stepData.image || stepData.video || '',
      details: stepData.text?.details,
      objective: stepData.text?.objective,
    });
  };

  if (error) return <div className="p-6 text-red-600">{error.message}</div>;
  if (isLoading || !stepData) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto w-full" style={{ height: 'calc(100% - 48px)' }}>
        <h1 className="text-3xl font-bold mb-6">Éditer l’étape {stepId}</h1>
        <div style={{ height: '100%' }}>
          <Editor
            media={stepData.media}
            onSave={handleSave}
            stepId={parseInt(stepId as string, 10)}
            instructionId={instructionId as string}
            details={stepData.details}
            objective={stepData.objective}
            setDetails={(value) => mutation.mutate({ mediaUrl: '', details: value })}
            setObjective={(value) => mutation.mutate({ mediaUrl: '', objective: value })}
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <Button
            onClick={() => handleSave({})}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sauvegarder
          </Button>
          <Button
            onClick={() => router.push(`/editor/${instructionId}/1`)}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}