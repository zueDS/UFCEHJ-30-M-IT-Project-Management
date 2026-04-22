import React, { useState } from 'react';
import Icon from '../components/Icon';
import { wardService } from "../services/wardService";
import { patientService } from "../services/patientService";
import { treatmentService } from "../services/treatmentService";
import { toast } from "react-toastify";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("Ward Report");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const getColumns = () => {
    switch (reportType) {
      case "Patient Admission Report":
        return ["Name", "NIC", "Ward", "Admitted Date", "Contact"];
      case "Doctor Treatment Report":
        return ["Doctor", "Patient NIC", "Notes", "Treatment Date", "Medications"];
      case "Ward Report":
      default:
        return ["Ward Name", "Ward Type", "Capacity", "Occupied Beds", "Occupancy Rate"];
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData([]);
    try {
      if (reportType === "Ward Report") {
        const [wards, patients] = await Promise.all([
          wardService.getAll(),
          patientService.getAll()
        ]);
        const data = wards.map(w => {
          const occupied = patients.filter(p => p.ward === w.wardName || p.ward === w.name).length;
          const capacity = w.capacity || 0;
          const rate = capacity > 0 ? ((occupied / capacity) * 100).toFixed(1) + "%" : "0%";
          return {
            col1: w.wardName || w.name,
            col2: w.wardType || w.type || "General",
            col3: capacity,
            col4: occupied,
            col5: rate
          };
        });
        setReportData(data);
      }

      else if (reportType === "Patient Admission Report") {
        const patients = await patientService.getAll();
        const filtered = patients.filter(p => {
          if (!dateRange.start || !dateRange.end) return true;
          const recordDate = new Date(p.admissionDate);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          return recordDate >= startDate && recordDate <= endDate;
        });
        setReportData(filtered.map(p => ({
          col1: p.name || "N/A",
          col2: p.nic || "N/A",
          col3: p.ward || "N/A",
          col4: p.admissionDate || "N/A",
          col5: p.contact || "N/A"
        })));
      }

      else if (reportType === "Doctor Treatment Report") {
        const treatments = await treatmentService.getAll();
        const filtered = treatments.filter(t => {
          if (!dateRange.start || !dateRange.end) return true;
          const recordDate = new Date(t.treatmentDate);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          return recordDate >= startDate && recordDate <= endDate;
        });
        setReportData(filtered.map(t => ({
          col1: t.doctor || "N/A",
          col2: t.nic || "N/A",
          col3: t.notes || "N/A",
          col4: t.treatmentDate || "N/A",
          col5: t.medications || "N/A"
        })));
      }

      toast.success(`${reportType} generated successfully`);
    } catch (err) {
      toast.error("Connection failed. Ensure backend is running on port 8081.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── CSV Download ──────────────────────────────────────────────
  const downloadCSV = () => {
    if (reportData.length === 0) {
      toast.warn("Generate a report first before downloading.");
      return;
    }

    const columns = getColumns();
    const rows = reportData.map(row => [row.col1, row.col2, row.col3, row.col4, row.col5]);

    const csvContent = [
      columns.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  // ─── PDF Download using jsPDF + autoTable ─────────────────────
  const downloadPDF = () => {
    if (reportData.length === 0) {
      toast.warn("Generate a report first before downloading.");
      return;
    }

    // Dynamically import jsPDF (must be installed: npm install jspdf jspdf-autotable)
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // ── Header ──
        doc.setFillColor(15, 23, 42); // #0f172a
        doc.rect(0, 0, 297, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('HOSPITAL MANAGEMENT SYSTEM', 14, 9);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Report Document', 14, 15);

        // ── Report Title ──
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(reportType, 14, 32);

        // ── Meta info ──
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const generatedOn = `Generated: ${new Date().toLocaleString()}`;
        const period = dateRange.start && dateRange.end
          ? `Period: ${dateRange.start} to ${dateRange.end}`
          : 'Period: All Records';
        doc.text(generatedOn, 14, 39);
        doc.text(period, 14, 44);
        doc.text(`Total Records: ${reportData.length}`, 14, 49);

        // ── Table ──
        const columns = getColumns();
        const rows = reportData.map(row => [row.col1, row.col2, row.col3, row.col4, row.col5]);

        doc.autoTable({
          head: [columns],
          body: rows,
          startY: 55,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 4,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.3,
          },
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { left: 14, right: 14 },
        });

        // ── Footer on each page ──
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          const pageHeight = doc.internal.pageSize.height;
          doc.setDrawColor(226, 232, 240);
          doc.line(14, pageHeight - 12, 283, pageHeight - 12);
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text('Hospital Management System — Confidential', 14, pageHeight - 7);
          doc.text(`Page ${i} of ${pageCount}`, 283, pageHeight - 7, { align: 'right' });
        }

        doc.save(`${reportType.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success("PDF downloaded!");
      });
    }).catch(() => {
      toast.error("PDF library not installed. Run: npm install jspdf jspdf-autotable");
    });
  };

  return (
    <div className="reports-page" style={{ padding: '28px', background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Hospital Management Reports
        </h1>

        {/* Download Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={csvBtnStyle} onClick={downloadCSV} title="Download as CSV (Excel)">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>
            </svg>
            <span>Download</span>
          </button>

          {/* <button style={pdfBtnStyle} onClick={downloadPDF} title="Download as PDF">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>
            </svg>
            <span>PDF</span>
          </button> */}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="no-print" style={filterBarStyle}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Report Category</label>
            <select
              style={inputStyle}
              value={reportType}
              onChange={(e) => { setReportType(e.target.value); setReportData([]); }}
            >
              <option value="Ward Report">Ward Occupancy Report</option>
              <option value="Patient Admission Report">Patient Admission History</option>
              <option value="Doctor Treatment Report">Doctor Treatment Records</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Date Range</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" style={inputStyle} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input type="date" style={inputStyle} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
          </div>

          <button style={generateBtnStyle} onClick={generateReport} disabled={loading}>
            {loading ? "Fetching..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={tableContainerStyle} id="report-content">
        <div style={{ borderBottom: '2px solid #334155', marginBottom: '20px', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ margin: 0, color: '#334155', fontSize: '18px' }}>{reportType}</h2>
            {dateRange.start && (
              <small style={{ color: '#64748b' }}>Period: {dateRange.start} to {dateRange.end}</small>
            )}
          </div>
          {reportData.length > 0 && (
            <span style={{ fontSize: '13px', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
              {reportData.length} record{reportData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#2563eb,#1e40af)", textAlign: 'left' }}>
              {getColumns().map((col, i) => (
                <th key={i} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? reportData.map((row, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}>{row.col1}</td>
                <td style={tdStyle}>{row.col2}</td>
                <td style={tdStyle}>{row.col3}</td>
                <td style={tdStyle}>{row.col4}</td>
                <td style={tdStyle}>{row.col5}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No data available. Select criteria and click Generate Report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .reports-page { padding: 0 !important; }
          #report-content { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const filterBarStyle = { background: '#fff', padding: '20px 24px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { padding: '9px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155', outline: 'none', background: '#fff' };
const generateBtnStyle = { background: "linear-gradient(135deg,#2563eb,#1e40af)",color: '#fff', padding: '10px 22px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const tableContainerStyle = { background: '#fff', padding: '28px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' };
const thStyle = { padding: '12px 16px', fontSize: '12px', color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' };
const tdStyle = { padding: '13px 16px', fontSize: '14px', color: '#1e293b' };
const csvBtnStyle = { background: '#fff', border: '1.5px solid #16a34a', color: '#16a34a', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '700', fontSize: '13px' };
const pdfBtnStyle = { background: '#fff', border: '1.5px solid #dc2626', color: '#dc2626', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '700', fontSize: '13px' };

export default ReportsPage;