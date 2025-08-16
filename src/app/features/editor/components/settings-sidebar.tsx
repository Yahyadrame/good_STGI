import { cn } from "@/lib/utils";
import { ActiveTool, Editor, FILL_COLORS } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SettingsSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const workspace = editor?.getWorkspace();
  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(
    () => workspace?.fill ?? "#ffffff",
    [workspace]
  );

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  const onChangeWidth = (value: string) => {
    setWidth(value);
  };

  const onChangeHeight = (value: string) => {
    setHeight(value);
  };

  const onChangeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackgroundWorkspace(value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  };

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
    setBackground(initialBackground);
  }, [initialWidth, initialHeight, initialBackground]);

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "settings" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Settings"
        description="Settings for your canvas"
      />
      <ScrollArea>
        <form className="p-4 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input
              placeholder="height"
              value={height}
              type="number"
              onChange={(e) => onChangeHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Width</Label>
            <Input
              placeholder="width"
              value={width}
              type="number"
              onChange={(e) => onChangeWidth(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Rezise
          </Button>
        </form>
        <div className="p-4">
          <ColorPickers
            value={background as string}
            onChange={onChangeBackground}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
