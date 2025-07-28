// frontend/src/components/api.ts

export async function uploadInvoices(files: FileList): Promise<any[]> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("invoicePdfs", file);
  });

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function uploadSingleInvoice(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("invoicePdfs", file);

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // The backend returns an array, but for single file, take the first result
  const results = await response.json();
  return Array.isArray(results) ? results[0] : results;
}

export async function uploadInvoicesBase64(files: FileList): Promise<any[]> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("invoicePdfs", file);
  });

  const response = await fetch("http://localhost:3000/api/upload-base64", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function uploadSingleInvoiceBase64(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("invoicePdfs", file);

  const response = await fetch("http://localhost:3000/api/upload-base64", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // The backend returns an array, but for single file, take the first result
  const results = await response.json();
  return Array.isArray(results) ? results[0] : results;
}
