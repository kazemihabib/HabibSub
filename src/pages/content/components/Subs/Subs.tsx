import { FC, useEffect, useState } from "react";
import { useUnit } from "effector-react";
import Draggable from "react-draggable";

import { $currentSubs } from "@src/models/subs";
import { $video, $wasPaused, wasPausedChanged } from "@src/models/videos";
import { TSub, TSubItem } from "@src/models/types";
import {
  $autoPause,
  $moveBySubsEnabled,
  $subsBackground,
  $subsBackgroundOpacity,
  $subsFontSize,
  $subsTranslationFontSize,
  $blurTranslation,
  $showSubtitle,
  $blurSubtitle,
  $resumeOnLeave,
  $pauseOnFullTranslation,
} from "@src/models/settings";
import {
  $findPhrasalVerbsPendings,
  subItemMouseLeft,
  $currentPhrasalVerb,
  translateCurrentSubtitleKeyPressed,
  $currentSubTranslation,
  cleanSubTranslation,
  requestWordTranslation,
} from "@src/models/translations";
import { addKeyboardEventsListeners, removeKeyboardEventsListeners } from "@src/utils/keyboardHandler";
import cn from "classnames";
import { SubItemTranslation } from "./SubItemTranslation";
import { PhrasalVerbTranslation } from "./PhrasalVerbTranslation";
import { SubFullTranslation } from "./SubFullTranslation";

type TSubsProps = {};

export const Subs: FC<TSubsProps> = () => {
  const {
    video, currentSubs, subsFontSize, moveBySubsEnabled, wasPaused, handleWasPausedChanged, autoPauseEnabled, resumeOnLeave
  } = useUnit({
    video: $video,
    currentSubs: $currentSubs,
    subsFontSize: $subsFontSize,
    moveBySubsEnabled: $moveBySubsEnabled,
    wasPaused: $wasPaused,
    handleWasPausedChanged: wasPausedChanged,
    autoPauseEnabled: $autoPause,
    resumeOnLeave: $resumeOnLeave
  });
  
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  const [handleTranslateCurrentSubtitle, handleCleanSubTranslation, handleRequestWordTranslation] = useUnit([
    translateCurrentSubtitleKeyPressed, 
    cleanSubTranslation,
    requestWordTranslation
  ]);

  useEffect(() => {
    if (moveBySubsEnabled) {
      addKeyboardEventsListeners();
    }
    return () => {
      removeKeyboardEventsListeners();
    };
  }, []);

  const handleOnMouseLeave = () => {
    if (autoPauseEnabled && wasPaused && resumeOnLeave) {
      video.play();
      handleWasPausedChanged(false);
    }
  };

  const handleOnMouseEnter = () => {
    if (!autoPauseEnabled) {
      return;
    }
    if (!video.paused) {
      handleWasPausedChanged(true);
      video.pause();
    }
  };

  const handleMouseUp = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      const sub = currentSubs[0];
      if (sub) {
        const text = sub.items
          .slice(start, end + 1)
          .map((i) => i.cleanedText)
          .join(" ");
        if (text) {
          setSelectedText(text);
          handleRequestWordTranslation(text);
        }
      }
    }
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  if (!video) return null;

  return (
    <Draggable handle=".es-drag-handle">
      <div
        id="es-subs"
        onMouseUp={handleMouseUp}
        style={{ fontSize: `${((video.clientWidth / 100) * subsFontSize) / 43}px` }}
      >
        <div className="es-subs-controls">
          <div className="es-drag-handle">
            <svg viewBox="0 0 24 24"><path d="M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z"/></svg>
          </div>
          <div className="es-translate-icon" onClick={() => handleTranslateCurrentSubtitle()}>
            <svg viewBox="0 0 24 24"><path d="M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H11.17C10.5,7.79 9.5,9.47 8.14,11.03L2.39,5.28L1,6.69L6.75,12.44L1.78,17.44L3.19,18.85L8.16,13.85L10.79,16.81L11.4,19H15V21H17V19H22V17L12.87,15.07M16.5,10.5C16.5,10.5 16,5 16,5H18L18,10.5H16.5Z"/></svg>
          </div>
        </div>
        {currentSubs.map((sub) => (
          <Sub 
            key={sub.start} 
            sub={sub} 
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            onCleanSubTranslation={handleCleanSubTranslation}
          />
        ))}
      </div>
    </Draggable>
  );
};

