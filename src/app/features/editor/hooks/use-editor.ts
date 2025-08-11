import { useCallback, useState, useMemo, useEffect } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./use-auto-resize";
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  Editor,
  FILL_COLORS,
  RECTANGLE_OPTIONS,
  STROKE_COLOR,
  STROKE_WIDTH,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
} from "../../types";
import { useCanvasEvents } from "./use-canvas-events";
import {
  createFilter,
  downloadFile,
  isTextType,
  transformText,
} from "../../utils";
import { useClipboard } from "./use-clipboard";
import { useHistory } from "./use-history";
import { useHotkeys } from "./use-hotkeys";

export const useEditor = ({ clearSelectionCallback }: EditorHookProps) => {
  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [fillColor, setFillColor] = useState(FILL_COLORS);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

  const { save, canRedo, canUndo, canvasHistory, redo, undo, setHistoryIndex } = useHistory({ canvas });


  useHotkeys({
    canvas,
    copy: () => copy(),
    paste: () => paste(),
    redo,
    save,
    undo,
  });

  
  const buildEditor = ({
    undo,
    redo,
    canRedo,
    canUndo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    fontFamily,
    fillColor,
    strokeColor,
    strokeWidth,
    selectedObjects,
    strokeDashArray,
    setStrokeDashArray,
    setFontFamily,
  }: BuildEditorProps): Editor => {
    const generateSaveOptions = () => {
      const workspace = getWorkspace() as fabric.Rect;
      if (!workspace) {
        throw new Error("Workspace not found");
      }
      const { width, height, left, top } = workspace;

      return {
        name: "Image",
        format: "png",
        quality: 1,
        width,
        height,
        left,
        top,
      };
    };

    const saveAsPng = () => {
      if (!canvas) return;
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL(options);
      downloadFile(dataURL, "png");
      autoZoom();
    };

    const saveAsSvg = () => {
      if (!canvas) return;
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL({ ...options, format: "svg" });
      downloadFile(dataURL, "svg");
      autoZoom();
    };

    const saveAsJpg = () => {
      if (!canvas) return;
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL({ ...options, format: "jpeg" });
      downloadFile(dataURL, "jpg");
      autoZoom();
    };

    const saveAsJson = async () => {
      if (!canvas) return;
      const data = canvas.toJSON(JSON_KEYS);
      await transformText(data.objects);
      const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, "\t")
      )}`;
      downloadFile(fileString, "json");
    };

    const loadJson = async (json: string) => {
      if (!canvas) return;
      const data = JSON.parse(json);
      canvas.loadFromJSON(data, () => {
        autoZoom();
      });
    };

    const getWorkspace = () => {
      return canvas?.getObjects().find((object) => object.name === "clip");
    };

    const center = (object: fabric.Object) => {
      const workspace = getWorkspace();
      const center = workspace?.getCenterPoint();
      if (center && workspace && canvas) {
        canvas._centerObject(object, center);
      }
    };

    const addToCanvas = (object: fabric.Object) => {
      if (!canvas) return;
      center(object);
      canvas.add(object);
      canvas.setActiveObject(object);
      save();
    };

    const addText = (value: string, options?: Partial<fabric.ITextboxOptions>) => {
      if (!canvas) return;
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        editable: true,
        padding: 10,
        backgroundColor: "#ffffff",
        ...options,
      });
      addToCanvas(object);
      object.enterEditing();
      object.selectAll();
      canvas.renderAll();
    };

    const addVideoAnnotation = (text: string) => {
      if (!canvas) return;
      const textObj = new fabric.Textbox(text, {
        ...TEXT_OPTIONS,
        left: 50,
        top: 50,
        width: 200,
        fontSize: 20,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 1,
        editable: true,
      });
      addToCanvas(textObj);
    };

    const cropVideo = (cropArea: { x: number; y: number; width: number; height: number }) => {
      if (!canvas) return;
      const objects = canvas.getActiveObjects();
      const videoObj = objects.find((obj) => obj.type === "image" && (obj as any).isVideo);
      if (videoObj) {
        videoObj.set({
          clipPath: new fabric.Rect({
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
            absolutePositioned: true,
          }),
        });
        canvas.renderAll();
        save();
      }
    };

    return {
      saveAsPng,
      saveAsSvg,
      saveAsJpg,
      saveAsJson,
      loadJson,
      autoZoom,
      zoomIn: () => {
        if (!canvas) return;
        let zoomRatio = canvas.getZoom();
        zoomRatio += 0.5;
        const center = canvas.getCenter();
        canvas.zoomToPoint(
          new fabric.Point(center.left, center.top),
          zoomRatio > 1 ? 1 : zoomRatio
        );
      },
      zoomOut: () => {
        if (!canvas) return;
        let zoomRatio = canvas.getZoom();
        zoomRatio -= 0.5;
        const center = canvas.getCenter();
        canvas.zoomToPoint(
          new fabric.Point(center.left, center.top),
          zoomRatio < 0.2 ? 0.2 : zoomRatio
        );
      },
      getWorkspace,
      changeSize: (value: { width: number; height: number }) => {
        const workspace = getWorkspace();
        if (workspace && canvas) {
          workspace.set(value);
          autoZoom();
          save();
        }
      },
      changeBackgroundWorkspace: (value: string) => {
        const workspace = getWorkspace();
        if (workspace && canvas) {
          workspace.set({ fill: value });
          canvas.renderAll();
          save();
        }
      },
      enabledDrawingMode: () => {
        if (!canvas) return;
        canvas.discardActiveObject();
        canvas.renderAll();
        canvas.isDrawingMode = true;
      },
      disabledDrawingMode: () => {
        if (!canvas) return;
        canvas.isDrawingMode = false;
      },
      onRedo: () => redo(),
      onUndo: () => undo(),
      canRedo,
      canUndo,
      onCopy: () => copy(),
      onPaste: () => paste(),
      changeImageFilter: (value: string) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (object.type === "image") {
            const imageObject = object as fabric.Image;
            const effect = createFilter(value);
            imageObject.filters = effect ? [effect] : [];
            imageObject.applyFilters();
            canvas.renderAll();
          }
        });
        save();
      },
      addImage: (url: string) => {
        if (!canvas) return;
        fabric.Image.fromURL(
          url,
          (image) => {
            const workspace = getWorkspace();
            if (workspace) {
              image.scaleToWidth(workspace.width / 2);
              image.scaleToHeight(workspace.height / 2);
              addToCanvas(image);
            }
          },
          { crossOrigin: "anonymous" }
        );
      },
      delete: () => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => canvas.remove(object));
        canvas.discardActiveObject();
        canvas.renderAll();
        save();
      },
      addText,
      addCircle: () => {
        if (!canvas) return;
        const object = new fabric.Circle({
          ...CIRCLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });
        addToCanvas(object);
      },
      addSoftRectangle: () => {
        if (!canvas) return;
        const object = new fabric.Rect({
          ...RECTANGLE_OPTIONS,
          rx: 50,
          ry: 50,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });
        addToCanvas(object);
      },
      addRectangle: () => {
        if (!canvas) return;
        const object = new fabric.Rect({
          ...RECTANGLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });
        addToCanvas(object);
      },
      addTriangle: () => {
        if (!canvas) return;
        const object = new fabric.Triangle({
          ...RECTANGLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });
        addToCanvas(object);
      },
      addCurvedArrow: (direction: "up" | "down" | "left" | "right" = "down", curvature: number = 0.5) => {
        if (!canvas) return;
        const controlPointOffset = 100 * curvature;
        const arrowLength = 150;
        const headSize = 15;

        let startX = 0, startY = 0, controlX = 0, controlY = 0, endX = 0, endY = 0, headAngle = 0;

        switch (direction) {
          case "up":
            endX = 0;
            endY = -arrowLength;
            controlX = controlPointOffset * (curvature > 0 ? 1 : -1);
            controlY = -controlPointOffset * Math.abs(curvature);
            headAngle = 0;
            break;
          case "down":
            endX = 0;
            endY = arrowLength;
            controlX = controlPointOffset * (curvature > 0 ? 1 : -1);
            controlY = controlPointOffset * Math.abs(curvature);
            headAngle = 180;
            break;
          case "left":
            endX = -arrowLength;
            endY = 0;
            controlX = -controlPointOffset * Math.abs(curvature);
            controlY = controlPointOffset * (curvature > 0 ? -1 : 1);
            headAngle = -90;
            break;
          case "right":
            endX = arrowLength;
            endY = 0;
            controlX = controlPointOffset * Math.abs(curvature);
            controlY = controlPointOffset * (curvature > 0 ? -1 : 1);
            headAngle = 90;
            break;
        }

        const curvePath = `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;
        const curve = new fabric.Path(curvePath, {
          stroke: strokeColor || "#000000",
          strokeWidth: strokeWidth || 2,
          strokeDashArray: strokeDashArray,
          fill: "",
          selectable: true,
          hasControls: true,
          originX: "center",
          originY: "center",
        });

        const head = new fabric.Triangle({
          width: headSize,
          height: headSize * 1.5,
          fill: strokeColor || "#000000",
          left: endX,
          top: endY,
          angle: headAngle,
          originX: "center",
          originY: "center",
          selectable: false,
        });

        const curvedArrow = new fabric.Group([curve, head], {
          left: 0,
          top: 0,
          selectable: true,
          hasControls: true,
          hasRotatingPoint: true,
          lockRotation: false,
          rotatingPointOffset: 40,
          originX: "center",
          originY: "center",
        });

        addToCanvas(curvedArrow);
        canvas.renderAll();
      },
      addRows: (direction: "up" | "down" | "left" | "right" = "down") => {
        if (!canvas) return;
        let lineCoords: number[] = [0, 0, 0, 100];
        let triangleLeft = 0;
        let triangleTop = 100;
        let triangleAngle = 180;

        if (direction === "up") {
          lineCoords = [0, 0, 0, -100];
          triangleLeft = 0;
          triangleTop = -100;
          triangleAngle = 0;
        } else if (direction === "left") {
          lineCoords = [0, 0, -100, 0];
          triangleLeft = -100;
          triangleTop = 0;
          triangleAngle = -90;
        } else if (direction === "right") {
          lineCoords = [0, 0, 100, 0];
          triangleLeft = 100;
          triangleTop = 0;
          triangleAngle = 90;
        }

        const line = new fabric.Line(lineCoords, {
          stroke: strokeColor || "#000000",
          strokeWidth: strokeWidth || 2,
          strokeDashArray: strokeDashArray,
          selectable: true,
          hasControls: true,
          originX: "center",
          originY: "center",
        });

        const triangle = new fabric.Triangle({
          width: 15,
          height: 20,
          fill: strokeColor || "#000000",
          left: triangleLeft,
          top: triangleTop,
          angle: triangleAngle,
          selectable: false,
          originX: "center",
          originY: "center",
        });

        const arrow = new fabric.Group([line, triangle], {
          left: 0,
          top: 0,
          selectable: true,
          hasControls: true,
          hasRotatingPoint: true,
          lockRotation: false,
          rotatingPointOffset: 40,
          originX: "center",
          originY: "center",
        });

        addToCanvas(arrow);
        canvas.renderAll();
      },
      getActiveOpacity: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? selectedObject.get("opacity") || 1 : 1;
      },
      changeFontWeight: (value: number) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ fontWeight: value });
        });
        canvas.renderAll();
        save();
      },
      getActiveFontStyle: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("fontStyle") as string) || "normal" : "normal";
      },
      changeFontStyle: (value: string) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ fontStyle: value });
        });
        canvas.renderAll();
        save();
      },
      getActiveFontLineThrough: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("linethrough") as boolean) || false : false;
      },
      changeFontLineThrough: (value: boolean) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ linethrough: value });
        });
        canvas.renderAll();
        save();
      },
      getActiveTextAlign: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("textAlign") as string) || "left" : "left";
      },
      changeTextAlign: (value: string) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ textAlign: value });
        });
        canvas.renderAll();
        save();
      },
      getActiveFontSize: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("fontSize") as number) || FONT_SIZE : FONT_SIZE;
      },
      changeFontSize: (value: number) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ fontSize: value });
        });
        canvas.renderAll();
        save();
      },
      getActiveFontUnderline: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("underline") as boolean) || false : false;
      },
      changeFontUnderline: (value: boolean) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ underline: value });
        });
        canvas.renderAll();
        save();
      },
      changeOpacity: (value: number) => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => object.set({ opacity: value }));
        canvas.renderAll();
        save();
      },
      bringForward: () => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => canvas.bringForward(object));
        canvas.renderAll();
        const workspace = getWorkspace();
        if (workspace) workspace.sendToBack();
        save();
      },
      sendBackward: () => {
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => canvas.sendBackwards(object));
        canvas.renderAll();
        const workspace = getWorkspace();
        if (workspace) workspace.sendToBack();
        save();
      },
      changeFillColor: (value: string) => {
        if (!canvas) return;
        setFillColor(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => object.set({ fill: value }));
        canvas.renderAll();
        save();
      },
      changeBackgroundColor: (value: string) => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject && isTextType(activeObject.type)) {
          activeObject.set({ backgroundColor: value, transparentCorners: false });
          canvas.renderAll();
          save();
        }
      },
      changeFontFamily: (value: string) => {
        if (!canvas) return;
        setFontFamily(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) object.set({ fontFamily: value });
        });
        canvas.renderAll();
        save();
      },
      changeStrokeColor: (value: string) => {
        if (!canvas) return;
        setStrokeColor(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (object.type === "group") {
            object.getObjects().forEach((groupObject) => {
              if (groupObject.type === "path" || groupObject.type === "triangle") {
                groupObject.set({ stroke: value });
              }
            });
          } else if (isTextType(object.type)) {
            object.set({ stroke: value });
          } else {
            object.set({ stroke: value });
          }
        });
        canvas.freeDrawingBrush.color = value;
        canvas.renderAll();
        save();
      },
      changeStrokeWidth: (value: number) => {
        if (!canvas) return;
        setStrokeWidth(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (object.type === "group") {
            object.getObjects().forEach((groupObject) => {
              if (groupObject.type === "path" || groupObject.type === "triangle") {
                groupObject.set({ strokeWidth: value });
              }
            });
          } else {
            object.set({ strokeWidth: value });
          }
        });
        canvas.freeDrawingBrush.width = value;
        canvas.renderAll();
        save();
      },
      changeStrokeDashArray: (value: number[]) => {
        if (!canvas) return;
        setStrokeDashArray(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (object.type === "group") {
            object.getObjects().forEach((groupObject) => {
              if (groupObject.type === "path" || groupObject.type === "triangle") {
                groupObject.set({ strokeDashArray: value });
              }
            });
          } else {
            object.set({ strokeDashArray: value });
          }
        });
        canvas.renderAll();
        save();
      },
      getActiveFontWeight: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("fontWeight") as number) || FONT_WEIGHT : FONT_WEIGHT;
      },
      getActiveFontFamily: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("fontFamily") as string) || fontFamily : fontFamily;
      },
      getActiveFillColor: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("fill") as string) || fillColor : fillColor;
      },
      getActiveStrokeColor: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("stroke") as string) || strokeColor : strokeColor;
      },
      getActiveStrokeWidth: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("strokeWidth") as number) || strokeWidth : strokeWidth;
      },
      getActiveStrokeDashArray: () => {
        const selectedObject = selectedObjects[0];
        return selectedObject ? (selectedObject.get("strokeDashArray") as number[]) || strokeDashArray : strokeDashArray;
      },
      selectedObjects,
      addVideoAnnotation,
      cropVideo,
    };
  };

  const { copy, paste } = useClipboard({ canvas });
  const { autoZoom } = useAutoResize({ canvas, container });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        redo,
        undo,
        canRedo,
        canUndo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeColor,
        strokeWidth,
        strokeDashArray,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
      });
    }
    return undefined;
  }, [
    autoZoom,
    canvas,
    fillColor,
    strokeColor,
    strokeWidth,
    strokeDashArray,
    setFontFamily,
    copy,
    paste,
    undo,
    redo,
    canRedo,
    canUndo,
    save,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLElement;
    }) => {
      if (!initialContainer) return;

      const initialWorkspace = new fabric.Rect({
        width: 900,
        height: 1200,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "white",
          blur: 5,
        }),
      });

      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(initialContainer.offsetHeight);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [canvasHistory, setHistoryIndex]
  );

  useEffect(() => {
    const handleResize = () => {
      if (canvas && container) {
        canvas.setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
        canvas.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvas, container]);

  return { init, editor, copy, paste };
};