// src/components/common/Input.jsx
import React from "react";

const Input = ({ label, placeholder, value, onChange, type = "text" }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-700 font-medium">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      />
    </div>
  );
};

export default Input;
