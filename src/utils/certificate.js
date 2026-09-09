import api from "../lib/api";

/**
 * Downloads a course certificate PDF directly to the user's device.
 *
 * @param {string} pdfUrl - The relative or absolute media URL (e.g. /media/SVARP-123456.pdf)
 * @param {string} [certificateCode] - The unique certificate verification code for the filename
 * @returns {Promise<void>}
 */
export async function downloadCertificatePdf(pdfUrl, certificateCode = "certificate") {
  const cleanCode = (certificateCode || "certificate").replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `${cleanCode}.pdf`;
  const endpoint = pdfUrl || `/media/${cleanCode}.pdf`;
  const token = localStorage.getItem("token");
  const separator = endpoint.includes("?") ? "&" : "?";
  const requestUrl = `${endpoint}${separator}download=true&token=${encodeURIComponent(token || "")}`;

  try {
    const response = await api.get(requestUrl, { responseType: "blob" });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Blob download failed, falling back to direct navigation:", err);
    window.open(requestUrl, "_blank");
  }
}
