const BASE_URL = "http://localhost:8081/api/appointments";

export const appointmentService = {
  getAll: async () => {
    const res = await fetch(BASE_URL);
    return await res.json();
  },

  save: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save appointment");
    return await res.json();
  },

  cancel: async (nic) => {
    const res = await fetch(`${BASE_URL}/${nic}/cancel`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to cancel appointment");
    return true;
  }
};