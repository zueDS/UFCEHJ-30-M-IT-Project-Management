const DISCHARGE_URL = "http://localhost:8081/api/discharge";

export const dischargeService = {
  // Fetch all history from the discharge table
  getHistory: async () => {
    const response = await fetch(DISCHARGE_URL);
    if (!response.ok) throw new Error("Failed to fetch discharge history.");
    return await response.json();
  },

  // Post new discharge (Backend logic should delete patient from patient table)
  submitDischarge: async (data) => {
    const response = await fetch(DISCHARGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to discharge patient.");
    }
    return await response.json();
  },
};