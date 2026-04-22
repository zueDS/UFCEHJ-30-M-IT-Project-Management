import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { Field, FormCard } from "../components/UI";
import { patientService } from "../services/patientService";
import { dischargeService } from "../services/dischargeService";
import { toast } from "react-toastify";

const DISCHARGE_TYPES = [
  { value: "Regular", label: "Regular" },
  { value: "AOR", label: "AOR" },
  { value: "Expired", label: "Expired" }
];

const EMPTY_FORM = {
  nic: "",
  patientName: "",
  dischargeDate: "",
  dischargeType: "",
  summary: "",
};

const DischargePatientPage = () => {
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedNIC, setSelectedNIC] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [admitted, historyData] = await Promise.all([
        patientService.getAll(),
        dischargeService.getHistory()
      ]);
      setAdmittedPatients(admitted);
      setHistory(historyData);
    } catch (err) {
      toast.error("Error loading data from server");
    }
  };

  const nicOptions = useMemo(() => 
    admittedPatients.map((p) => ({
      value: p.nic,
      label: `${p.nic} - ${p.name}`,
      patientName: p.name
    })), 
  [admittedPatients]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleNICChange = (selectedOption) => {
    setSelectedNIC(selectedOption);
    if (selectedOption) {
      setForm({
        ...form,
        nic: selectedOption.value,
        patientName: selectedOption.patientName
      });
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nic || !form.dischargeDate || !form.dischargeType) {
      toast.warn("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await dischargeService.submitDischarge({
        nic: form.nic,
        name: form.patientName,
        dischargeDate: form.dischargeDate,
        dischargeType: form.dischargeType,
        summary: form.summary
      });

      toast.success("Patient discharged successfully!");
      setForm(EMPTY_FORM);
      setSelectedNIC(null);
      await loadInitialData(); 
    } catch (err) {
      toast.error(err.message || "Failed to process discharge");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nic?.toLowerCase().includes(q) ||
        p.dischargeType?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormCard title="Discharge Patient">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Patient NIC (Admitted Only)</label>
              <Select
                options={nicOptions}
                value={selectedNIC}
                onChange={handleNICChange}
                placeholder="Search Admitted NIC..."
                isSearchable
                styles={customSelectStyles}
              />
            </div>

            <Field
              label="Patient Name"
              value={form.patientName}
              readOnly
              placeholder="Auto-filled from NIC"
            />

            <Field
              label="Discharge Date"
              type="date"
              value={form.dischargeDate}
              onChange={(e) => handleChange("dischargeDate", e.target.value)}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Discharge Type</label>
              <Select
                options={DISCHARGE_TYPES}
                value={DISCHARGE_TYPES.find(o => o.value === form.dischargeType)}
                onChange={(opt) => handleChange("dischargeType", opt ? opt.value : "")}
                placeholder="Select type"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <Field
            label="Discharge Summary"
            value={form.summary}
            onChange={(e) => handleChange("summary", e.target.value)}
            placeholder="Enter final clinical notes..."
          />

          <div style={buttonContainerStyle}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{...submitBtnStyle, opacity: isLoading ? 0.7 : 1}}
            >
              {isLoading ? "Processing..." : "Confirm Discharge"}
            </button>
          </div>
        </FormCard>
      </form>

      <div style={{ marginTop: 30 }}>
        <div style={tableCardStyle}>
          <div style={tableHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>Discharge History</h2>
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#1e40af", color: "#fff" }}>
                <th style={{ padding: 12, textAlign: "left", borderRadius: "8px 0 0 8px" }}>Patient Name</th>
                <th style={{ textAlign: "left" }}>NIC</th>
                <th style={{ textAlign: "left" }}>Discharged On</th>
                <th style={{ textAlign: "left" }}>Type</th>
                <th style={{ textAlign: "left", borderRadius: "0 8px 8px 0" }}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((p, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{p.name}</td>
                  <td>{p.nic}</td>
                  <td>{p.dischargeDate}</td>
                  <td>
                    <span style={getTypeBadgeStyle(p.dischargeType)}>{p.dischargeType}</span>
                  </td>
                  <td style={{ fontSize: "13px", color: "#6b7280", maxWidth: "250px" }}>{p.summary}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                    No discharge records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Unified Styles from AdmitPatientPage
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: 8,
    borderColor: "#e5e7eb",
    padding: "2px",
    fontSize: "14px",
    boxShadow: "none",
    "&:hover": { borderColor: "#2563eb" }
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "14px",
    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "#fff",
    color: state.isSelected ? "#fff" : "#374151"
  })
};

const tableCardStyle = { background: "#fff", borderRadius: 14, padding: "32px 36px", boxShadow: "0 2px 16px rgba(0,0,0,.07)" };
const tableHeaderStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #dbeafe", paddingBottom: 14, marginBottom: 24 };
const searchStyle = { width: 300, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "14px" };
const buttonContainerStyle = { display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" };
const submitBtnStyle = { padding: "10px 20px", background: "linear-gradient(135deg,#2563eb,#1e40af)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.3)" };

const getTypeBadgeStyle = (type) => {
  const base = { padding: "4px 10px", borderRadius: 6, fontSize: "12px", fontWeight: 600 };
  if (type === "Expired") return { ...base, background: "#fee2e2", color: "#b91c1c" };
  if (type === "AOR") return { ...base, background: "#fef3c7", color: "#92400e" };
  return { ...base, background: "#dcfce7", color: "#15803d" };
};

export default DischargePatientPage;