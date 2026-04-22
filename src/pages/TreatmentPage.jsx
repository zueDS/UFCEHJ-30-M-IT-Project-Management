import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select"; // Added trendy select
import { Field, FormCard } from "../components/UI";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { treatmentService } from "../services/treatmentService";
import { patientService } from "../services/patientService";
import { toast } from "react-toastify";
import { doctorService } from "../services/doctorService";

const initialForm = {
  nic: "",
  doctor: "",
  treatmentDate: new Date().toISOString().split("T")[0],
  nextReview: "",
  medications: "",
  notes: "",
};

const TreatmentPage = () => {
  const [patients, setPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    loadPatients();
    loadTreatments();
    loadDoctors();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      toast.error("Failed to load patient NICs");
    }
  };

  const loadTreatments = async () => {
    try {
      const data = await treatmentService.getAll();
      setHistory(data);
    } catch (err) {
      toast.error("Failed to load treatment history");
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      toast.error("Failed to load doctors from database");
    }
  };

  // Memoized options for react-select
  const nicOptions = useMemo(() => 
    patients.map((p) => ({ value: p.nic, label: `${p.nic} - ${p.name}` })),
  [patients]);

  const doctorOptions = useMemo(() => 
    doctors.map((doc) => ({ value: doc.name, label: doc.name })),
  [doctors]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nic || !form.doctor || !form.treatmentDate) {
      toast.warning("NIC, Doctor, and Date are required.");
      return;
    }

    try {
      if (isEditing) {
        await treatmentService.update(currentId, form);
        toast.success("Treatment record updated!");
      } else {
        await treatmentService.create(form);
        toast.success("Treatment recorded successfully!");
      }
      resetForm();
      loadTreatments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = () => {
      treatmentService
        .delete(id)
        .then(() => {
          loadTreatments();
          toast.success("Record deleted successfully!");
        })
        .catch((err) => toast.error(err.message));
    };

    toast.info(
      <div style={{ minWidth: 150, padding: "5px" }}>
        <p>Delete this treatment record?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
          <button
            style={confirmBtnStyle}
            onClick={() => {
              confirmDelete();
              toast.dismiss();
            }}
          >
            Yes
          </button>
          <button style={cancelToastBtnStyle} onClick={() => toast.dismiss()}>
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const startEdit = (record) => {
    setForm(record);
    setCurrentId(record.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter(
      (h) =>
        h.nic?.toLowerCase().includes(q) ||
        h.doctor?.toLowerCase().includes(q) ||
        h.medications?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormCard
          title={isEditing ? "Update Treatment Record" : "New Doctor Treatment"}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            {/* Patient Selection using Trendy Select */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Patient NIC</label>
              <Select
                options={nicOptions}
                value={nicOptions.find(o => o.value === form.nic)}
                onChange={(opt) => handleChange("nic", opt ? opt.value : "")}
                placeholder="Select Patient NIC"
                isDisabled={isEditing}
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            {/* Doctor Selection using Trendy Select */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Doctor Name</label>
              <Select
                options={doctorOptions}
                value={doctorOptions.find(o => o.value === form.doctor)}
                onChange={(opt) => handleChange("doctor", opt ? opt.value : "")}
                placeholder="Select Doctor"
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <Field
              label="Treatment Date"
              type="date"
              value={form.treatmentDate}
              onChange={(e) => handleChange("treatmentDate", e.target.value)}
            />

            <Field
              label="Next Review Date"
              type="date"
              value={form.nextReview}
              onChange={(e) => handleChange("nextReview", e.target.value)}
            />
          </div>

          <Field
            label="Medications"
            placeholder="Dosage and frequency..."
            value={form.medications}
            onChange={(e) => handleChange("medications", e.target.value)}
          />

          <Field
            label="Clinical Notes"
            placeholder="Enter observations..."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />

          <div style={buttonContainerStyle}>
            {isEditing && (
              <button type="button" onClick={resetForm} style={cancelBtnStyle}>
                Cancel Edit
              </button>
            )}
            <button type="submit" style={submitBtnStyle}>
              {isEditing ? "Update Record" : "Save Treatment"}
            </button>
          </div>
        </FormCard>
      </form>

      <div style={{ marginTop: 30 }}>
        <div style={tableCardStyle}>
          <div style={tableHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>
              Treatment History
            </h2>
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 12px",
            }}
          >
            <thead>
              <tr style={{ background: "#1e40af", color: "#fff" }}>
                <th style={{ padding: 10 }}>NIC</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Medications</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h, index) => (
                <tr
                  key={h.id || index}
                  style={{
                    background: index % 2 === 0 ? "#f9fafb" : "#fff",
                    textAlign: "center",
                  }}
                >
                  <td style={{ padding: 10 }}>{h.nic}</td>
                  <td>{h.doctor}</td>
                  <td>{h.treatmentDate}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.medications}
                  </td>
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                      padding: 10,
                    }}
                  >
                    <FiEdit
                      size={20}
                      color="#f59e0b"
                      style={{ cursor: "pointer" }}
                      onClick={() => startEdit(h)}
                    />
                    <FiTrash2
                      size={20}
                      color="#ef4444"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(h.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Updated Trendy Styles ---

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
  color: "#374151"
};

const customSelectStyles = { 
  control: (base, state) => ({ 
    ...base, 
    borderRadius: 8, 
    borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
    minHeight: "40px",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    "&:hover": { borderColor: "#2563eb" }
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: state.isSelected 
      ? "#2563eb" 
      : state.isFocused 
        ? "#eff6ff" 
        : "#fff",
    color: state.isSelected ? "#fff" : "#374151",
    "&:active": {
      backgroundColor: "#dbeafe"
    }
  })
};

const tableCardStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: "32px 36px",
  boxShadow: "0 2px 16px rgba(0,0,0,.07)",
};
const tableHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "2px solid #dbeafe",
  paddingBottom: 14,
  marginBottom: 24,
};
const searchStyle = {
  width: 300,
  padding: "8px 12px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
};
const buttonContainerStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "16px",
  alignItems: "center",
};
const submitBtnStyle = {
  padding: "10px 20px",
  background: "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
};
const cancelBtnStyle = {
  padding: "8px 20px",
  background: "#fff",
  color: "#ef4444",
  border: "2px solid #ef4444",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};
const confirmBtnStyle = {
  padding: "6px 12px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
const cancelToastBtnStyle = {
  padding: "6px 12px",
  background: "#fff",
  color: "#ef4444",
  border: "2px solid #ef4444",
  borderRadius: 6,
  cursor: "pointer",
};

export default TreatmentPage;