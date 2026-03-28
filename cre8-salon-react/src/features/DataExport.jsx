import React, { useState } from 'react';
import { Download, FileText, Share2, Printer, CheckCircle2 } from 'lucide-react';
import './DataExport.css';

const DataExport = ({ customers, appointments }) => {
  const [exporting, setExporting] = useState(null);

  const downloadCSV = (data, filename) => {
    setExporting(filename);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + data;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(null);
    }, 1000);
  };

  const exportCustomers = () => {
    let csv = "ID,Name,Contact,Notes\n";
    customers.forEach(c => {
      csv += `${c.id},"${c.name}","${c.contact || ''}","${c.notes || ''}"\n`;
    });
    downloadCSV(csv, "customers.csv");
  };

  const exportAppointments = () => {
    let csv = "ID,Customer ID,Date,Time,Status,Price\n";
    appointments.forEach(a => {
      csv += `${a.id},${a.customerId},${a.date},${a.time},${a.status},${a.totalPrice}\n`;
    });
    downloadCSV(csv, "appointments.csv");
  };

  return (
    <div className="export-page">
      <div className="section-header">
        <h1 className="section-title">Data Export</h1>
      </div>

      <div className="grid grid-cols-3">
        <ExportCard 
          title="Customers Database" 
          desc="Download all registered customer profiles and contact details."
          icon={<FileText size={40} />}
          onExport={exportCustomers}
          isExporting={exporting === "customers.csv"}
        />
        <ExportCard 
          title="Appointment Logs" 
          desc="Full history of scheduled, ongoing, and completed appointments."
          icon={<Calendar size={40} />} // Assuming Calendar is imported or use FileText
          onExport={exportAppointments}
          isExporting={exporting === "appointments.csv"}
        />
        <ExportCard 
          title="Financial Records" 
          desc="Complete transaction history and revenue data for the current period."
          icon={<Share2 size={40} />}
          onExport={() => alert('Transactions export ready')}
          isExporting={false}
        />
      </div>

      <div className="card mt-24 text-center py-40 bg-indigo-50">
        <h3 className="mb-8">Full System Backup</h3>
        <p className="text-muted mb-24 max-w-sm mx-auto">Create a comprehensive backup of all data including customers, appointments, services, and transactions.</p>
        <button className="btn btn-primary mx-auto">
          <Download size={18} />
          <span>Export All Data (.zip)</span>
        </button>
      </div>
    </div>
  );
};

const ExportCard = ({ title, desc, icon, onExport, isExporting }) => (
  <div className="card export-card">
    <div className="export-icon-wrapper mb-24">{icon}</div>
    <h3 className="mb-12">{title}</h3>
    <p className="text-muted text-sm mb-24">{desc}</p>
    <button className="btn btn-secondary w-full" onClick={onExport} disabled={isExporting}>
      {isExporting ? <span className="animate-spin">⌛</span> : <Download size={18} />}
      <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  </div>
);

export default React.memo(DataExport);
