"use client";

import {
  LayoutTemplate,
  ImageIcon,
  Pencil,
  Presentation,
  Settings,
  Shapes,
  Sparkles,
  Type,
  FileText,
  ArrowRight,
} from "lucide-react";
import { SideBartItem } from "./Sidebar-item";
import { ActiveTool } from "../../types";

interface SideBarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const SideBar = ({ activeTool, onChangeActiveTool }: SideBarProps) => {
  return (
    <aside className="bg-white flex flex-col w-[100px] h-full border-r overflow-y-auto">
      <ul className="flex flex-col">
        <SideBartItem
          icon={LayoutTemplate}
          label="Design"
          isActive={activeTool === "templates"}
          onClick={() => {
            onChangeActiveTool("templates");
          }}
        />
        <SideBartItem
          icon={ImageIcon}
          label="Image"
          isActive={activeTool === "images"}
          onClick={() => {
            onChangeActiveTool("images");
          }}
        />
        <SideBartItem
          icon={Type}
          label="Text"
          isActive={activeTool === "text"}
          onClick={() => {
            onChangeActiveTool("text");
          }}
        />
        <SideBartItem
          icon={Shapes}
          label="Shapes"
          isActive={activeTool === "shapes"}
          onClick={() => {
            onChangeActiveTool("shapes");
          }}
        />
        
        
        <SideBartItem
          icon={Sparkles}
          label="AI"
          isActive={activeTool === "ai"}
          onClick={() => {
            onChangeActiveTool("ai");
          }}
        />
        <SideBartItem
          icon={Pencil}
          label="Draw"
          isActive={activeTool === "draw"}
          onClick={() => {
            onChangeActiveTool("draw");
          }}
        />
        <SideBartItem
          icon={Settings}
          label="Settings"
          isActive={activeTool === "settings"}
          onClick={() => {
            onChangeActiveTool("settings");
          }}
        />
      </ul>
    </aside>
  );
};
