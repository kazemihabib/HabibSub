import { FC, HTMLProps } from "react";
import { useUnit } from "effector-react";

import { $subsTranslationFontSize, subsTranslationFontSizeButtonPressed } from "@src/models/settings";

export const SubsTranslationFontSize: FC<HTMLProps<HTMLInputElement>> = () => {
  const [subsTranslationFontSize, handleSubsTranslationFontSizeButtonPressed] = useUnit([
    $subsTranslationFontSize,
    subsTranslationFontSizeButtonPressed,
  ]);

  return (
    <div className="es-settings-content__element">
      <div className="es-settings-content__element__left">Translation size</div>
      <div className="es-settings-content__element__right">
        <span style={{ marginRight: '8px' }}>{subsTranslationFontSize}%</span>
        <input 
          type="range" 
          min="50" 
          max="200" 
          step="10"
          value={subsTranslationFontSize} 
          onChange={(e) => handleSubsTranslationFontSizeButtonPressed(Number(e.target.value))}
          style={{ width: '100px' }}
        />
      </div>
    </div>
  );
};
