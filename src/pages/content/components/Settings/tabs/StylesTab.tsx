import { FC } from "react";
import { SubsBackground } from "../SubsBackground";
import { SubsBackgroundOpacity } from "../SubsBackgroundOpacity";
import { SubsDelay } from "../SubsDelay";
import { SubsFontSize } from "../SubsFontSize";
import { SubsTranslationFontSize } from "../SubsTranslationFontSize";

export const StylesTab: FC = () => {
  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">Styles</div>
      
      <div className="es-settings-content__item">
        <SubsFontSize />
      </div>

      <div className="es-settings-content__item">
        <SubsTranslationFontSize />
      </div>

      <div className="es-settings-content__item">
        <SubsBackground />
      </div>

      <div className="es-settings-content__item">
        <SubsBackgroundOpacity />
      </div>

      <div className="es-settings-content__item">
        <SubsDelay />
      </div>
    </div>
  );
};
