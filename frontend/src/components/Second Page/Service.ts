// services.ts
export const fetchInvoiceData = async (pdfName: string) => {
  try {
    const response = await fetch(`/api/invoice/${pdfName}`);
    if (!response.ok) {
      throw new Error(`Error fetching invoice data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
