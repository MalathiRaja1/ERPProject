import apiClient from '../api/client';

// Fetches a PDF from the API and triggers a browser download.
// Usage: downloadPdf(`/invoices/${id}/pdf`, 'INV-12345.pdf')
export async function downloadPdf(endpoint, filename) {
  const response = await apiClient.get(endpoint, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
