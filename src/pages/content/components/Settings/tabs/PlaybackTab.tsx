import { FC } from "react";
import { useUnit } from "effector-react";
import cn from "classnames";
import { 
  $autoPause, autoPauseChanged,
  $resumeOnLeave, resumeOnLeaveChanged,
  $playbackMode, playbackModeChanged,
  $autoResume, autoResumeChanged,
  $resumeDelay, resumeDelayChanged,
  $pauseOnFullTranslation, pauseOnFullTranslationChanged,
  $keepSubtitleVisible, keepSubtitleVisibleChanged,
  $repeatCount, repeatCountChanged,
  $pauseAfterRepeat, pauseAfterRepeatChanged,
  $repeatMarginStart, repeatMarginStartChanged,
  $repeatMarginEnd, repeatMarginEndChanged,
  TPlaybackMode
} from "@src/models/settings";
import { Toggle } from "../../ui/Toggle";

export const PlaybackTab: FC = () => {
  const {
    autoPause, handleAutoPauseChanged,
    resumeOnLeave, handleResumeOnLeaveChanged,
    playbackMode, handlePlaybackModeChanged,
    autoResume, handleAutoResumeChanged,
    resumeDelay, handleResumeDelayChanged,
    pauseOnFullTranslation, handlePauseOnFullTranslationChanged,
    keepSubtitleVisible, handleKeepSubtitleVisibleChanged,
    repeatCount, handleRepeatCountChanged,
    pauseAfterRepeat, handlePauseAfterRepeatChanged,
    repeatMarginStart, handleRepeatMarginStartChanged,
    repeatMarginEnd, handleRepeatMarginEndChanged
  } = useUnit({
    autoPause: $autoPause,
    handleAutoPauseChanged: autoPauseChanged,
    resumeOnLeave: $resumeOnLeave,
    handleResumeOnLeaveChanged: resumeOnLeaveChanged,
    playbackMode: $playbackMode,
    handlePlaybackModeChanged: playbackModeChanged,
    autoResume: $autoResume,
    handleAutoResumeChanged: autoResumeChanged,
    resumeDelay: $resumeDelay,
    handleResumeDelayChanged: resumeDelayChanged,
    pauseOnFullTranslation: $pauseOnFullTranslation,
    handlePauseOnFullTranslationChanged: pauseOnFullTranslationChanged,
    keepSubtitleVisible: $keepSubtitleVisible,
    handleKeepSubtitleVisibleChanged: keepSubtitleVisibleChanged,
    repeatCount: $repeatCount,
    handleRepeatCountChanged: repeatCountChanged,
    pauseAfterRepeat: $pauseAfterRepeat,
    handlePauseAfterRepeatChanged: pauseAfterRepeatChanged,
    repeatMarginStart: $repeatMarginStart,
    handleRepeatMarginStartChanged: repeatMarginStartChanged,
    repeatMarginEnd: $repeatMarginEnd,
    handleRepeatMarginEndChanged: repeatMarginEndChanged
  });

  const modes: { id: TPlaybackMode, title: string, desc: string, icon: JSX.Element }[] = [
    { 
      id: "basic", 
      title: "Basic", 
      desc: "Continuous", 
      icon: <svg viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg> 
    },
    { 
      id: "pause", 
      title: "Pause", 
      desc: "After each", 
      icon: <svg viewBox="0 0 24 24"><path d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg> 
    },
    { 
      id: "repeat", 
      title: "Repeat", 
      desc: "Each subtitle", 
      icon: <svg viewBox="0 0 24 24"><path d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z"/></svg> 
    },
  ];

  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">Playback</div>
      
      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Pause in Subtitle Area</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={autoPause} onChange={handleAutoPauseChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Resume on Subtitle Area Leave</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={resumeOnLeave} onChange={handleResumeOnLeaveChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__item">
        <div className="es-settings-content__element">
          <div className="es-settings-content__element__left">Pause on full translation</div>
          <div className="es-settings-content__element__right">
            <Toggle isEnabled={pauseOnFullTranslation} onChange={handlePauseOnFullTranslationChanged} />
          </div>
        </div>
      </div>

      <div className="es-settings-content__section-title">Playback Settings</div>
      
      <div className="es-playback-modes">
        {modes.map((mode) => (
          <div 
            key={mode.id}
            className={cn("es-playback-modes__item", {
              "es-playback-modes__item--active": playbackMode === mode.id
            })}
            onClick={() => handlePlaybackModeChanged(mode.id)}
          >
            <div className="es-playback-modes__item__icon">{mode.icon}</div>
            <div className="es-playback-modes__item__title">{mode.title}</div>
            <div className="es-playback-modes__item__desc">{mode.desc}</div>
          </div>
        ))}
      </div>

      {playbackMode === "basic" && (
        <div className="es-settings-content__item">
          <div className="es-settings-content__element">
            <div className="es-settings-content__element__left">Keep subtitle visible</div>
            <div className="es-settings-content__element__right">
              <Toggle isEnabled={keepSubtitleVisible} onChange={handleKeepSubtitleVisibleChanged} />
            </div>
          </div>
        </div>
      )}

      {playbackMode === "pause" && (
        <>
          <div className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">Auto resume</div>
              <div className="es-settings-content__element__right">
                <Toggle isEnabled={autoResume} onChange={handleAutoResumeChanged} />
              </div>
            </div>
          </div>
          {autoResume && (
            <div className="es-settings-content__item">
              <div className="es-settings-content__element">
                <div className="es-settings-content__element__left">Resume delay</div>
                <div className="es-settings-content__element__right">
                  <span style={{ marginRight: '8px' }}>{resumeDelay.toFixed(1)}s</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={resumeDelay} 
                    onChange={(e) => handleResumeDelayChanged(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {playbackMode === "repeat" && (
        <>
          <div className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">Repeat count</div>
              <div className="es-settings-content__element__right">
                <span style={{ marginRight: '8px' }}>{repeatCount}x</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={repeatCount} 
                  onChange={(e) => handleRepeatCountChanged(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">Pause after repeat</div>
              <div className="es-settings-content__element__right">
                <Toggle isEnabled={pauseAfterRepeat} onChange={handlePauseAfterRepeatChanged} />
              </div>
            </div>
          </div>
          <div className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">Start Margin (ms)</div>
              <div className="es-settings-content__element__right">
                <input 
                  type="number" 
                  value={repeatMarginStart} 
                  onChange={(e) => handleRepeatMarginStartChanged(Number(e.target.value))}
                  style={{ width: '60px', padding: '2px 4px', borderRadius: '4px', border: 'none', background: '#51535D', color: 'white' }}
                />
              </div>
            </div>
          </div>
          <div className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">End Margin (ms)</div>
              <div className="es-settings-content__element__right">
                <input 
                  type="number" 
                  value={repeatMarginEnd} 
                  onChange={(e) => handleRepeatMarginEndChanged(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  style={{ width: '60px', padding: '2px 4px', borderRadius: '4px', border: 'none', background: '#51535D', color: 'white' }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
