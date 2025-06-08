import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import { exportToPDF } from "../../../utils/reportes/exportPDF";
import { exportToExcel } from "../../../utils/reportes/exportExcel";
import "../../../styles/reportes/ExportDropdown.css";

const ExportDropdown = ({ data, resumen }) => {
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
          <button onClick={() => { exportToPDF(data, resumen); setOpen(false); }} className="export-option">
            Exportar como PDF
          </button>
          <button onClick={() => { exportToExcel(data, resumen); setOpen(false); }} className="export-option">
            Exportar como Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
