import * as XLSX from "xlsx";

/* --------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

// Extract plain text from DraftJS description
function extractText(desc) {
  if (!desc) return "";
  try {
    const json = JSON.parse(desc);
    return json.blocks.map((b) => b.text).join("\n");
  } catch (err) {
    return desc;
  }
}

// Auto column width
function autoFitColumns(rows) {
  const keys = Object.keys(rows[0]);
  return keys.map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 2,
  }));
}

/* --------------------------------------------------------
   MAIN EXPORT FUNCTION
--------------------------------------------------------- */

const exportToExcel = (products, categories, brands = []) => {
  if (!products || products.length === 0) return;

  // Lookup maps
  const categoryMap = {};
  categories?.forEach((c) => (categoryMap[c._id] = c.name));

  const brandMap = {};
  brands?.forEach((b) => (brandMap[b._id] = b.name));

  let rows = [];

  products.forEach((p) => {
    // Resolve category id (string OR {$oid: ""})
    const categoryId =
      typeof p.category_id === "string"
        ? p.category_id
        : p.category_id?.$oid;

    // Resolve brand id (string OR {$oid: ""})
    const brandId =
      typeof p.brand_id === "string"
        ? p.brand_id
        : p.brand_id?.$oid;

    const base = {
      ID: p._id,
      Name: p.name,
      Slug: p.slug,

      Category: categoryMap[categoryId] || "",
      Brand: brandMap[brandId] || p.structured_data?.brand || "",

      SubCategory: p.subcat || "",
      Featured: p.featured || "",
      Rating: p.rating || 0,
      SKU: p.SKU || "",
      Price: p.price,
      MRP: p.MRP,

      Description: extractText(p.desc),
      MainImage: p.main_image || "",
      Images: p.images?.join("\n") || "",
      Videos: p.videos?.join("\n") || "",
      AltText: p.alt_text || "",
      Tags: p.tags?.join(", ") || "",

      Active: p.active ? "Yes" : "No",
      OutOfStock: p.out_of_stock ? "Yes" : "No",
      PurchaseCount: p.purchase_count || 0,

      CreatedAt: p.createdAt
        ? new Date(p.createdAt).toLocaleString()
        : "",
      UpdatedAt: p.updatedAt
        ? new Date(p.updatedAt).toLocaleString()
        : "",

      SEO_Title: p.seo?.title || "",
      SEO_Description: p.seo?.description || "",
      SEO_Keywords: p.seo?.keywords?.join(", ") || "",
      Canonical: p.seo?.canonical || "",

      Structured_Brand: p.structured_data?.brand || "",
      Structured_SKU: p.structured_data?.sku || "",
      Structured_Currency: p.structured_data?.currency || "",
      Structured_Availability: p.structured_data?.availability || "",
      Structured_Price: p.structured_data?.price || "",
      Structured_RatingValue: p.structured_data?.ratingValue || "",
      Structured_ReviewCount: p.structured_data?.reviewCount || "",
      Structured_Tax: p.structured_data?.tax || "",

      FAQ: Array.isArray(p.faq) ? p.faq.join("\n\n") : "",
    };

    /* --------------------------------------------------------
       NO VARIANTS → ALWAYS SINGLE ROW
    --------------------------------------------------------- */
    rows.push({
      ...base,
      VariantType: "",
      VariantValue: "",
      VariantPrice: "",
      VariantMRP: "",
      VariantSKU: "",
      VariantStock: "",
      VariantTax: "",
    });
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  /* --------------------------------------------------------
     MAKE MAIN IMAGE CLICKABLE
  --------------------------------------------------------- */
  const colIndex = Object.keys(rows[0]).indexOf("MainImage");
  if (colIndex !== -1) {
    rows.forEach((row, i) => {
      if (!row.MainImage) return;
      const cell = XLSX.utils.encode_cell({ r: i + 1, c: colIndex });
      worksheet[cell].l = {
        Target: row.MainImage,
        Tooltip: "Open Image",
      };
    });
  }

  // Auto size columns
  worksheet["!cols"] = autoFitColumns(rows);

  // Wrap text in ALL cells
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (cell) {
        if (!cell.s) cell.s = {};
        cell.s.alignment = { wrapText: true, vertical: "top" };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  XLSX.writeFile(workbook, "productsData.xlsx");
};

export default exportToExcel;
