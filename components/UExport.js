import * as XLSX from "xlsx";

const UExport = ({ data }) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert JSON data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  // Trigger download as Excel file
  XLSX.writeFile(workbook, "usersData.xlsx");
};

export default UExport;
