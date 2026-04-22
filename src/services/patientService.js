const BASE_URL = "http://localhost:8081/api/patient";

export const patientService = {
  // Get all patients
  getAll: async () => {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch patients.");
    }

    return await response.json();
  },

  // Create patient
  create: async (data) => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to admit patient.");
    }

    return await response.json();
  },

  // Update patient by NIC
  update: async (nic, data) => {
    const response = await fetch(`${BASE_URL}/${nic}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update patient.");
    }

    return await response.json();
  },

  // Delete patient by NIC
  delete: async (nic) => {
    const response = await fetch(`${BASE_URL}/${nic}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete patient.");
    }

    return true;
  },
};