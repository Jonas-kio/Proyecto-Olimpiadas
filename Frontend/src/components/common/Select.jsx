// src/components/common/Select.jsx
import React from "react";

const Select = ({ label, value, onChange, options = [] }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-700 font-medium">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
