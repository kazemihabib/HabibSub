import { FC } from "react";
import { useGate, useUnit } from "effector-react";

import { $currentSubTranslation, $subTranslationPendings, SubTranslationGate } from "@src/models/translations";

import { LoadingIcon } from "../ui/LoadingIcon";

export const SubFullTranslation: FC<{ text: string }> = ({ text }) => {
  useGate(SubTranslationGate, text);
  const [currentSubTranslation, subTranslationPendings] = useUnit([$currentSubTranslation, $subTranslationPendings]);

  if (subTranslationPendings[text]) {
    return (
      <div className="es-full-translation es-full-translation--loading">
        <LoadingIcon />
      </div>
    );
  }

  if (!currentSubTranslation) {
    return null;
  }

  return <div className="es-full-translation">{currentSubTranslation}</div>;
};
