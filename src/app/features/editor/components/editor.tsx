"use client";

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEditor as useFabricEditor } from '../hooks/use-editor';
import { fabric } from 'fabric';
import { NavBar } from './NavBar';
import { SideBar } from './SideBar';
import { PropertiesPanel } from './PropertiesPanel';
import { VideoSidebar } from './video-sidebar';
import { TextSidebar } from './text-sidebar';
import { Tabs, Button, Stack, Text, Drawer, Group, Select, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUploadThing } from '../../../../lib/uploadthing';
import { ActiveTool, selectionDependentTools } from '../../types';
import { Label } from '@/components/ui/label';
import { normalizePath } from '../../utils';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

// Debug log pour vérifier les composants
console.log('Vérification des composants:', {
  NavBar: typeof NavBar,
  SideBar: typeof SideBar,
  PropertiesPanel: typeof PropertiesPanel,
  VideoSidebar: typeof VideoSidebar,
  TextSidebar: typeof TextSidebar,
  Tabs: typeof Tabs,
  TabsList: typeof Tabs.List,
  TabsTab: typeof Tabs.Tab,
  TabsPanel: typeof Tabs.Panel,
  Label: typeof Label,
  Tooltip: typeof Tooltip,
});

interface EditorProps {
  media?: string;
  onSave?: (stepData: { image?: string; text?: { details: string; objective: string }; video?: string }) => void;
  stepId?: number;
  instructionId?: string;
  initialData?: {
    id?: string;
    instructionId?: string;
    action?: string;
    component?: string | null;
    location?: string | null;
    toolId?: string | null;
    details?: string;
    objective?: string;
    media?: string | null;
  };
  details?: string;
  objective?: string;
  setDetails?: (value: string) => void;
  setObjective?: (value: string) => void;
}

