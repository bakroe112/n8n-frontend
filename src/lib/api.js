// src/lib/api.js
const API_URL = "backend.bakroe.site";
const API_LOCAL = "10.60.129.96:4000";

export async function fetchSummary() {
  try {
    const res = await fetch(`https://${API_URL}/api/summary`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    return await res.json();
  } catch (err) {
    console.error("Error fetching summary:", err);
    throw err;
  }
}

export async function fetchTransactions() {
  try {
    const res = await fetch(`https://${API_URL}/api/transactions`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return await res.json();
  } catch (err) {
    console.error("Error fetching transactions:", err);
    throw err;
  }
}

export async function fetchInvoices() {
    try {
    const res = await fetch(`https://${API_URL}/api/invoices`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return await res.json();
  } catch (err) {
    console.error("Error fetching transactions:", err);
    throw err;
  }
}

// POST /api/invoices/batch
// invoices: array các invoice cần tạo
export async function createInvoicesBatch(invoices) {
  try {
    const res = await fetch(`https://${API_URL}/api/invoices/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoices }),
    });

    if (!res.ok) throw new Error("Failed to create invoices");
    return await res.json(); // { invoices: [...] }
  } catch (err) {
    console.error("Error creating invoices:", err);
    throw err;
  }
}
