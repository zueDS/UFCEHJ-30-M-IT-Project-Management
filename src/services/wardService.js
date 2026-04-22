const BASE_URL = 'http://localhost:8081/api/ward';

export const wardService = {
  // Fetch all wards
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch wards");
    return await response.json();
  },

  // Add a new ward
  create: async (wardData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wardData),
    });
    if (!response.ok) throw new Error("Failed to create ward");
    return await response.json();
  },

  // Update a ward by ID
  update: async (id, wardData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wardData),
    });
    if (!response.ok) throw new Error("Failed to update ward");
    return await response.json();
  },

  // Delete a ward by ID
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Failed to delete ward");
  }
};