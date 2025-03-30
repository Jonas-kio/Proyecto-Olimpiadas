// src/components/common/TextArea.jsx
import React from "react";

const TextArea = ({ label, placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-700 font-medium">{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={3}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full resize-none"
      />
    </div>
  );
};

export default TextArea;
