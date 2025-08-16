import { cn } from "@/lib/utils";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useEffect, useMemo, useState } from "react";

interface OpacitySidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const OpacitySidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: OpacitySidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const initialValue = editor?.getActiveOpacity() || 1;
  const selectedObject = useMemo(
    () => editor?.selectedObjects[0],
    [editor?.selectedObjects]
  );

  const [opacityValue, setOpacityValue] = useState(initialValue);

  useEffect(() => {
    if (selectedObject) {
      setOpacityValue(selectedObject.get("opacity") || 1);
    }
  }, [selectedObject]);

  const onChangeOpacity = (value: number) => {
    editor?.changeOpacity(value);
    setOpacityValue(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "opacity" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Opacity"
        description="Modify opacity of your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <Slider
            value={[opacityValue]}
            onValueChange={(values) => onChangeOpacity(values[0])}
            max={1}
            min={0}
            step={0.01}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
