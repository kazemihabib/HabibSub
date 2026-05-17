import { FC } from "react";
import { useUnit } from "effector-react";
import { 
  $enabled, enableToggleChanged,
  $subtitleSource, subtitleSourceChanged,
  $progressBarEnabled, progressBarEnabledChanged
} from "@src/models/settings";
import { Toggle } from "../../ui/Toggle";
import { Select } from "../../ui/Select";
import { CustomSubs } from "../CustomSubs";

export const GeneralTab: FC = () => {
  const [
    enabled, handleEnableToggleChanged,
    subtitleSource, handleSubtitleSourceChanged,
    progressBarEnabled, handleProgressBarEnabledChanged
  ] = useUnit([
    $enabled, enableToggleChanged,
    $subtitleSource, subtitleSourceChanged,
    $progressBarEnabled, progressBarEnabledChanged
  ]);

  const sources = [
    { label: "Player Subtitles", value: "player" },
    { label: "Custom File", value: "custom" },
  ];

  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">General</div>
      
      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Enabled</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={enabled} onChange={handleEnableToggleChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Subtitle Source</div>
          <div className="es-settings-content__element__right">
            <Select 
              options={sources} 
              value={sources.find(s => s.value === subtitleSource)}
              onChange={(opt) => handleSubtitleSourceChanged(opt.value as any)}
            />
          </div>
        </div>
      </div>

      {subtitleSource === "custom" && (
        <div className="es-settings-content__item">
          <CustomSubs />
        </div>
      )}

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Progress bar</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={progressBarEnabled} onChange={handleProgressBarEnabledChanged} />
          </div>
        </div>
      </div>
    </div>
  );
};
