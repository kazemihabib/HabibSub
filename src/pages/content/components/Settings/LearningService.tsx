import { FC, HTMLProps } from "react";
import { useUnit } from "effector-react";

import { $learningService, learningServiceChanged } from "@src/models/settings";
import { TLearningService } from "@src/models/types";
import { Select } from "../ui/Select";

const getServiceOption = (service: string) => {
  return services.find((option) => option.value === service);
};
export const LearningService: FC<HTMLProps<HTMLSelectElement>> = () => {
  const [learningService, handleTranslateLanguageChanged] = useUnit([$learningService, learningServiceChanged]);

  return (
    <div className="es-settings-content__element">
      <div className="es-settings-content__element__left">Learning service</div>
      <div className="es-settings-content__element__right">
        <Select
          value={getServiceOption(learningService)}
          onChange={(option: { label: string, value: string }) => handleTranslateLanguageChanged(option.value as TLearningService)}
          options={services}
        />
      </div>
    </div>
  );
};

const services = [
  { label: "Disabled", value: "disabled" },
  { label: "Anki", value: "anki" },
  { label: "LinguaLeo", value: "lingualeo" },
  { label: "Puzzle English", value: "puzzle-english" },
];
