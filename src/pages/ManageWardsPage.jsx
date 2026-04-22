import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select"; // Added trendy select
import { Field, FormCard } from "../components/UI";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { wardService } from "../services/wardService";
import { toast } from "react-toastify";

// Format options for react-select
const WARD_TYPE_OPTIONS = [
  { value: "General", label: "General" },
  { value: "Surgical", label: "Surgical" },
  { value: "ICU", label: "ICU" },
  { value: "Maternity", label: "Maternity" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Emergency", label: "Emergency" }
];

const FLOOR_OPTIONS = [
  { value: "Ground", label: "Ground" },
  { value: "1st Floor", label: "1st Floor" },
  { value: "2nd Floor", label: "2nd Floor" },
  { value: "3rd Floor", label: "3rd Floor" }
];

const initialForm = {
  id: null,
  name: "",
  type: "",
  capacity: "",
  occupied: "0",
  floor: "",
};

const ManageWardsPage = () => {
  const [wards, setWards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadWards();
  }, []);

  const loadWards = async () => {
    try {
      const data = await wardService.getAll();
      setWards(data);
    } catch (err) {
      console.error("Error loading wards:", err.message);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!form.name || !form.capacity || !form.type || !form.floor) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    try {
      if (isEditing) {
        await wardService.update(form.id, form);
        toast.success("Ward updated successfully!");
      } else {
        await wardService.create(form);
        toast.success("Ward Saved successfully!");
      }
      resetForm();
      loadWards();
    } catch (err) {
      toast.error(err.message || "Failed to save ward.");
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = () => {
      wardService.delete(id)
        .then(() => {
          loadWards();
          resetForm();
          toast.success("Ward deleted successfully!");
        })
        .catch((err) => toast.error(err.message));
    };
  
    toast.info(
      <div style={{ minWidth: 150, padding: "5px" }}>
        <p>Are you sure you want to delete this ward?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
          <button
            style={{
              padding: "6px 12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
            onClick={() => { confirmDelete(); toast.dismiss(); }}
          >
            Yes
          </button>
          <button
            style={{
              padding: "6px 12px",
              background: "#fff",
              color: "#ef4444",
              border: "2px solid #ef4444",
              borderRadius: 6,
              cursor: "pointer"
            }}
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const startEdit = (ward) => {
    setForm({ ...ward });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const filteredWards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return wards.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.type?.toLowerCase().includes(q) ||
        w.floor?.toLowerCase().includes(q)
    );
  }, [wards, searchQuery]);

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit}>
        <FormCard title={isEditing ? "Update Ward Details" : "Add New Ward"}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            <Field
              label="Ward Name"
              placeholder="e.g. Ward A"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <Field
              label="Capacity"
              type="number"
              placeholder="20"
              value={form.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
            />

            {/* Ward Type Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Ward Type</label>
              <Select
                options={WARD_TYPE_OPTIONS}
                value={WARD_TYPE_OPTIONS.find(o => o.value === form.type)}
                onChange={(opt) => handleChange("type", opt ? opt.value : "")}
                placeholder="Select Type"
                styles={customSelectStyles}
              />
            </div>

            {/* Floor Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Floor</label>
              <Select
                options={FLOOR_OPTIONS}
                value={FLOOR_OPTIONS.find(o => o.value === form.floor)}
                onChange={(opt) => handleChange("floor", opt ? opt.value : "")}
                placeholder="Select Floor"
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
              {isEditing ? "Update Ward" : "Add Ward"}
            </button>
          </div>
        </FormCard>
      </form>

      {/* Table Section */}
      <div style={{ marginTop: 30 }}>
        <div style={tableCardStyle}>
          <div style={tableHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1e3a8a" }}>
              Existing Wards
            </h2>

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchStyle}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 12px",
              }}
            >
              <thead>
                <tr style={{ background: "#1e40af", color: "#fff" }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th>Ward Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Floor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWards.map((w, index) => (
                  <tr
                    key={w.id}
                    style={{
                      background: index % 2 === 0 ? "#f9fafb" : "#fff",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    <td style={{ padding: 10, fontWeight: "bold" }}>{w.id}</td>
                    <td>{w.name}</td>
                    <td>{w.type}</td>
                    <td>{w.capacity}</td>
                    <td>{w.occupied}</td>
                    <td>{w.floor}</td>
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
                        onClick={() => startEdit(w)}
                      />
                      <FiTrash2
                        size={20}
                        color="#ef4444"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(w.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default ManageWardsPage;