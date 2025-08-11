"use client";

import { cn } from "@/lib/utils";
import { ActiveTool, Editor, TEXT_STYLES } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Select, TextInput, Stack } from "@mantine/core";
import { useState } from "react";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<string>("Paragraph");

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleAddText = () => {
    if (!text || !editor) return;
    editor.addText(text, TEXT_STYLES[style]);
    setText("");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Texte" description="Ajouter du texte au canvas" />
      <ScrollArea>
        <Stack spacing="md" className="p-4">
          <TextInput
            label="Texte"
            placeholder="Entrez le texte à ajouter"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            className="w-full"
          />
          <Select
            label="Style"
            value={style}
            onChange={(value) => setStyle(value || "Paragraph")}
            data={Object.keys(TEXT_STYLES).map((key) => ({ value: key, label: key }))}
          />
          <Button
            onClick={handleAddText}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!text}
          >
            Ajouter au canvas
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() => editor?.addText("Titre", TEXT_STYLES.Heading)}
          >
            <span className="text-3xl font-bold">Ajouter un titre</span>
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() => editor?.addText("Sous-titre", TEXT_STYLES.Subheading)}
          >
            <span className="text-xl font-semibold">Ajouter un sous-titre</span>
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() => editor?.addText("Paragraphe", TEXT_STYLES.Paragraph)}
          >
            Paragraphe
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() => editor?.addText("Instruction", TEXT_STYLES.Instruction)}
          >
            <span className="text-lg italic text-blue-600">Ajouter une instruction</span>
          </Button>
        </Stack>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};