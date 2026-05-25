import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table } from 'lucide-react';

export default function ExportDropdown({ onExportExcel, onExportPDF }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)} 
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" /> Exporter
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button 
            onClick={() => { setOpen(false); onExportExcel(); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1A766E] transition-colors"
          >
            <Table className="w-4 h-4" /> Excel (.xlsx)
          </button>
          <button 
            onClick={() => { setOpen(false); onExportPDF(); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <FileText className="w-4 h-4" /> PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
