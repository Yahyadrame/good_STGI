"use client";

import { cn } from "@/lib/utils";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, TextInput, Select, Image, Stack, Text, Loader, Tooltip } from "@mantine/core";
import { useGenerateImage } from "../../ai/api/use-generate-image";
import { useState, useEffect } from "react";
import { useHotkeys } from "@mantine/hooks";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const mutation = useGenerateImage();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("stable-diffusion");
  const [imageSize, setImageSize] = useState("512x512");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [history, setHistory] = useState<{ prompt: string; url: string }[]>([]);

  // Définir les options pour le composant Select à l'extérieur du JSX
  const modelOptions = [
    { value: "stable-diffusion", label: "Stable Diffusion" },
    { value: "dall-e", label: "DALL-E" },
    { value: "midjourney", label: "MidJourney (simulé)" },
  ];

  const imageSizeOptions = [
    { value: "256x256", label: "256x256" },
    { value: "512x512", label: "512x512" },
    { value: "1024x1024", label: "1024x1024" },
  ];

  // Raccourcis clavier
  useHotkeys([
    ["mod+Enter", () => {
      if (activeTool === "ai" && prompt) {
        handleGenerate();
      }
    }],
    ["Escape", () => onChangeActiveTool("select")],
  ]);

  // Gestion de la génération d'image
  const handleGenerate = async () => {
    if (!editor || !prompt) {
      console.error("Editor or prompt is missing");
      return;
    }

    console.log("Submitting prompt:", prompt, "Model:", model, "Size:", imageSize);

    mutation.mutate(
      { prompt, model, size: imageSize },
      {
        onSuccess: ({ data }) => {
          console.log("Success - Generated image data:", data);
          if (data && typeof data === "string") {
            setPreviewImage(data);
            setHistory((prev) => [{ prompt, url: data }, ...prev.slice(0, 4)]);
          } else {
            console.error("Invalid image data received:", data);
          }
        },
        onError: (error) => {
          console.error("Error generating image:", error.message || error);
        },
      }
    );
  };

  // Ajouter l'image au canvas
  const handleAddToCanvas = () => {
    if (previewImage && editor) {
      editor.addImage(previewImage);
      setPreviewImage(null);
    }
  };

  // Fermer la sidebar
  const onClose = () => {
    setPreviewImage(null);
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Générateur IA" description="Créez des images à partir de texte" />
      <ScrollArea>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="p-4 space-y-4"
        >
          <TextInput
            label="Prompt"
            placeholder="Entrez une description (ex. 'Un coucher de soleil sur la plage')"
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            required
            minLength={3}
            disabled={mutation.isPending}
            description="Décrivez l'image à générer"
          />
          <Select
            label="Modèle IA"
            value={model}
            onChange={(value) => setModel(value || "stable-diffusion")}
            data={modelOptions}
            disabled={mutation.isPending}
          />
          <Select
            label="Taille de l'image"
            value={imageSize}
            onChange={(value) => setImageSize(value || "512x512")}
            data={imageSizeOptions}
            disabled={mutation.isPending}
          />
          <Tooltip label="Appuyez sur Ctrl+Enter pour générer">
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending || !prompt}
              loading={mutation.isPending}
            >
              {mutation.isPending ? "Génération..." : "Générer"}
            </Button>
          </Tooltip>
        </form>
        {previewImage && (
          <Stack p="md" spacing="sm">
            <Text weight={500}>Prévisualisation</Text>
            <Image src={previewImage} alt="Prévisualisation" radius="md" />
            <Tooltip label="Ajouter l'image au canvas">
              <Button onClick={handleAddToCanvas} className="w-full">
                Ajouter au canvas
              </Button>
            </Tooltip>
          </Stack>
        )}
        {history.length > 0 && (
          <Stack p="md" spacing="sm">
            <Text weight={500}>Historique des générations</Text>
            {history.map((item, index) => (
              <Stack key={index} spacing="xs">
                <Text size="sm" c="dimmed">{item.prompt}</Text>
                <Image
                  src={item.url}
                  alt={item.prompt}
                  radius="sm"
                  onClick={() => setPreviewImage(item.url)}
                  style={{ cursor: "pointer" }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};