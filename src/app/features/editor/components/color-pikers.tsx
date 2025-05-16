import { ChromePicker, CirclePicker } from "react-color";
import { colors } from "@/app/features/types";
import { rgbaObjectToString } from "../../utils";

interface ColorPickersProps {
  value: string;
  onChange: (color: string) => void;
}
export const ColorPickers = ({ value, onChange }: ColorPickersProps) => {
  return (
    <div className="w-full space-y-4">
      <ChromePicker
        color={value}
        onChange={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
        className="border rounded-lg"
      />
      <CirclePicker
        color={value}
        colors={colors}
        onChangeComplete={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
        className="border rounded-lg"
      />
    </div>
  );
};
