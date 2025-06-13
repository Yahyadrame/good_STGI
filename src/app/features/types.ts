import { fabric } from "fabric";
import { ITextOptions } from "fabric/fabric-impl";
import * as material from "material-colors";

export const JSON_KEYS = [
  "name",
  "grandientAngle",
  "selectable",
  "hasControls",
  "linkData",
  "editable",
  "extensionType",
  "extensions",
];

export const filters = [
  "none",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "greyscale",
  "brownie",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "sharpen",
  "emboss",
  "removecolor",
  "blacknwhite",
  "vibrance",
  "blendcolor",
  "huerotate",
  "resize",
  "saturation",
  "gamma",
];
export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const colors = [
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.grey["500"],
  material.blueGrey["500"],
  "transparent",
];
export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates"
  | "textRich"
  | "arrow";

export const fonts = [
  "Ariar",
  "Arial",
  "Arial Black",
  "Arial Narrow",
  "Arial Rounded MT Bold",
  "Avant Garde",
  "Calibri",
  "Cambria",
  "Candara",
  "Century Gothic",
  "Century Schoolbook",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Lucida Sans",
  "Lucida Sans Typewriter",
  "Monaco",
  "Palatino Linotype",
  "Segoe Print",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Wingdings",
  "Arial Black",
  "Arial Narrow",
  "Arial Rounded MT Bold",
  "Avant Garde",
  "Calibri",
  "Cambria",
  "Candara",
  "Century Gothic",
  "Century Schoolbook",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Lucida Sans",
  "Lucida Sans Typewriter",
];
export interface EditorHookProps {
  clearSelectionCallback?: () => void;
}
export const FILL_COLORS = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_SIZE = 46;
export const FONT_FAMILY = "Arial";
export const FONT_WEIGHT = 500;

export const CIRCLE_OPTIONS = {
  radius: 225,
  left: 100,
  top: 100,
  strokeWidth: STROKE_WIDTH,
  fill: FILL_COLORS,
  stroke: STROKE_COLOR,
};

export const RECTAGNLE_OPTIONS = {
  left: 100,
  right: 100,
  fill: FILL_COLORS,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  height: 400,
  width: 400,
  angle: 0,
};

export const LINE_OPTIONS = {
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  evented: true,
};

export const TRIAGNLE_OPTIONS = {
  left: 100,
  right: 100,
  fill: FILL_COLORS,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  height: 400,
  width: 400,
  angle: 0,
};

export const TEXT_OPTIONS = {
  type: "text",
  left: 100,
  right: 100,
  fill: FILL_COLORS,
  fontSize: FONT_SIZE,
  fontFamily: FONT_FAMILY,
};

export type BuildEditorProps = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  save: (skip?: boolean) => void;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  canvas: fabric.Canvas;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeDashArray: number[];
  fontFamily: string;
  setStrokeDashArray: (strokeDashArray: number[]) => void;
  setFillColor: (fillColor: string) => void;
  setStrokeColor: (strokeColor: string) => void;
  setStrokeWidth: (strokeWidth: number) => void;
  selectedObjects: fabric.Object[];
  setFontFamily: (value: string) => void;
};

export interface Editor {
  saveAsPng: () => void;
  saveAsSvg: () => void;
  saveAsJpg: () => void;
  saveAsJson: () => void;
  loadJson: (json: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getWorkspace: () => fabric.Object | undefined;
  changeSize: (value: { width: number; height: number }) => void;
  changeBackgroundWorkspace: (value: string) => void;
  enabledDrawingMode: () => void;
  disabledDrawingMode: () => void;
  onCopy: () => void;
  onPaste: () => void;
  delete: () => void;
  changeTexAlign: (value: string) => void;
  changeFontFamily: (value: string) => void;
  addText: (value: string, options?: ITextOptions) => void;
  getActiveOpacity: () => number;
  changeOpacity: (value: number) => void;
  changeFontSize: (value: number) => void;
  changeFontWeight: (value: number) => void;
  changeFontStyle: (value: string) => void;
  bringForward: () => void;
  sendBackward: () => void;
  changeFillColor: (value: string) => void;
  changeBackgroundColor: (value: string) => void; // Nouvelle méthode
  changeStrokeColor: (value: string) => void;
  changeStrokeWidth: (value: number) => void;
  changeStrokeDashArray: (value: number[]) => void;
  changeFontUnderline: (value: boolean) => void;
  changeFontLineThrough: (value: boolean) => void;
  addCircle: () => void;
  addSoftRetangle: () => void;
  addRetangle: () => void;
  addTriangle: () => void;
  addCurvedArrow: () => void;
  addRows: (direction?: "up" | "down" | "left" | "right") => void;
  getActiveFillColor: () => string;
  getActiveFontFamily: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray: () => number[];
  getActiveFontWeight: () => number;
  getActiveFontStyle: () => string;
  getActiveFontUnderline: () => boolean;
  getActiveFontLineThrough: () => boolean;
  getActiveTextAlign: () => string;
  getActiveFontSize: () => number;
  canvas: fabric.Canvas;
  selectedObjects: fabric.Object[];
  changeImageFilter: (value: string) => void;
  addImage: (url: string) => void;
}
