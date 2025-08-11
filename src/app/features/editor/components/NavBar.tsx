"use client";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  Download,
  Menu,
  MousePointerClick,
  Redo2,
  Undo2,
} from "lucide-react";
import { useFilePicker } from "use-file-picker";
import { CiFileOn } from "react-icons/ci";
import { BsCloudCheck } from "react-icons/bs";
import { ActiveTool, Editor } from "../../types";
import { cn } from "@/lib/utils";
import { Group, Tabs, TabsList } from '@mantine/core';

interface NavBarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  activeTab: "image" | "text" | "video";
  setActiveTab: (tab: "image" | "text" | "video") => void;
}

export const NavBar = ({
  activeTool,
  onChangeActiveTool,
  editor,
  onSave,
  onToggleSidebar,
  activeTab,
  setActiveTab,
}: NavBarProps) => {
  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    },
  });

  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 bg-gray-800 text-white shadow-md">
      <Group className="flex items-center gap-x-4">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-700"
        >
          <Menu className="size-6" />
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
              File
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60">
            <DropdownMenuItem
              onClick={() => openFilePicker()}
              className="flex items-center gap-x-2"
            >
              <CiFileOn className="size-8" />
              <div>
                <p>Open</p>
                <p className="text-xs text-muted-foreground">Open a json file</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="mx-2 bg-gray-600" />
        <Hint label="Select" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeActiveTool("select")}
            className={cn("text-white hover:bg-gray-700", activeTool === "select" && "bg-gray-700")}
          >
            <MousePointerClick className="size-4" />
          </Button>
        </Hint>
        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor?.onUndo()}
            disabled={!editor?.canUndo()}
            className="text-white hover:bg-gray-700"
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>
        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor?.onRedo()}
            disabled={!editor?.canRedo()}
            className="text-white hover:bg-gray-700"
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>
        <Separator orientation="vertical" className="mx-2 bg-gray-600" />
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as "image" | "text" | "video")}>
          <TabsList>
            <Tabs.Tab value="image">Image</Tabs.Tab>
            <Tabs.Tab value="text">Texte</Tabs.Tab>
            <Tabs.Tab value="video">Vidéo</Tabs.Tab>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-x-2">
          <BsCloudCheck className="size-[20px] text-gray-400" />
          <div className="text-xs text-gray-400">saved</div>
        </div>
      </Group>
      <Group className="ml-auto">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
              Export <Download className="size-4 ml-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-60">
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => editor?.saveAsJson()}
            >
              <CiFileOn className="size-8" />
              <div>
                <p>JSON</p>
                <p className="text-xs text-muted-foreground">Save for later editing</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => editor?.saveAsPng()}
            >
              <CiFileOn className="size-8" />
              <div>
                <p>PNG</p>
                <p className="text-xs text-muted-foreground">Save for later editing</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => editor?.saveAsJpg()}
            >
              <CiFileOn className="size-8" />
              <div>
                <p>JPG</p>
                <p className="text-xs text-muted-foreground">Save for later editing</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => editor?.saveAsSvg()}
            >
              <CiFileOn className="size-8" />
              <div>
                <p>SVG</p>
                <p className="text-xs text-muted-foreground">Save for later editing</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Sauvegarder
        </Button>
      </Group>
    </nav>
  );
};