import { FC, useRef } from "react";
import cn from "classnames";
import { useClickOutside } from "@src/hooks/useClickOutside";
import { useUnit } from "effector-react";
import {
  $activeSettingsTab,
  activeSettingsTabChanged,
} from "@src/models/settings";
import { createPortal } from "react-dom";
import { DeepLApiKeyModal } from "./DeepLApiKeyModal";
import { ChatGPTApiKeyModal } from "./ChatGPTApiKeyModal";

// New Tab Components
import { GeneralTab } from "./tabs/GeneralTab";
import { LanguagesTab } from "./tabs/LanguagesTab";
import { PlaybackTab } from "./tabs/PlaybackTab";
import { SubtitlesTab } from "./tabs/SubtitlesTab";
import { StylesTab } from "./tabs/StylesTab";
import { ShortcutsTab } from "./tabs/ShortcutsTab";

const TABS = [
  { 
    id: 0, 
    title: "General", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12,15.5A2.5,2.5 0 0,1 9.5,13A2.5,2.5 0 0,1 12,10.5A2.5,2.5 0 0,1 14.5,13A2.5,2.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.35 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.97 19.05,5.05L16.56,5.92C16.04,5.54 15.47,5.24 14.87,5.05L14.5,2.42C14.46,2.18 14.25,2 14,2H10C13.75,2 13.54,2.18 13.5,2.42L13.13,5.05C12.53,5.24 11.96,5.54 11.44,5.92L8.95,5.05C8.73,4.97 8.46,5.05 8.34,5.27L6.34,8.73C6.22,8.95 6.27,9.22 6.46,9.37L8.57,11.03C8.53,11.35 8.5,11.67 8.5,12C8.5,12.33 8.53,12.65 8.57,12.97L6.46,14.63C6.27,14.78 6.22,15.05 6.34,15.27L8.34,18.73C8.46,18.95 8.73,19.03 8.95,18.95L11.44,18.08C11.96,18.46 12.53,18.76 13.13,18.95L13.5,21.58C13.54,21.82 13.75,22 14,22H10C9.75,22 9.54,21.82 9.5,21.58L9.13,18.95C8.53,18.76 7.96,18.46 7.44,18.08L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.22,15.05 2.27,14.78 2.46,14.63L4.57,12.97C4.53,12.65 4.5,12.33 4.5,12C4.5,11.67 4.53,11.35 4.57,11.03L2.46,9.37C2.27,9.22 2.22,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.97 4.95,5.05L7.44,5.92C7.96,5.54 8.53,5.24 9.13,5.05L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.05C15.47,5.24 16.04,5.54 16.56,5.92L19.05,5.05C19.27,4.97 19.54,5.05 19.66,5.27L21.66,8.73C21.78,8.95 21.73,9.22 21.54,9.37L19.43,12.97Z"/></svg>
    )
  },
  { 
    id: 1, 
    title: "Translation", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H11.17C10.5,7.79 9.5,9.47 8.14,11.03L2.39,5.28L1,6.69L6.75,12.44L1.78,17.44L3.19,18.85L8.16,13.85L10.79,16.81L11.4,19H15V21H17V19H22V17L12.87,15.07M16.5,10.5C16.5,10.5 16,5 16,5H18L18,10.5H16.5Z"/></svg>
    ) 
  },
  { 
    id: 2, 
    title: "Playback", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5V7.5L16,12L10,16.5Z"/></svg>
    ) 
  },
  { 
    id: 3, 
    title: "Subtitles", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M4,12H8V14H4V12M14,18H4V16H14V18M20,18H16V16H20V18M20,14H10V12H20V14Z"/></svg>
    ) 
  },
  { 
    id: 4, 
    title: "Styles", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/></svg>
    ) 
  },
  { 
    id: 5, 
    title: "Shortcuts", 
    icon: (
      <svg viewBox="0 0 24 24"><path d="M21,14H3V4H21M21,2H3C1.89,2 1,2.89 1,4V14C1,15.1 1.89,16 3,16H10V18H8V20H16V18H14V16H21C22.1,16 23,15.1 23,14V4C23,2.89 22.1,2 21,2M7,7V11H9V7H7M11,7V11H13V7H11M15,7V11H17V7H15Z"/></svg>
    ) 
  },
];

export const SettingsContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSettingsTab, handleActiveSettingsTabChanged] = useUnit([
    $activeSettingsTab,
    activeSettingsTabChanged,
  ]);
  const contentRef = useRef();

  useClickOutside(contentRef, onClose);

  return (
    <>
      <div className="es-settings-container" ref={contentRef}>
        <div className="es-settings-sidebar">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className={cn("es-settings-sidebar__item", {
                "es-settings-sidebar__item--active": activeSettingsTab === tab.id,
              })}
              onClick={() => handleActiveSettingsTabChanged(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.title}
            </div>
          ))}
        </div>
        <div className="es-settings-panel es-settings-content">
          <div className="es-settings-content__close" onClick={() => onClose()} />
          {activeSettingsTab === 0 && <GeneralTab />}
          {activeSettingsTab === 1 && <LanguagesTab />}
          {activeSettingsTab === 2 && <PlaybackTab />}
          {activeSettingsTab === 3 && <SubtitlesTab />}
          {activeSettingsTab === 4 && <StylesTab />}
          {activeSettingsTab === 5 && <ShortcutsTab />}
        </div>
      </div>
      {createPortal(<DeepLApiKeyModal />, document.querySelector("body"))}
      {createPortal(<ChatGPTApiKeyModal />, document.querySelector("body"))}
    </>
  );
};
