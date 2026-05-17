import { FC, HTMLProps } from "react";
import { useUnit } from "effector-react";

import { $subsFontSize, subsFontSizeButtonPressed } from "@src/models/settings";

export const SubsFontSize: FC<HTMLProps<HTMLInputElement>> = () => {
  const [subsFontSize, handleSubsFontSizeButtonPressed] = useUnit([
    $subsFontSize,
    subsFontSizeButtonPressed,
  ]);

  return (
    <div className="es-settings-content__element">
      <div className="es-settings-content__element__left">Subtitle size</div>
      <div className="es-settings-content__element__right">
        <span style={{ marginRight: '8px' }}>{subsFontSize}%</span>
        <input 
          type="range" 
          min="50" 
          max="200" 
          step="10"
          value={subsFontSize} 
          onChange={(e) => handleSubsFontSizeButtonPressed(Number(e.target.value))}
          style={{ width: '100px' }}
        />
      </div>
    </div>
  );
};
