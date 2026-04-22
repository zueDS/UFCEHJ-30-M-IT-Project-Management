import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select"; // Added trendy select
import { Field, FormCard } from "../components/UI";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { doctorService } from "../services/doctorService";
import { wardService } from "../services/wardService";
import { toast } from "react-toastify";

// Hardcoded Specialisation Options formatted for Select
const SPECIALISATION_OPTIONS = [
  { value: "Cardiology", label: "Cardiology" },
  { value: "Neurology", label: "Neurology" },
  { value: "Orthopaedics", label: "Orthopaedics" },
  { value: "General Surgery", label: "General Surgery" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Internal Medicine", label: "Internal Medicine" }
];

// Hardcoded Team Options formatted for Select
const TEAM_OPTIONS = [
  { value: "Medical Team A", label: "Medical Team A" },
  { value: "Surgical Team B", label: "Surgical Team B" },
  { value: "Emergency Response Team", label: "Emergency Response Team" },
  { value: "Pediatric Specialists", label: "Pediatric Specialists" },
  { value: "Cardiology Unit", label: "Cardiology Unit" }
];

const initialForm = {
  name: "",
  specialisation: "",
  ward: "",
  team: "", 
  mobile: "",
};

const ManageDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalMobile, setOriginalMobile] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadDoctors();
    loadWards();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const loadWards = async () => {
    try {
      const data = await wardService.getAll();
      setWards(data);
    } catch (err) {
      toast.error("Failed to load wards from database");
    }
  };

  // Memoized ward options for react-select
  const wardOptions = useMemo(() => 
    wards.map((w) => ({ value: w.name, label: w.name })),
  [wards]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.specialisation) {
      toast.error("Name, Specialisation and Mobile are required.");
      return;
    }

    try {
      if (isEditing) {
        await doctorService.update(originalMobile, form);
        toast.success("Doctor record updated!");
      } else {
        await doctorService.create(form);
        toast.success("Doctor added successfully!");
      }
      resetForm();
      loadDoctors();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (mobile) => {
    const confirmDelete = () => {
      doctorService.delete(mobile)
        .then(() => {
          loadDoctors();
          toast.success("Doctor record deleted successfully!");
        })
        .catch((err) => toast.error(err.message));
    };

    toast.info(
      <div style={{ minWidth: 150, padding: "5px" }}>
        <p>Are you sure you want to delete this doctor?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
          <button style={confirmBtnStyle} onClick={() => { confirmDelete(); toast.dismiss(); }}>Yes</button>
          <button style={cancelActionBtnStyle} onClick={() => toast.dismiss()}>No</button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const startEdit = (doctor) => {
    setForm({ ...doctor });
    setOriginalMobile(doctor.mobile);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setOriginalMobile(null);
  };

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.mobile?.toLowerCase().includes(q) ||
        d.team?.toLowerCase().includes(q) ||
        d.specialisation?.toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormCard title={isEditing ? "Update Doctor" : "Add Doctor"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <Field
              label="Doctor Full Name"
              placeholder="Dr. John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <Field
              label="Mobile Number"
              placeholder="0771234567"
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Specialisation</label>
              <Select
                options={SPECIALISATION_OPTIONS}
                value={SPECIALISATION_OPTIONS.find(o => o.value === form.specialisation)}
                onChange={(opt) => handleChange("specialisation", opt ? opt.value : "")}
                placeholder="Select specialisation"
                styles={customSelectStyles}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Assigned Ward</label>
              <Select
                options={wardOptions}
                value={wardOptions.find(o => o.value === form.ward)}
                onChange={(opt) => handleChange("ward", opt ? opt.value : "")}
                placeholder="Select ward"
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Assigned Team</label>
              <Select
                options={TEAM_OPTIONS}
                value={TEAM_OPTIONS.find(o => o.value === form.team)}
                onChange={(opt) => handleChange("team", opt ? opt.value : "")}
                placeholder="Select team"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div style={buttonContainerStyle}>
            {isEditing && (
              <button type="button" onClick={resetForm} style={cancelBtnStyle}>
                Cancel Edit
              </button>
            )}
            <button type="submit" style={submitBtnStyle}>
              {isEditing ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </FormCard>
      </form>

      <div style={{ marginTop: 30 }}>
        <div style={tableCardStyle}>
          <div style={tableHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>Doctors List</h2>
            <input
              type="text"
              placeholder="Search by name, team, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#1e40af", color: "#fff" }}>
                <th style={{ padding: 10 }}>Name</th>
                <th>Specialisation</th>
                <th>Ward</th>
                <th>Team</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((d, index) => (
                <tr key={d.mobile} style={{ background: index % 2 === 0 ? "#f9fafb" : "#fff", textAlign: "center" }}>
                  <td style={{ padding: 10 }}>{d.name}</td>
                  <td>{d.specialisation}</td>
                  <td>{d.ward}</td>
                  <td>{d.team}</td>
                  <td>{d.mobile}</td>
                  <td style={{ display: "flex", justifyContent: "center", gap: 12, padding: 10 }}>
                    <FiEdit size={20} color="#f59e0b" style={{ cursor: "pointer" }} onClick={() => startEdit(d)} />
                    <FiTrash2 size={20} color="#ef4444" style={{ cursor: "pointer" }} onClick={() => handleDelete(d.mobile)} />
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
  marginBottom: 6, 
  display: "block", 
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

const tableCardStyle = { background: "#fff", borderRadius: 14, padding: "32px 36px", boxShadow: "0 2px 16px rgba(0,0,0,.07)" };
const tableHeaderStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #dbeafe", paddingBottom: 14, marginBottom: 24 };
const searchStyle = { width: 300, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8 };
const buttonContainerStyle = { display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" };
const submitBtnStyle = { padding: "10px 20px", background: "linear-gradient(135deg,#2563eb,#1e40af)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.3)" };
const cancelBtnStyle = { padding: "8px 20px", background: "#fff", color: "#ef4444", border: "2px solid #ef4444", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };
const confirmBtnStyle = { padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const cancelActionBtnStyle = { padding: "6px 12px", background: "#fff", color: "#ef4444", border: "2px solid #ef4444", borderRadius: 6, cursor: "pointer" };

export default ManageDoctorsPage;