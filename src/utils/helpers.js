// Formata timestamp para HH:MM:SS
export const formatTimestamp = (date) => {
  return new Date(date).toLocaleTimeString();
};
const API_BASE = process.env.REACT_APP_API_BASE_URL;
// Função para download de CSV
export const downloadCsv = () => {
  const link = document.createElement('a');
  link.href = `${API_BASE}/api/export-can-data-csv`;
  link.download = `can-data-${Date.now()}.csv`;
  link.click();
};