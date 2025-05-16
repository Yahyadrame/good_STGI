import { cn } from "@/lib/utils";
import { ActiveTool, Editor, FILL_COLORS } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRemoveBg } from "../../ai/api/use-remove-bg";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };
  const mutation = useRemoveBg();
  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  const onRemoveBg = () => {
    mutation.mutate(
      {
        image: imageSrc,
      },
      {
        onSuccess: ({ data }) => {
          editor?.addImage(data);
        },
      }
    );
  };
  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden"
      )}
    >
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Feature is not available for this image
          </p>
        </div>
      )}
      <ToolSidebarHeader
        title="Background removal"
        description="remove background from your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {imageSrc && (
            <div
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition bg-muted",
                false && "opacity-50"
              )}
            >
              <Image src={imageSrc} alt="Image" fill className="object-cover" />
            </div>
          )}
          <Button onClick={onRemoveBg} className="w-full">
            Remove Background
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
