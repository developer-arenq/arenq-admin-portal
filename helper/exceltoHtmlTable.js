import * as XLSX from "xlsx";

function excelToHtmlTable(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "buffer" });

      let html = "<table class=' text-sm text-left  border mt-3 '>";

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        for (let i = 0; i < rows.length; i++) {
          if (i == 0) {
            html += `<thead class=' uppercase font-light  bg-gray-50 '>
<tr class='bg-white border-b dark:bg-gray-800 dark:border-gray-700' >`;

            rows[i].forEach((cell) => {
              html += `<th class="py-3 px-6 border whitespace-nowrap"
              >${cell}</th>`;
            });

            html += "</tr></thead>";
          } else {
            html +=
              "<tbody><tr class='bg-white border-b dark:bg-gray-800 dark:border-gray-700' >";

            rows[i].forEach((cell) => {
              html += `<td class="py-4 px-6 ">${cell}</td>`;
            });

            html += "</tr></tbody>";
          }
        }
        // rows.forEach((row) => {});
      });

      html += "</table>";

      resolve(html);
    };

    reader.onerror = reject;
  });
}

export default excelToHtmlTable;
