import React from "react";

const Invoice = ({ logo, order, signature }) => {
  const generateInvoice = async () => {
    if (typeof window === "undefined") return;

    const jsPDFModule = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDFModule.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const currencyFormatter = (value) => "INR " + Number(value).toFixed(2);

    // ===== INVOICE TITLE =====
    doc.setFontSize(20).setFont("Helvetica", "bold");
    doc.text("INVOICE", 105, 15, { align: "center" });

    // ===== BUSINESS HEADER =====
    if (logo) {
      doc.addImage(logo, "JPEG", 10, 20, 35, 20);
    }
    doc.setFontSize(14).setFont("Helvetica", "bold");
    doc.text("Arenq", 105, 25, { align: "center" });

    doc.setFontSize(10).setFont("Helvetica", "normal");
    doc.text("Plot No. 327/2, Mohida TS, Dondaicha Road,", 105, 31, { align: "center" });
    doc.text("Shahada Nandurbar, Maharashtra – Pincode - 425409, India", 105, 36, { align: "center" });
    doc.text("Phone: +91-8956225134 | Email: info@arenq.co.in | Website: www.arenq.co.in", 105, 41, { align: "center" });

    // ===== ORDER DETAILS =====
    let leftX = 10;
    let leftY = 50;

  
    doc.setFontSize(11).setFont("Helvetica", "normal");
    doc.text(`Order ID: ${order._id}`, leftX, leftY);
    leftY += 6;
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`, leftX, leftY);
    leftY += 6;
    doc.text(`Payment Method: ${order.payment_method}`, leftX, leftY);
    leftY += 6;
    doc.text(`Subtotal: ${currencyFormatter(order.subtotal)}`, leftX, leftY);
    leftY += 6;
    doc.text(`Shipping Charges: ${currencyFormatter(order.shipping_price)}`, leftX, leftY);
    leftY += 6;
    doc.text(`Grand Total: ${currencyFormatter(order.total)}`, leftX, leftY);
    // leftY += 6;
    // doc.text(`Payment Status: ${order.isPaid ? "Paid" : "Pending"}`, leftX, leftY);
    // leftY += 6;
    // doc.text(`Delivery Status: ${order.isDelevered ? "Delivered" : "Pending"}`, leftX, leftY);

    // Right Column - Shipping Address
    let rightX = 110;
    let rightY = 50;

    if (order.shipping_address) {
      doc.setFont("Helvetica", "bold").text("Shipping Address:", rightX, rightY);
      rightY += 6;
      doc.setFont("Helvetica", "normal");
      doc.text(`Name: ${order.shipping_address.fullname || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`Email: ${order.shipping_address.email || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`Mobile: ${order.shipping_address.mobile || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`Address: ${order.shipping_address.address_line || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`City: ${order.shipping_address.city || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`State: ${order.shipping_address.state || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`Postal Code: ${order.shipping_address.postal_code || "N/A"}`, rightX, rightY);
      rightY += 6;
      doc.text(`Country: ${order.shipping_address.country || "N/A"}`, rightX, rightY);
    }

    // Determine next section Y position (below the longest column)
    let nextSectionY = Math.max(leftY, rightY) + 10;

    // ITEM TABLE
    const tableRows = order.order_items.map((item, index) => [
      index + 1,
      item.title,
      currencyFormatter(item.price),
      order.coupon ? currencyFormatter(item.price) : currencyFormatter(0),
      item.quantity,
      currencyFormatter(item.price * item.quantity),
    ]);

    tableRows.push(["", "Shipping Charges", "", "", "", currencyFormatter(order.shipping_price)]);
    tableRows.push([
      { content: "Total", styles: { fontStyle: "bold" }, colSpan: 5 },
      { content: currencyFormatter(order.total), styles: { fontStyle: "bold" } },
    ]);

    autoTable(doc, {
      head: [["Sr.No", "Description", "Unit Price", "Discount", "Quantity", "Subtotal"]],
      body: tableRows,
      startY: nextSectionY,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });



    // SIGNATURE
    const tableBottom = doc.lastAutoTable.finalY + 20;
    if (signature) {
      doc.setFont("Helvetica", "bold").text("Authorized Signature:", 10, tableBottom);
      doc.addImage(signature, "JPEG", 130, tableBottom - 10, 50, 20);
    }

    // Save PDF
    doc.save(`invoice-${order._id}.pdf`);
  };

  return (
    <div>
      <button
        onClick={generateInvoice}
        className="px-10 w-56 py-2 uppercase transition-all duration-300 hover:bg-black hover:text-white text-sm font-bold mt-2 border-2 border-black"
      >
        Download Invoice
      </button>
    </div>
  );
};

export default Invoice;