export const Editor = memo(({ media, onSave, stepId, instructionId, initialData, details, objective, setDetails, setObjective }: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [activeTab, setActiveTab] = useState<"image" | "text" | "video">("text");
  const [sidebarOpened, { open: openSidebar, close: closeSidebar }] = useDisclosure(false);
  const [tools, setTools] = useState<{ id: string; name: string }[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { init, editor } = useFabricEditor({
    clearSelectionCallback: () => {
      if (selectionDependentTools.includes(activeTool)) {
        setActiveTool("select");
      }
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.url && onSave) {
        onSave({ image: res[0].url, text: { details: detailsEditor?.getHTML() || '', objective: objectiveEditor?.getHTML() || '' } });
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setAiError('Erreur lors du téléversement de l’image.');
    },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideo, setIsVideo] = useState(false);

  const form = useForm({
    initialValues: {
      instructionId: initialData?.instructionId || instructionId || searchParams.get('instructionId') || '',
      action: initialData?.action || '',
      component: initialData?.component || '',
      location: initialData?.location || '',
      toolId: initialData?.toolId || '',
      details: initialData?.details || details || '',
      objective: initialData?.objective || objective || '',
    },
    validate: {
      instructionId: (value) => (value ? null : 'Instruction ID requis'),
      action: (value) => (value.length >= 3 ? null : 'L’action doit contenir au moins 3 caractères'),
      details: (value) => (value.length >= 10 ? null : 'Les détails doivent contenir au moins 10 caractères'),
      objective: (value) => (value.length >= 10 ? null : 'L’objectif doit contenir au moins 10 caractères'),
    },
  });

  const detailsEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        link: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BulletList.configure(),
      OrderedList.configure(),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, autolink: true }),
      FontFamily.configure(),
      TextStyle.configure(),
      Color.configure(),
    ],
    content: form.values.details,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setFieldValue('details', html);
      if (setDetails) setDetails(html);
    },
    immediatelyRender: false,
  });

  const objectiveEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        link: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      BulletList.configure(),
      OrderedList.configure(),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, autolink: true }),
      FontFamily.configure(),
      TextStyle.configure(),
      Color.configure(),
    ],
    content: form.values.objective,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setFieldValue('objective', html);
      if (setObjective) setObjective(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Échec de la récupération des outils');
        const data = await response.json();
        setTools(data.map((tool: any) => ({ id: String(tool.id), name: tool.name })));
      } catch (err) {
        setAiError('Erreur lors du chargement des outils');
        console.error('Error fetching tools:', err);
      }
    };
    fetchTools();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = new fabric.Canvas(canvasRef.current!, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      uniScaleTransform: false,
      rotatingPointOffset: 40,
    });

    if (media && activeTab === 'image') {
      const imageUrl = normalizePath(media) || `/uploads/${media.split('\\').pop() || media}`;
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(canvas.getWidth() / 2);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' }).catch((err) => {
        console.error('Error loading image:', err);
        setAiError('Impossible de charger l\'image. Vérifiez le fichier media.');
      });
    }

    if (media && activeTab === 'video' && videoRef.current) {
      videoRef.current.src = media;
      setIsVideo(true);
      const videoElement = videoRef.current;
      fabric.Image.fromURL(media, (img) => {
        img.scaleToWidth(canvas.getWidth());
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
        videoElement.addEventListener('timeupdate', () => {
          canvas.renderAll();
        });
      }, { crossOrigin: 'anonymous' });
    }

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    canvas.on('mouse:wheel', (opt) => {
      let mouseDistanceTravelled = opt.e.deltaY;
      let currentZoomLevel = canvas.getZoom();
      currentZoomLevel = currentZoomLevel * 0.999 ** mouseDistanceTravelled;
      if (currentZoomLevel > 20) currentZoomLevel = 20;
      if (currentZoomLevel < 0.01) currentZoomLevel = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, currentZoomLevel);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    return () => {
      canvas.dispose();
    };
  }, [init, media, activeTab]);

  const handleSaveImage = async () => {
    if (!editor?.canvas) return;
    const dataUrl = editor.canvas.toDataURL({ format: 'png', quality: 0.8 });
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'canvas-image.png', { type: 'image/png' });
      await startUpload([file]);
    } catch (error) {
      console.error('Erreur avec UploadThing:', error);
      setAiError('Erreur lors du téléversement de l’image.');
    }
  };

  const handleSaveText = async () => {
    if (!form.validate().isValid) {
      notifications.show({ title: 'Erreur', message: 'Veuillez remplir tous les champs requis', color: 'red' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(stepId ? `/api/steps/${stepId}` : '/api/steps', {
        method: stepId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      });
      if (!response.ok) throw new Error('Échec de la sauvegarde de l’étape');
      const result = await response.json();
      notifications.show({ title: 'Succès', message: 'Étape sauvegardée avec succès', color: 'green' });
      if (onSave) {
        onSave({ text: { details: detailsEditor?.getHTML() || '', objective: objectiveEditor?.getHTML() || '' } });
      }
      router.push(`/editor/${form.values.instructionId}/1`);
    } catch (error) {
      console.error('Error saving step:', error);
      setAiError('Erreur lors de la sauvegarde de l’étape');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToGif = async () => {
    if (!media || !isVideo) return;
    try {
      const response = await fetch('/api/video/convert-to-gif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: media }),
      });
      if (!response.ok) throw new Error('Erreur lors de la conversion en GIF');
      const data = await response.json();
      if (data.gifUrl && onSave) {
        onSave({ video: data.gifUrl });
      }
    } catch (error) {
      console.error('Error converting video to GIF:', error);
      setAiError('Impossible de convertir la vidéo en GIF');
    }
  };

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enabledDrawingMode();
      }
      if (activeTool === "draw") {
        editor?.disabledDrawingMode();
      }
      if (tool === activeTool) {
        return setActiveTool("select");
      }
      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  const renderToolbar = (editorInstance: any) => (
    <Group spacing="xs" className="bg-gray-100 p-2 rounded shadow mb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => editorInstance.chain().focus().toggleBold().run()}
            >
              Gras
            </Button>
          </TooltipTrigger>
          <TooltipContent>Met le texte en gras</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => editorInstance.chain().focus().toggleItalic().run()}
            >
              Italique
            </Button>
          </TooltipTrigger>
          <TooltipContent>Met le texte en italique</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => editorInstance.chain().focus().toggleBulletList().run()}
            >
              Liste à puces
            </Button>
          </TooltipTrigger>
          <TooltipContent>Crée une liste à puces</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => editorInstance.chain().focus().toggleOrderedList().run()}
            >
              Liste numérotée
            </Button>
          </TooltipTrigger>
          <TooltipContent>Crée une liste numérotée</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => editorInstance.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
            >
              Tableau
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insère un tableau</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                const href = prompt('Entrez l’URL du lien');
                if (href) editorInstance.chain().focus().setLink({ href }).run();
              }}
            >
              Lien
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ajoute un lien hypertexte</TooltipContent>
        </Tooltip>
        <Select
          size="xs"
          data={['left', 'center', 'right', 'justify']}
          defaultValue="left"
          onChange={(value) => editorInstance.chain().focus().setTextAlign(value!).run()}
          placeholder="Alignement"
        />
        <Select
          size="xs"
          data={[
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Courier New', label: 'Courier New' },
          ]}
          defaultValue="Arial"
          onChange={(value) => editorInstance.chain().focus().setFontFamily(value!).run()}
          placeholder="Police"
        />
        <Select
          size="xs"
          data={['12', '14', '16', '18', '20', '24', '30'].map((size) => ({ value: size, label: size }))}
          defaultValue="16"
          onChange={(value) => editorInstance.chain().focus().setFontSize(`${value}px`).run()}
          placeholder="Taille"
        />
        <input
          type="color"
          onChange={(e) => editorInstance.chain().focus().setColor(e.target.value).run()}
          defaultValue="#000000"
          className="w-8 h-8"
        />
      </TooltipProvider>
    </Group>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {aiError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg m-4"
        >
          <Text>{aiError}</Text>
        </motion.div>
      )}
      <NavBar
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        editor={editor}
        onSave={activeTab === 'image' ? handleSaveImage : activeTab === 'text' ? handleSaveText : handleConvertToGif}
        onToggleSidebar={openSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex flex-1 overflow-hidden">
        <motion.div
          initial={{ x: -360 }}
          animate={{ x: sidebarOpened ? 0 : -360 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg z-10 h-full"
        >
          <Drawer
            opened={sidebarOpened}
            onClose={closeSidebar}
            title="Outils d'édition"
            padding="md"
            size="sm"
            className="h-full"
          >
            <Stack>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <SideBar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} editor={editor} activeTab={activeTab} />
              </motion.div>
            </Stack>
          </Drawer>
        </motion.div>
        <main className="flex-1 bg-white rounded-lg shadow overflow-auto">
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value as "image" | "text" | "video")}>
            <Tabs.List className="p-2 bg-gray-100">
              <Tabs.Tab value="image">Image</Tabs.Tab>
              <Tabs.Tab value="text">Texte</Tabs.Tab>
              <Tabs.Tab value="video">Vidéo</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="image">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-[calc(100%-60px)] bg-gray-100 flex flex-col items-center justify-center"
                ref={containerRef}
              >
                <canvas ref={canvasRef} className="border rounded shadow" />
              </motion.div>
            </Tabs.Panel>
            <Tabs.Panel value="text">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-[calc(100%-60px)] bg-gray-100 flex flex-col items-center justify-center p-4"
              >
                <Stack className="w-full max-w-2xl">
                  <TextInput
                    label="Action"
                    placeholder="Entrez l’action de l’étape"
                    {...form.getInputProps('action')}
                    required
                    disabled
                    className="w-full"
                    onChange={(event) => {
                      console.log('TextInput Action props:', form.getInputProps('action'));
                      form.getInputProps('action').onChange(event);
                    }}
                  />
                  <TextInput
                    label="Composant"
                    placeholder="Entrez le composant"
                    {...form.getInputProps('component')}
                    disabled
                    className="w-full"
                    onChange={(event) => {
                      console.log('TextInput Component props:', form.getInputProps('component'));
                      form.getInputProps('component').onChange(event);
                    }}
                  />
                  <TextInput
                    label="Lieu"
                    placeholder="Entrez le lieu"
                    {...form.getInputProps('location')}
                    disabled
                    className="w-full"
                    onChange={(event) => {
                      console.log('TextInput Location props:', form.getInputProps('location'));
                      form.getInputProps('location').onChange(event);
                    }}
                  />
                  <Select
                    label="Outil"
                    placeholder="Sélectionnez un outil"
                    data={tools.map((tool) => ({ value: tool.id, label: tool.name }))}
                    {...form.getInputProps('toolId')}
                    disabled
                    className="w-full"
                    onChange={(value) => {
                      console.log('Select Tool props:', form.getInputProps('toolId'));
                      form.getInputProps('toolId').onChange(value);
                    }}
                  />
                  <div>
                    <Label>Détails</Label>
                    {detailsEditor && (
                      <>
                        {renderToolbar(detailsEditor)}
                        <EditorContent editor={detailsEditor} className="mb-4 bg-white border rounded tiptap p-2 shadow-sm min-h-[150px]" />
                        {form.errors.details && <Text color="red" size="sm">{form.errors.details}</Text>}
                      </>
                    )}
                  </div>
                  <div>
                    <Label>Objectif</Label>
                    {objectiveEditor && (
                      <>
                        {renderToolbar(objectiveEditor)}
                        <EditorContent editor={objectiveEditor} className="mb-4 bg-white border rounded tiptap p-2 shadow-sm min-h-[150px]" />
                        {form.errors.objective && <Text color="red" size="sm">{form.errors.objective}</Text>}
                      </>
                    )}
                  </div>
                  <Group position="apart">
                    <Button
                      onClick={() => editor?.addText(detailsEditor?.getHTML() || 'Texte par défaut', { fontSize: 20, fill: '#000000' })}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!detailsEditor}
                    >
                      Ajouter les détails au canvas
                    </Button>
                    <Group>
                      <Button
                        onClick={() => router.back()}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSaveText}
                        loading={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Sauvegarder
                      </Button>
                    </Group>
                  </Group>
                </Stack>
              </motion.div>
            </Tabs.Panel>
            <Tabs.Panel value="video">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-[calc(100%-60px)] bg-gray-100 flex flex-col items-center justify-center p-4 relative"
              >
                {isVideo && media ? (
                  <div className="p-4 relative">
                    <video ref={videoRef} src={media} controls className="max-w-full rounded shadow" />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 border rounded shadow" />
                    <Button
                      onClick={handleConvertToGif}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Convertir en GIF
                    </Button>
                  </div>
                ) : (
                  <Text c="dimmed">Aucune vidéo chargée</Text>
                )}
              </motion.div>
            </Tabs.Panel>
          </Tabs>
        </main>
        <motion.div
          initial={{ x: 360 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <PropertiesPanel editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} activeTab={activeTab} />
        </motion.div>
      </div>
    </div>
  );
});