"use client";

import { Stack, Text, Button, Tooltip } from '@mantine/core';
import { ActiveTool, Editor } from '../../types';
import { ShapesSidebar } from './shapes-sidebar';
import { TextSidebar } from './text-sidebar';
import { ImageSidebar } from './image-sidebar';
import { AiSidebar } from './ai-sidebar';
import { VideoSidebar } from './video-sidebar';
import { useHotkeys } from "@mantine/hooks"; // Supprimé HotkeysProvider

interface SideBarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  activeTab: "image" | "text" | "video";
}

export const SideBar = ({ editor, activeTool, onChangeActiveTool, activeTab }: SideBarProps) => {
  useHotkeys([
    ["S", () => onChangeActiveTool("select")],
    ["T", () => activeTab === "image" && onChangeActiveTool("text")],
    ["I", () => activeTab === "image" && onChangeActiveTool("image")],
    ["A", () => activeTab === "image" && onChangeActiveTool("ai")],
    ["V", () => activeTab === "video" && onChangeActiveTool("video-text")],
  ]);

  return (
    <Stack spacing="md" p="md"> {/* Supprimé HotkeysProvider */}
      <Text weight={500}>Outils</Text>
      {activeTab === "image" && (
        <>
          <Tooltip label="Sélectionner (S)">
            <Button
              variant={activeTool === "select" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("select")}
            >
              Sélection
            </Button>
          </Tooltip>
          <Tooltip label="Ajouter du texte (T)">
            <Button
              variant={activeTool === "text" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("text")}
            >
              Texte
            </Button>
          </Tooltip>
          <Tooltip label="Ajouter une image (I)">
            <Button
              variant={activeTool === "image" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("image")}
            >
              Image
            </Button>
          </Tooltip>
          <Tooltip label="Générer avec IA (A)">
            <Button
              variant={activeTool === "ai" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("ai")}
            >
              IA
            </Button>
          </Tooltip>
          {activeTool === "shapes" && (
            <ShapesSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          )}
          {activeTool === "text" && (
            <TextSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          )}
          {activeTool === "image" && (
            <ImageSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          )}
          {activeTool === "ai" && (
            <AiSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          )}
        </>
      )}
      {activeTab === "text" && (
        <TextSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
      )}
      {activeTab === "video" && (
        <>
          <Tooltip label="Annotation texte (V)">
            <Button
              variant={activeTool === "video-text" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("video-text")}
            >
              Annotation Texte
            </Button>
          </Tooltip>
          <Tooltip label="Recadrer (C)">
            <Button
              variant={activeTool === "video-crop" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("video-crop")}
            >
              Recadrer
            </Button>
          </Tooltip>
          {(activeTool === "video-text" || activeTool === "video-crop") && (
            <VideoSidebar editor={editor} activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
          )}
        </>
      )}
    </Stack>
  );
};