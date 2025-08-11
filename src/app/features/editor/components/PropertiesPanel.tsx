"use client";

import { Stack, Text, Button, Group, ActionIcon } from '@mantine/core';
import { ActiveTool, Editor } from '../../types';
import { ShapesSidebar } from './shapes-sidebar';
import { FillColorSidebar } from './fill-color-sidebar';
import { StrokeColorSidebar } from './stroke-color-sidebar';
import { StrokWidthSidebar } from './stroke-width-sidebar';
import { OpacitySidebar } from './opacity-sidebar';
import { TextSidebar } from './text-sidebar';
import { TextBoxColorSidebar } from './TextBoxColorSidebar';
import { FontSidebar } from './font-sidebar';
import { ImageSidebar } from './image-sidebar';
import { FilterSidebar } from './filter-sidebar';
import { RemoveBgSidebar } from './remove-bg-sidebar';
import { AiSidebar } from './ai-sidebar';
import { VideoSidebar } from './video-sidebar';
import { motion } from 'framer-motion';
import { IconArrowUp, IconArrowDown, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react'; // Added useEffect import

interface PropertiesPanelProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  activeTab: "image" | "text" | "video";
}

export const PropertiesPanel = ({ editor, activeTool, onChangeActiveTool, activeTab }: PropertiesPanelProps) => {
  const activeObject = editor?.canvas?.getActiveObject();
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  // Mettre à jour les calques lorsque le canvas change
  const updateLayers = () => {
    if (editor?.canvas) {
      setLayers(editor.canvas.getObjects().filter(obj => obj.name !== "clip")); // Exclude workspace
    }
  };

  // Initialiser et écouter les changements du canvas
  useEffect(() => {
    if (editor?.canvas) {
      updateLayers();
      editor.canvas.on('object:added', updateLayers);
      editor.canvas.on('object:removed', updateLayers);
      editor.canvas.on('object:modified', updateLayers);
      return () => {
        editor.canvas.off('object:added', updateLayers);
        editor.canvas.off('object:removed', updateLayers);
        editor.canvas.off('object:modified', updateLayers);
      };
    }
  }, [editor?.canvas]);

  const moveLayerUp = (index: number) => {
    if (editor?.canvas && index > 0) {
      const obj = layers[index];
      editor.canvas.bringForward(obj);
      editor.canvas.renderAll();
      updateLayers();
      editor.save(); // Save history
    }
  };

  const moveLayerDown = (index: number) => {
    if (editor?.canvas && index < layers.length - 1) {
      const obj = layers[index];
      editor.canvas.sendBackwards(obj);
      editor.canvas.renderAll();
      updateLayers();
      editor.save(); // Save history
    }
  };

  const removeLayer = (index: number) => {
    if (editor?.canvas) {
      const obj = layers[index];
      editor.canvas.remove(obj);
      editor.canvas.renderAll();
      updateLayers();
      editor.save(); // Save history
    }
  };

  const selectLayer = (index: number) => {
    if (editor?.canvas) {
      const obj = layers[index];
      editor.canvas.setActiveObject(obj);
      editor.canvas.renderAll();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white shadow-lg p-4 h-full overflow-y-auto"
    >
      <Text fw={700} size="lg" className="mb-4">Propriétés</Text>
      {activeTab === 'text' ? (
        <Stack spacing="md">
          <TextSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          <FontSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          <TextBoxColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        </Stack>
      ) : activeTab === 'video' ? (
        <Stack spacing="md">
          <VideoSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        </Stack>
      ) : (
        <>
          {activeTab === 'image' && (
            <Stack spacing="md" className="mb-4">
              <Text weight={500}>Calques</Text>
              {layers.length === 0 ? (
                <Text c="dimmed">Aucun calque</Text>
              ) : (
                layers.map((obj, index) => (
                  <Group key={index} position="apart" className="border-b py-2">
                    <Text
                      size="sm"
                      onClick={() => selectLayer(index)}
                      style={{ cursor: "pointer" }}
                    >
                      {obj.type === 'textbox' ? 'Texte' : obj.type === 'image' ? (obj.isVideo ? 'Vidéo' : 'Image') : 'Forme'}
                    </Text>
                    <Group spacing="xs">
                      <ActionIcon onClick={() => moveLayerUp(index)} disabled={index === 0}>
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon onClick={() => moveLayerDown(index)} disabled={index === layers.length - 1}>
                        <IconArrowDown size={16} />
                      </ActionIcon>
                      <ActionIcon onClick={() => removeLayer(index)} color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                ))
              )}
            </Stack>
          )}
          {!activeObject ? (
            <Text c="dimmed">Aucun objet sélectionné</Text>
          ) : (
            <Stack spacing="md">
              {activeObject.type === 'textbox' && (
                <>
                  <TextSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <FontSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <TextBoxColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                </>
              )}
              {activeObject.type === 'image' && (
                <>
                  <ImageSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <FilterSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <RemoveBgSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <AiSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                </>
              )}
              {(activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') && (
                <>
                  <ShapesSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <FillColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <StrokeColorSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <StrokWidthSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                  <OpacitySidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
                </>
              )}
            </Stack>
          )}
        </>
      )}
    </motion.div>
  );
};