import { FC, ChangeEvent } from "react";

export interface SelectProps {
  options: { label: string; value: string }[];
  value?: { label: string; value: string };
  onChange: (option: { label: string; value: string }) => void;
}

export const Select: FC<SelectProps> = ({ options, value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find((opt) => opt.value === e.target.value);
    if (selectedOption) {
      onChange(selectedOption);
    }
  };

  return (
    <div className="es-select-wrapper" style={{ width: "100%", minWidth: "140px" }}>
      <select
        className="es-native-select"
        value={value?.value}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "28px",
          backgroundColor: "#51535D",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "0 8px",
          fontSize: "14px",
          appearance: "none", // Remove default arrow to style it better if needed
          cursor: "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
