import { FC } from "react";
import { TranslateLanguage } from "../TranslateLanguage";
import { TranslationService } from "../TranslationService";
import { LearningService } from "../LearningService";

export const LanguagesTab: FC = () => {
  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">Translation</div>
      <div className="es-settings-content__item">
        <TranslateLanguage />
      </div>
      <div className="es-settings-content__item">
        <TranslationService />
      </div>
      <div className="es-settings-content__item">
        <LearningService />
      </div>
    </div>
  );
};
