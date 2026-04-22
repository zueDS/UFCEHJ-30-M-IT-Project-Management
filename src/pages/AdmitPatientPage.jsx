import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select"; // Importing Trendy Select
import { Field, FormCard } from "../components/UI";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { patientService } from "../services/patientService";
import { wardService } from "../services/wardService"; 
import { toast } from "react-toastify";

const TEAM_OPTIONS = [
  { value: "Medical Team A", label: "Medical Team A" },
  { value: "Surgical Team B", label: "Surgical Team B" },
  { value: "Emergency Response Team", label: "Emergency Response Team" },
  { value: "Pediatric Specialists", label: "Pediatric Specialists" },
  { value: "Cardiology Unit", label: "Cardiology Unit" }
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const initialForm = {
  name: "",
  contact: "",
  nic: "",
  age: "",
  gender: "",
  date: "",
  ward: "", 
  team: "",
  description: "",
};

const AdmitPatientPage = () => {
  const [patients, setPatients] = useState([]);
  const [wards, setWards] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadPatients();
    loadWards();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      const formatted = data.map((p) => ({
        ...p,
        date: p.admissionDate,
      }));
      setPatients(formatted);
    } catch (err) {
      console.error("Patient Load Error:", err.message);
    }
  };

  const loadWards = async () => {
    try {
      const data = await wardService.getAll();
      setWards(data);
    } catch (err) {
      console.error("Ward Load Error:", err.message);
      toast.error("Failed to load wards from server");
    }
  };

  // Convert wards from server to react-select options
  const wardOptions = useMemo(() => 
    wards.map((w) => ({
      value: w.name,
      label: `${w.name} (Floor ${w.floor})`
    })), 
  [wards]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.nic) {
      alert("Name and NIC are required.");
      return;
    }

    const payload = {
      ...form,
      admissionDate: form.date,
    };

    try {
      if (isEditing) {
        await patientService.update(form.nic, payload);
        toast.success("Patient record updated!");
      } else {
        await patientService.create(payload);
        toast.success("Patient admitted successfully!");
      }
    
      resetForm();
      loadPatients();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (nic) => {
    const confirmDelete = () => {
      patientService
        .delete(nic)
        .then(() => {
          loadPatients();
          resetForm();
          toast.success("Patient record deleted successfully!");
        })
        .catch((err) => toast.error(err.message));
    };
  
    toast.info(
      <div style={{ minWidth: 150, padding: "5px" }}>
        <p>Are you sure you want to delete this patient record?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
          <button
            style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            onClick={() => { confirmDelete(); toast.dismiss(); }}
          >
            Yes
          </button>
          <button
            style={{ padding: "6px 12px", background: "#fff", color: "#ef4444", border: "2px solid #ef4444", borderRadius: 6, cursor: "pointer" }}
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const startEdit = (patient) => {
    setForm({
      ...patient,
      date: patient.date || patient.admissionDate,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nic?.toLowerCase().includes(q) ||
        p.ward?.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormCard title={isEditing ? "Update Patient" : "Admit Patient"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <Field
              label="Patient Full Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <Field
              label="Contact Number"
              value={form.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
            />

            <Field
              label="ID"
              value={form.nic}
              onChange={(e) => handleChange("nic", e.target.value)}
              disabled={isEditing}
            />

            <Field
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Gender</label>
              <Select
                options={GENDER_OPTIONS}
                value={GENDER_OPTIONS.find(o => o.value === form.gender)}
                onChange={(opt) => handleChange("gender", opt ? opt.value : "")}
                placeholder="Select gender"
                styles={customSelectStyles}
              />
            </div>

            <Field
              label="Admit Date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Ward</label>
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
              <label style={labelStyle}>Team</label>
              <Select
                options={TEAM_OPTIONS}
                value={TEAM_OPTIONS.find(o => o.value === form.team)}
                onChange={(opt) => handleChange("team", opt ? opt.value : "")}
                placeholder="Select team"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <Field
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <div style={buttonContainerStyle}>
            {isEditing && (
              <button type="button" onClick={resetForm} style={cancelBtnStyle}>
                Cancel Edit
              </button>
            )}
            <button type="submit" style={submitBtnStyle}>
              {isEditing ? "Update Patient" : "Admit Patient"}
            </button>
          </div>
        </FormCard>
      </form>

      <div style={{ marginTop: 30 }}>
        <div style={tableCardStyle}>
          <div style={tableHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>Admitted Patients</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#1e40af", color: "#fff" }}>
                <th style={{ padding: 10 }}>Name</th>
                <th>NIC</th>
                <th>Ward</th>
                <th>Team</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p, index) => (
                <tr
                  key={p.nic}
                  style={{ background: index % 2 === 0 ? "#f9fafb" : "#fff", textAlign: "center" }}
                >
                  <td style={{ padding: 10 }}>{p.name}</td>
                  <td>{p.nic}</td>
                  <td>{p.ward}</td>
                  <td>{p.team}</td>
                  <td style={{ display: "flex", justifyContent: "center", gap: 12, padding: 10 }}>
                    <FiEdit
                      size={20}
                      color="#f59e0b"
                      style={{ cursor: "pointer" }}
                      onClick={() => startEdit(p)}
                    />
                    <FiTrash2
                      size={20}
                      color="#ef4444"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(p.nic)}
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

// Styles maintained and updated
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
const searchStyle = { width: 300, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8 };
const buttonContainerStyle = { display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" };
const submitBtnStyle = { padding: "10px 20px", background: "linear-gradient(135deg,#2563eb,#1e40af)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.3)" };
const cancelBtnStyle = { padding: "8px 20px", background: "#fff", color: "#ef4444", border: "2px solid #ef4444", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };

export default AdmitPatientPage;