const Sub: FC<{ 
  sub: TSub; 
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCleanSubTranslation: () => void;
}> = ({
  sub,
  onMouseEnter,
  onMouseLeave,
  onCleanSubTranslation,
}) => {
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const {
    subsBackground,
    subsBackgroundOpacity,
    findPhrasalVerbsPendings,
    blurTranslation,
    showSubtitle,
    blurSubtitle,
    currentSubTranslation,
    handleRequestWordTranslation,
    video,
    pauseOnFullTranslation,
    subsTranslationFontSize,
  } = useUnit({
    subsBackground: $subsBackground,
    subsBackgroundOpacity: $subsBackgroundOpacity,
    findPhrasalVerbsPendings: $findPhrasalVerbsPendings,
    blurTranslation: $blurTranslation,
    showSubtitle: $showSubtitle,
    blurSubtitle: $blurSubtitle,
    currentSubTranslation: $currentSubTranslation,
    handleRequestWordTranslation: requestWordTranslation,
    video: $video,
    pauseOnFullTranslation: $pauseOnFullTranslation,
    subsTranslationFontSize: $subsTranslationFontSize,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [finalSelection, setFinalSelection] = useState<{ start: number; end: number; text: string } | null>(null);

  useEffect(() => {
    if (currentSubTranslation) {
      setShowFullTranslation(true);
      if (pauseOnFullTranslation && video && !video.paused) {
        video.pause();
      }
    } else {
      setShowFullTranslation(false);
    }
  }, [currentSubTranslation, pauseOnFullTranslation, video]);

  // Clear selection if the subtitle text changes
  useEffect(() => {
    setIsDragging(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setFinalSelection(null);
  }, [sub.text]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (selectionStart !== null && selectionEnd !== null) {
          const start = Math.min(selectionStart, selectionEnd);
          const end = Math.max(selectionStart, selectionEnd);
          const text = sub.items
            .slice(start, end + 1)
            .map((i) => i.cleanedText)
            .join(" ");
          if (text) {
            setFinalSelection({ start, end, text });
            handleRequestWordTranslation(text);
          } else {
            setFinalSelection(null);
          }
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, selectionStart, selectionEnd, sub]);

  if (findPhrasalVerbsPendings[sub.text]) {
    return null;
  }

  return (
    <div
      className="es-sub"
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        onCleanSubTranslation();
        onMouseLeave();
      }}
      style={{
        background: `rgba(0, 0, 0, ${subsBackground ? subsBackgroundOpacity / 100 : 0})`,
      }}
    >
      {showFullTranslation && (
        <div
          className={cn("es-sub-translation", {
            "es-sub-blur": blurTranslation,
          })}
          style={{ fontSize: `${subsTranslationFontSize}%`, marginBottom: '8px' }}
        >
          <SubFullTranslation text={sub.cleanedText} />
        </div>
      )}
      {showSubtitle && (
        <div className={cn("es-main-sub", { "es-sub-blur": blurSubtitle })}>
          {sub.items.map((item, index) => {
            const isIdxSelected = selectionStart !== null && selectionEnd !== null && index >= Math.min(selectionStart, selectionEnd) && index <= Math.max(selectionStart, selectionEnd);
            
            return (
              <SubItem 
                key={index} 
                subItem={item} 
                index={index} 
                isSelected={isIdxSelected || (finalSelection !== null && index >= finalSelection.start && index <= finalSelection.end)}
                onMouseDown={() => {
                  setIsDragging(true);
                  setSelectionStart(index);
                  setSelectionEnd(index);
                  setFinalSelection(null);
                }}
                onMouseEnter={() => {
                  if (isDragging) {
                    setSelectionEnd(index);
                  }
                }}
                selectedText={finalSelection?.text || null}
                onClearSelection={() => setFinalSelection(null)}
                isLastSelected={finalSelection !== null && index === finalSelection.end}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

type TSubItemProps = {
  subItem: TSubItem;
  index: number;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  selectedText: string | null;
  onClearSelection: () => void;
  isLastSelected: boolean;
};

const SubItem: FC<TSubItemProps> = ({ subItem, index, isSelected, onMouseDown, onMouseEnter, selectedText, onClearSelection, isLastSelected }) => {
  const { currentPhrasalVerb, handleSubItemMouseLeft, findPhrasalVerbsPendings } = useUnit({
    currentPhrasalVerb: $currentPhrasalVerb,
    handleSubItemMouseLeft: subItemMouseLeft,
    findPhrasalVerbsPendings: $findPhrasalVerbsPendings
  });

  const handleOnMouseLeave = () => {
    handleSubItemMouseLeft();
  };

  const handleOnMouseEnter = () => {
    onMouseEnter();
  };

  const handleItemMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
    onClearSelection();
  };

  return (
    <>
      <pre
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onMouseDown={handleItemMouseDown}
        className={cn("es-sub-item", subItem.tag, {
          "es-sub-item-highlighted": currentPhrasalVerb?.indexes?.includes(index) || isSelected,
          "es-sub-item-selected": isSelected,
        })}
      >
        {subItem.text}
        {selectedText && isLastSelected && !findPhrasalVerbsPendings[subItem.cleanedText] && (
          <SubItemTranslation text={selectedText} />
        )}
      </pre>
      <pre className="es-sub-item-space"> </pre>
    </>
  );
};
