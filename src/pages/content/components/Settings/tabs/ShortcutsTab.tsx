import { FC } from "react";

const SHORTCUTS = [
  { action: "Previous Subtitle", key: "A" },
  { action: "Next Subtitle", key: "D" },
  { action: "Seek -5s", key: "Arrow Left" },
  { action: "Seek +5s", key: "Arrow Right" },
  { action: "Repeat Current Subtitle", key: "R" },
  { action: "Translate Whole Line", key: "T" },
  { action: "Toggle Subtitle Blur", key: "U" },
];

export const ShortcutsTab: FC = () => {
  return (
    <div className="es-settings-tab">
      <div className="es-settings-content__main__header">Keyboard Shortcuts</div>
      
      <div className="es-shortcuts-list">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="es-settings-content__item">
            <div className="es-settings-content__element">
              <div className="es-settings-content__element__left">{s.action}</div>
              <div className="es-settings-content__element__right">
                <kbd style={{ 
                  background: '#51535D', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
                }}>{s.key}</kbd>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
