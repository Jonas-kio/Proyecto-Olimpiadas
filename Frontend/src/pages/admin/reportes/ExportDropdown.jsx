import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../../utils/reportes/exportUtils";
import "../../../styles/reportes/ExportDropdown.css";

const ExportDropdown = ({ data }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="export-dropdown-container" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="export-button">
        <DownloadIcon size={16} className="icon-left" />
        Exportar
        <ChevronDownIcon size={16} className="icon-right" />
      </button>

      {open && (
        <div className="export-menu">
          <button
            onClick={() => {
              exportToExcel(data);
              setOpen(false); // 👈 Cierra después de exportar
            }}
            className="export-option"
          >
            Exportar como Excel
          </button>

          <button
            onClick={() => {
              exportToPDF(data);
              setOpen(false); // 👈 Cierra después de exportar
            }}
            className="export-option"
          >
            Exportar como PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
