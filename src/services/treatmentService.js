const BASE_URL = 'http://localhost:8081/api/treatment';

export const treatmentService = {
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch history");
    return await response.json();
  },

  create: async (treatmentData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(treatmentData),
    });
    if (!response.ok) throw new Error("Failed to save treatment");
    return await response.json();
  },

  update: async (id, treatmentData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(treatmentData),
    });
    if (!response.ok) throw new Error("Failed to update record");
    return await response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Failed to delete record");
  }
};