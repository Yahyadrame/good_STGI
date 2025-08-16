import { cn } from "@/lib/utils";
import { ActiveTool, Editor, FILL_COLORS } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useGenerateImage } from "../../ai/api/use-generate-image";
import { useState } from "react";

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

  const [value, setValue] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editor) {
      console.error("Editor is undefined");
      return;
    }

    console.log("Submitting prompt:", value); // Log pour vérifier l'entrée

    mutation.mutate(
      { prompt: value },
      {
        onSuccess: ({ data }) => {
          console.log("Success - Generated image data:", data);
          if (data && typeof data === "string") {
            editor.addImage(data);
          } else {
            console.error("Invalid image data received:", data);
          }
        },
        onError: (error) => {
          console.error("Error generating image:", error.message || error);
        },
        onSettled: () => {
          console.log("Mutation settled"); // Log quand la mutation se termine
        },
      }
    );
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Ai" description="Generate image from text" />
      <ScrollArea>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <textarea
            disabled={mutation.isPending}
            placeholder="Enter your text here"
            cols={30}
            rows={10}
            value={value}
            required
            minLength={3}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Generating..." : "Generate"}
          </Button>
        </form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
