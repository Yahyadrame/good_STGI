import { useCallback, useState, useMemo } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./use-auto-resize";
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  Editor,
  FILL_COLORS,
  RECTAGNLE_OPTIONS,
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
import { useHistory } from "./use-hitory";
import { useHotkeys } from "./use-hotKeys";
import { useWindowEvents } from "./use-window-events";

export const useEditor = ({ clearSelectionCallback }: EditorHookProps) => {
  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [fillColor, setFillColor] = useState(FILL_COLORS);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();
  const { save, canRedo, canUndo, canvasHistory, redo, undo, setHistoryIndex } =
    useHistory({ canvas });

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
      const { width, height, left, top } = getWorkspace() as fabric.Rect;

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
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL(options);

      downloadFile(dataURL, "png");
      autoZoom();
    };

    const saveAsSvg = () => {
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL(options);

      downloadFile(dataURL, "svg");
      autoZoom();
    };

    const saveAsJpg = () => {
      const options = generateSaveOptions();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = canvas.toDataURL(options);

      downloadFile(dataURL, "jpg");
      autoZoom();
    };

    const saveAsJson = async () => {
      const dataURL = canvas.toJSON(JSON_KEYS);
      await transformText(dataURL.objects);
      const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataURL, null, "\t")
      )}`;
      downloadFile(fileString, "json");
    };

    const loadJson = async (json: string) => {
      const data = JSON.parse(json);

      canvas.loadFromJSON(data, () => {
        autoZoom();
      });
    };

    const getWorkspace = () => {
      return canvas.getObjects().find((object) => object.name === "clip");
    };

    const center = (object: fabric.Object) => {
      const workspace = getWorkspace();
      const center = workspace?.getCenterPoint();

      if (!center) return;
      // @ts-ignore
      canvas._centerObject(object, center);
      // canvas.centerObject(object);
    };

    const addToCanvas = (object: fabric.Object) => {
      center(object);
      canvas.add(object);
      canvas.setActiveObject(object);
    };

    return {
      saveAsPng,
      saveAsSvg,
      saveAsJpg,
      saveAsJson,
      loadJson,
      autoZoom,
      zoomIn: () => {
        let zoomRatio = canvas.getZoom();

        zoomRatio += 0.5;
        const center = canvas.getCenter();

        canvas.zoomToPoint(
          new fabric.Point(center.left, center.top),
          zoomRatio > 1 ? 1 : zoomRatio
        );
      },
      zoomOut: () => {
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
        workspace?.set(value);
        autoZoom();
        save();
      },
      changeBackgroundWorkspace: (value: string) => {
        const workspace = getWorkspace();
        workspace?.set({ fill: value });
        canvas.renderAll();
        save();
      },
      enabledDrawingMode: () => {
        canvas.discardActiveObject();
        canvas.renderAll();
        canvas.isDrawingMode = true;
      },
      disabledDrawingMode: () => {
        canvas.isDrawingMode = false;
      },
      onRedo: () => redo(),
      onUndo: () => undo(),
      canRedo,
      canUndo,
      onCopy: () => copy(),
      onPaste: () => paste(),
      changeImageFilter: (value: string) => {
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
      },
      addImage: (url: string) => {
        fabric.Image.fromURL(
          url,
          (image) => {
            const workspace = getWorkspace();
            image.scaleToWidth(workspace?.width || 0);
            image.scaleToHeight(workspace?.height || 0);

            addToCanvas(image);
          },
          {
            crossOrigin: "anonymous",
          }
        );
      },
      delete: () => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          canvas.remove(object);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
      },
      addText: (value, options) => {
        const object = new fabric.IText(value, {
          ...TEXT_OPTIONS,
          fill: fillColor,
          editable: true, // Assure que le texte est éditable
          ...options,
        });

        addToCanvas(object);
        object.enterEditing(); // Active le mode édition
        object.selectAll(); // Sélectionne tout le texte pour faciliter la modification
        canvas.renderAll();
      },
      addCircle: () => {
        const object = new fabric.Circle({
          ...CIRCLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });
        addToCanvas(object);
      },
      addSoftRetangle: () => {
        const object = new fabric.Rect({
          ...RECTAGNLE_OPTIONS,
          rx: 50,
          ry: 50,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });

        addToCanvas(object);
      },
      addRetangle: () => {
        const object = new fabric.Rect({
          ...RECTAGNLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });

        addToCanvas(object);
      },
      addTriangle: () => {
        const object = new fabric.Triangle({
          ...RECTAGNLE_OPTIONS,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        });

        addToCanvas(object);
      },
      addRows: (direction: "up" | "down" | "left" | "right" = "down") => {
        console.log("strokeColor:", strokeColor, "strokeWidth:", strokeWidth);

        let lineCoords: number[] = [0, 0, 0, 100]; // Ligne verticale par défaut (vers le bas)
        let triangleLeft = 0;
        let triangleTop = 100;
        let triangleAngle = 180; // Triangle pointant vers le bas

        if (direction === "up") {
          lineCoords = [0, 0, 0, -100]; // Ligne verticale vers le haut
          triangleLeft = 0;
          triangleTop = -100;
          triangleAngle = 0;
        } else if (direction === "left") {
          lineCoords = [0, 0, -100, 0]; // Ligne horizontale vers la gauche
          triangleLeft = -100;
          triangleTop = 0;
          triangleAngle = -90;
        } else if (direction === "right") {
          lineCoords = [0, 0, 100, 0]; // Ligne horizontale vers la droite
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
          originY: "center", // Centrer l'origine du groupe
        });

        console.log("Arrow created:", arrow);
        addToCanvas(arrow);
        canvas.renderAll();
      },
      getActiveOpacity: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return 1;

        const value = selectedObject.get("opacity") || 1;

        return value;
      },
      changeFontWeight: (value: number) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ fontWeight: value });
          }
        });

        canvas.renderAll();
      },
      getActiveFontStyle: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return "normal";
        // @ts-ignore
        const value = selectedObject.get("fontStyle") || "normal";

        return value;
      },
      changeFontStyle: (value: string) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ fontStyle: value });
          }
        });

        canvas.renderAll();
      },
      getActiveFontLineThrough: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return false;
        // @ts-ignore
        const value = selectedObject.get("linethrough") || false;

        return value;
      },
      changeFontLineThrough: (value: boolean) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ linethrough: value });
          }
        });

        canvas.renderAll();
      },

      getActiveTextAlign: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return "left";
        // @ts-ignore
        const value = selectedObject.get("textAlign") || "left";

        return value;
      },
      changeTexAlign: (value: string) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ textAlign: value });
          }
        });

        canvas.renderAll();
      },
      getActiveFontSize: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return FONT_SIZE;
        // @ts-ignore
        const value = selectedObject.get("fontSize") || FONT_SIZE;

        return value;
      },
      changeFontSize: (value: number) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ fontSize: value });
          }
        });

        canvas.renderAll();
      },
      getActiveFontUnderline: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return false;
        // @ts-ignore
        const value = selectedObject.get("underline") || false;

        return value;
      },

      changeFontUnderline: (value: boolean) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            // c'est la faute de la lib
            object.set({ underline: value });
          }
        });

        canvas.renderAll();
      },
      changeOpacity: (value: number) => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          object.set({ opacity: value });
        });

        canvas.renderAll();
      },
      bringForward: () => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          canvas.bringForward(object);
        });

        canvas.renderAll();
        const workspace = getWorkspace();
        workspace?.sendToBack();
      },
      sendBackward: () => {
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          canvas.sendBackwards(object);
        });

        canvas.renderAll();
        const workspace = getWorkspace();
        workspace?.sendToBack();
      },
      changeFillColor: (value: string) => {
        setFillColor(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          object.set({ fill: value });
          console.log(object);
        });

        canvas.renderAll();
      },

      changeFontFamily: (value: string) => {
        setFontFamily(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ fontFamily: value });
          }
        });

        canvas.renderAll();
      },

      changeStrokeColor: (value: string) => {
        setStrokeColor(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          if (isTextType(object.type)) {
            object.set({ stroke: value });
            return;
          }
          object.set({ stroke: value });
        });
        canvas.freeDrawingBrush.color = value;
        canvas.renderAll();
      },
      changeStrokeWidth: (value: number) => {
        setStrokeWidth(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          object.set({ strokeWidth: value });
        });
        canvas.freeDrawingBrush.width = value;
        canvas.renderAll();
      },
      changeStrokeDashArray: (value: number[]) => {
        setStrokeDashArray(value);
        const objects = canvas.getActiveObjects();
        objects.forEach((object) => {
          object.set({ strokeDashArray: value });
        });

        canvas.renderAll();
      },

      canvas,
      getActiveFontWeight: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return FONT_WEIGHT;
        // @ts-ignore
        const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

        return value;
      },
      getActiveFontFamily: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return fontFamily;
        // @ts-ignore
        const value = selectedObject.get("fontFamily") || fontFamily;

        return value;
      },
      getActiveFillColor: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return fillColor;

        const value = selectedObject.get("fill") || fillColor;

        return value as string;
      },
      getActiveStrokeColor: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return fillColor;

        const value = selectedObject.get("stroke") || strokeColor;

        return value;
      },
      getActiveStrokeWidth: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return strokeWidth;

        const value = selectedObject.get("strokeWidth") || strokeWidth;

        return value;
      },
      getActiveStrokeDashArray: () => {
        const selectedObject = selectedObjects[0];
        if (!selectedObject) return strokeDashArray;

        const value = selectedObject.get("strokeDashArray") || strokeDashArray;

        return value;
      },
      selectedObjects,
    };
  };

  const { copy, paste } = useClipboard({
    canvas,
  });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    canvas,
    copy,
    paste,
    redo,
    save,
    undo,
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
    selectedObjects,
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
      initialContainer: HTMLDivElement;
    }) => {
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

  return { init, editor, copy, paste };
};
