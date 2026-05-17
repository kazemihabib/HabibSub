import { FC } from "react";
import { useUnit } from "effector-react";
import { 
  $showSubtitle, showSubtitleChanged,
  $showTranslation, showTranslationChanged,
  $blurSubtitle, blurSubtitleChanged
} from "@src/models/settings";
import { Toggle } from "../../ui/Toggle";

export const SubtitlesTab: FC = () => {
  const [
    showSubtitle, handleShowSubtitleChanged,
    showTranslation, handleShowTranslationChanged,
    blurSubtitle, handleBlurSubtitleChanged
  ] = useUnit([
    $showSubtitle, showSubtitleChanged,
    $showTranslation, showTranslationChanged,
    $blurSubtitle, blurSubtitleChanged
  ]);

  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">Subtitles</div>

      <div className="es-settings-content__section-title">Subtitle Display</div>
      
      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Show Subtitle</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={showSubtitle} onChange={handleShowSubtitleChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Show Subtitle Translation</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={showTranslation} onChange={handleShowTranslationChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__section-title">Subtitle Behavior</div>

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Blur Subtitle</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={blurSubtitle} onChange={handleBlurSubtitleChanged} />
          </div>
        </div>
      </div>
    </div>
  );
};
