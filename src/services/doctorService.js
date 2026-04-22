const BASE_URL = "http://localhost:8081/api/doctor";

export const doctorService = {
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch doctors.");
    return await response.json();
  },

  create: async (data) => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add doctor.");
    }
    return await response.json();
  },

  update: async (mobile, data) => {
    const response = await fetch(`${BASE_URL}/${mobile}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update doctor.");
    }
    return await response.json();
  },

  delete: async (mobile) => {
    const response = await fetch(`${BASE_URL}/${mobile}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete doctor.");
    return true;
  },
};