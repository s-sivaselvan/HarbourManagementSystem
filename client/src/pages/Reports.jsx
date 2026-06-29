import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart3, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [ships, setShips] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [requests, setRequests] = useState([]);
  const [berths, setBerths] = useState([]);
  const [tab, setTab] = useState('ships');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/ships'), api.get('/cargo'), api.get('/docking'), api.get('/berths')
    ]).then(([s, c, d, b]) => {
      setShips(s.data); setCargo(c.data); setRequests(d.data); setBerths(b.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getTableData = () => {
    switch (tab) {
      case 'ships': return {
        title: 'Ship Report',
        headers: ['Ship Name', 'Number', 'Captain', 'Type', 'Capacity (t)', 'Country', 'Status', 'Arrival'],
        rows: ships.map(s => [s.shipName, s.shipNumber, s.captainName, s.shipType, s.capacity, s.registrationCountry, s.status, s.arrivalDate ? new Date(s.arrivalDate).toLocaleDateString() : '—'])
      };
      case 'cargo': return {
        title: 'Cargo Report',
        headers: ['Ship', 'Cargo Type', 'Weight (t)', 'Destination', 'Status'],
        rows: cargo.map(c => [c.shipId?.shipName || '—', c.cargoType, c.weight, c.destination, c.status])
      };
      case 'docking': return {
        title: 'Docking Report',
        headers: ['Ship', 'Arrival', 'Departure', 'Berth', 'Status', 'Remarks'],
        rows: requests.map(r => [r.shipId?.shipName || '—', new Date(r.requestedArrival).toLocaleDateString(), new Date(r.requestedDeparture).toLocaleDateString(), r.assignedBerth?.berthNumber || '—', r.status, r.remarks || '—'])
      };
      case 'berths': return {
        title: 'Berth Utilization Report',
        headers: ['Berth Number', 'Location', 'Capacity (t)', 'Status', 'Assigned Ship'],
        rows: berths.map(b => [b.berthNumber, b.location, b.capacity, b.status, b.assignedShip?.shipName || '—'])
      };
      default: return { title: '', headers: [], rows: [] };
    }
  };

  const { title, headers, rows } = getTableData();

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`⚓ ${title}`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()} | Harbour Management System`, 14, 28);
    autoTable(doc, { head: [headers], body: rows, startY: 35, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
    doc.save(`${title.replace(/\s+/g,'_')}_${Date.now()}.pdf`);
    toast.success('PDF exported!');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title.replace(/\s+/g,'_')}_${Date.now()}.xlsx`);
    toast.success('Excel exported!');
  };

  const exportCSV = () => {
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g,'_')}_${Date.now()}.csv`;
    a.click();
    toast.success('CSV exported!');
  };

  const TABS = [
    { key: 'ships', label: 'Ships Report' },
    { key: 'cargo', label: 'Cargo Report' },
    { key: 'docking', label: 'Docking Report' },
    { key: 'berths', label: 'Berth Utilization' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><BarChart3 className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate and export port operations reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-danger text-sm py-2"><File className="w-4 h-4" /> PDF</button>
          <button onClick={exportExcel} className="btn-success text-sm py-2"><FileSpreadsheet className="w-4 h-4" /> Excel</button>
          <button onClick={exportCSV} className="btn-secondary text-sm py-2"><FileText className="w-4 h-4" /> CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-gradient-to-r from-navy-600 to-ocean-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-white">{title}</h3>
          <span className="badge badge-info">{rows.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">No data available for this report</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
