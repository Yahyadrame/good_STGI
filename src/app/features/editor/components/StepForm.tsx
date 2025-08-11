"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Group, Stack, TextInput, Select, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

interface StepFormProps {
  stepId?: string;
  instructionId?: string;
  folderId?: string;
  initialData?: {
    id?: string;
    instructionId?: string;
    action?: string;
    component?: string | null;
    location?: string | null;
    toolId?: string | null;
    details?: string;
    objective?: string;
  };
  onStepCreated?: () => Promise<void>;
}

export const StepForm = ({ stepId, instructionId, folderId, initialData, onStepCreated }: StepFormProps) => {
  const router = useRouter();
  const [tools, setTools] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      instructionId: initialData?.instructionId || instructionId || '',
      action: initialData?.action || '',
      component: initialData?.component || '',
      location: initialData?.location || '',
      toolId: initialData?.toolId || '',
      details: initialData?.details || '',
      objective: initialData?.objective || '',
    },
    validate: {
      instructionId: (value) => (value ? null : 'Instruction ID requis'),
      action: (value) => (value.length >= 3 ? null : 'L’action doit contenir au moins 3 caractères'),
      details: (value) => (value.length >= 10 ? null : 'Les détails doivent contenir au moins 10 caractères'),
      objective: (value) => (value.length >= 10 ? null : 'L’objectif doit contenir au moins 10 caractères'),
    },
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Échec de la récupération des outils');
        const data = await response.json();
        const normalizedTools = data.map((tool: { id: any; name: string }) => ({
          id: String(tool.id),
          name: tool.name,
        }));
        setTools(normalizedTools);
      } catch (err) {
        setError('Erreur lors du chargement des outils');
        console.error('Error fetching tools:', err);
      }
    };
    fetchTools();
  }, []);

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await fetch(stepId ? `/api/steps/${stepId}` : '/api/steps', {
          method: stepId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Backend error:', errorData);
          throw new Error('Échec de la sauvegarde de l’étape');
        }
        const result = await response.json();
        console.log('Étape créée:', result);
        notifications.show({
          title: 'Succès',
          message: 'Étape sauvegardée avec succès',
          color: 'green',
        });
        if (!stepId && onStepCreated) {
          await onStepCreated();
        }
        router.push(`/editor/${folderId}/${values.instructionId}`);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l’étape:', error);
        setError('Erreur lors de la sauvegarde de l’étape');
        notifications.show({
          title: 'Erreur',
          message: 'Erreur lors de la sauvegarde de l’étape',
          color: 'red',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [stepId, folderId, instructionId, router, isSubmitting, onStepCreated]
  );

  return (
    <Stack className="p-4 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Instruction ID"
          placeholder="Entrez l’ID de l’instruction"
          {...form.getInputProps('instructionId')}
          required
          className="mb-4"
        />
        <TextInput
          label="Action"
          placeholder="Entrez l’action de l’étape"
          {...form.getInputProps('action')}
          required
          className="mb-4"
        />
        <TextInput
          label="Composant"
          placeholder="Entrez le composant"
          {...form.getInputProps('component')}
          className="mb-4"
        />
        <TextInput
          label="Lieu"
          placeholder="Entrez le lieu"
          {...form.getInputProps('location')}
          className="mb-4"
        />
        <Select
          label="Outil"
          placeholder="Sélectionnez un outil"
          data={tools.map((tool) => ({ value: tool.id, label: tool.name }))}
          {...form.getInputProps('toolId')}
          className="mb-4" // Corrigé : mb-derick → mb-4
        />
        <Textarea
          label="Détails"
          placeholder="Entrez les détails de l’étape"
          {...form.getInputProps('details')}
          required
          minRows={4}
          className="mb-4"
        />
        <Textarea
          label="Objectif"
          placeholder="Entrez l’objectif de l’étape"
          {...form.getInputProps('objective')}
          required
          minRows={4}
          className="mb-4"
        />
        <Group position="apart">
          <Button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {stepId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Group>
      </form>
    </Stack>
  );
};