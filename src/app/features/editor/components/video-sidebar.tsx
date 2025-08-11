"use client";

import { cn } from "@/lib/utils";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Stack, Text, TextInput, Slider, Tooltip } from "@mantine/core";
import { useState } from "react";
import { useHotkeys } from "@mantine/hooks"; // Corrigé ici

interface VideoSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const VideoSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: VideoSidebarProps) => {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [annotationText, setAnnotationText] = useState("");

  // Raccourcis clavier
  useHotkeys([
    ["T", () => onChangeActiveTool("video-text")],
    ["C", () => onChangeActiveTool("video-crop")],
  ]);

  const handleAddAnnotation = () => {
    if (annotationText && editor) {
      editor.addVideoAnnotation(annotationText);
      setAnnotationText("");
    }
  };

  const handleCrop = () => {
    if (editor) {
      editor.cropVideo(cropArea);
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool.includes("video") ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Outils Vidéo" description="Annoter ou recadrer la vidéo" />
      <ScrollArea>
        <Stack p="md" spacing="md">
          <Tooltip label="Ajouter une annotation texte (T)">
            <Button
              variant={activeTool === "video-text" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("video-text")}
            >
              Annotation Texte
            </Button>
          </Tooltip>
          {activeTool === "video-text" && (
            <Stack spacing="sm">
              <TextInput
                label="Texte d'annotation"
                placeholder="Entrez le texte à ajouter"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.currentTarget.value)}
              />
              <Button onClick={handleAddAnnotation} disabled={!annotationText}>
                Ajouter
              </Button>
            </Stack>
          )}
          <Tooltip label="Recadrer la vidéo (C)">
            <Button
              variant={activeTool === "video-crop" ? "filled" : "outline"}
              onClick={() => onChangeActiveTool("video-crop")}
            >
              Recadrer
            </Button>
          </Tooltip>
          {activeTool === "video-crop" && (
            <Stack spacing="sm">
              <Text weight={500}>Zone de recadrage</Text>
              <Slider
                label="X"
                min={0}
                max={100}
                value={cropArea.x}
                onChange={(value) => setCropArea((prev) => ({ ...prev, x: value }))}
              />
              <Slider
                label="Y"
                min={0}
                max={100}
                value={cropArea.y}
                onChange={(value) => setCropArea((prev) => ({ ...prev, y: value }))}
              />
              <Slider
                label="Largeur"
                min={10}
                max={100}
                value={cropArea.width}
                onChange={(value) => setCropArea((prev) => ({ ...prev, width: value }))}
              />
              <Slider
                label="Hauteur"
                min={10}
                max={100}
                value={cropArea.height}
                onChange={(value) => setCropArea((prev) => ({ ...prev, height: value }))}
              />
              <Button onClick={handleCrop}>Appliquer le recadrage</Button>
            </Stack>
          )}
        </Stack>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
