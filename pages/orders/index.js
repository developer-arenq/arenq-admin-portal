/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import io from "socket.io-client";

import { Badge } from "flowbite-react";

import {
  BiAlignLeft,
  BiFilterAlt,
  BiRefresh,
  BiChevronDown,
  BiChevronUp,
} from "react-icons/bi";

import { BsSearch } from "react-icons/bs";

import CurrencyFormatter from "../../helper/currencyFormatter";
import DatePickerComp from "../../components/datePicker";
import Export from "../../components/OExport";

export async function getServerSideProps() {
  const data = await fetch(`${process.env.HOST}/api/orders/list`);
  const res = await data.json();

  return {
    props: {
      orders: res,
      socket_URL: process.env.HOST,
    },
  };
}

let socket;

export default function OrdersPage({ orders, socket_URL }) {
  const [ordersData, setOrdersData] = useState(orders);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const invoiceRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalOrders = ordersData.length;
  const totalPages = Math.ceil(totalOrders / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleOrders = ordersData.slice(startIndex, endIndex);

  // ================================
  // DOWNLOAD INVOICE
  // ================================

  const downloadInvoice = async (orderId) => {
    if (loadingOrderId) return;

    setLoadingOrderId(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      setInvoiceOrder(data);
    } catch (err) {
      console.error("Invoice fetch failed:", err);
      setLoadingOrderId(null);
    }
  };

  useEffect(() => {
    if (!invoiceOrder) return;

    const createPdf = async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;

        const element = invoiceRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(`Invoice_${invoiceOrder._id}.pdf`);
      } catch (err) {
        console.error("Invoice PDF generation failed:", err);
      } finally {
        setLoadingOrderId(null);
        setInvoiceOrder(null);
      }
    };

    createPdf();
  }, [invoiceOrder]);

  // ================================
  // SEARCH FILTER
  // ================================

  const filterProducts = (searchText) => {
    setOrdersData(
      searchText.length
        ? orders.filter((item) =>
          item._id.toLowerCase().includes(searchText.toLowerCase())
        )
        : orders
    );

    setCurrentPage(1);
  };

  // ================================
  // PAYMENT FILTER
  // ================================

  const filterOrdersByPaymentMethods = (method) => {
    setOrdersData(
      method.length
        ? orders.filter((item) =>
          item.payment_method
            .toLowerCase()
            .includes(method.toLowerCase())
        )
        : orders
    );

    setCurrentPage(1);
  };

  // ================================
  // DATE FILTER
  // ================================

  const filterOrdersByDate = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const form_data = Object.fromEntries(formData);

    const startDate = new Date(form_data.startDate);
    const endDate = new Date(form_data.endDate);

    startDate.setHours(0, 0, 0, 0);

    endDate.setHours(23, 59, 59, 999);

    setOrdersData(
      orders.filter(
        (item) =>
          new Date(item.createdAt) >= startDate &&
          new Date(item.createdAt) <= endDate
      )
    );

    setCurrentPage(1);
  };

  // ================================
  // EXPORT EXCEL
  // ================================

  const exportOrdersExcel = () => {
    const orderObj = ordersData.map((order) => ({
      OrderID: order._id,

      Products: order.order_items
        .map((item) => item.title)
        .join(", "),

      PaymentMethod: order.payment_method,

      PaymentStatus: order.isPaid ? "Paid" : "Unpaid",

      DeliveryStatus: order.isDelivered
        ? "Delivered"
        : "Pending",

      OrderDate: new Date(
        order.createdAt
      ).toLocaleDateString(),

      OrderTime: new Date(
        order.createdAt
      ).toLocaleTimeString(),

      Total: order.total,
    }));

    Export({
      data: orderObj,
      filename: "Orders.xlsx",
    });
  };

  // ================================
  // AUTO MARK PAID
  // ================================

  const autoMarkPaid = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}/update`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          isPaid: true,
        }),
      });

      console.log(`Order ${orderId} marked as paid`);
    } catch (err) {
      console.log(err);
    }
  };

  // ================================
  // SEND REVIEW MAIL
  // ================================

  const sendReviewMail = async (orderId) => {
    try {
      const res = await fetch(
        "https://www.arenq.co.in/api/review/sendReviewMail",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================================
  // SOCKET
  // ================================

  useEffect(() => {
    if (autoRefresh) {
      socketInitializer();
    }

    return () => {
      socket?.disconnect();
    };
  }, [autoRefresh]);

  async function socketInitializer() {
    await fetch("/api/socket");

    socket = io(socket_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("latest-order", (data) => {
      if (!ordersData.find((item) => item._id === data._id)) {
        setOrdersData((prev) => [data, ...prev]);

        if (data.isDelivered && !data.reviewEmailSent) {
          if (!data.isPaid) {
            autoMarkPaid(data._id);
          }

          sendReviewMail(data._id);
        }
      }
    });
  }

  // ================================
  // AUTO CHECK DELIVERED ORDERS
  // ================================

  useEffect(() => {
    const interval = setInterval(() => {
      ordersData.forEach((order) => {
        if (order.isDelivered && !order.isPaid) {
          autoMarkPaid(order._id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [ordersData]);

  // ================================
  // STATS
  // ================================

  const delivered = ordersData.filter(
    (o) => o.isDelivered
  ).length;

  const pending = totalOrders - delivered;

  const paid = ordersData.filter(
    (o) => o.isPaid
  ).length;

  const unpaid = totalOrders - paid;

  // ================================
  // RETURN
  // ================================

  return (
    <div className="p-4 sm:p-5 min-h-screen bg-gray-100">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Orders Dashboard
        </h1>

        {/* CONTROLS */}

        <div className="hidden sm:flex flex-wrap gap-2 items-center">
          {/* RESET */}

          {/* <button
            onClick={() => {
              setOrdersData(orders);
              setCurrentPage(1);
            }}
            className="border border-gray-300 py-2 px-4 rounded-md bg-white hover:bg-gray-100"
          >
            <BiAlignLeft />
          </button> */}

          {/* DATE FILTER */}

          {/* <DatePickerComp filter={filterOrdersByDate} /> */}

          {/* PAYMENT FILTER */}

          {/* <div className="flex items-center border border-gray-300 rounded-md px-2 bg-white">
            <BiFilterAlt className="text-xl text-gray-400" />

            <select
              onChange={(e) =>
                filterOrdersByPaymentMethods(e.target.value)
              }
              className="border-0 focus:ring-0 text-sm"
            >
              <option value="">Payment Method</option>

              <option value="cod">COD</option>

              <option value="netbanking">
                Netbanking
              </option>
            </select>
          </div> */}

          {/* SEARCH */}

          <div className="flex items-center border border-gray-300 rounded-md px-2 bg-white">
            <BsSearch className="text-gray-400" />

            <input
              type="search"
              placeholder="Search Order..."
              onChange={(e) =>
                filterProducts(e.target.value)
              }
              className="border-0 focus:ring-0 text-sm"
            />
          </div>

          {/* EXPORT */}

          <button
            onClick={exportOrdersExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Export
          </button>

          {/* AUTO REFRESH */}

          <button
            onClick={() =>
              setAutoRefresh(!autoRefresh)
            }
            className={`flex items-center gap-1 px-3 py-2 rounded-md border
            ${autoRefresh
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            <BiRefresh />

            {autoRefresh
              ? "Auto Refresh ON"
              : "Auto Refresh OFF"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {[
          ["Total Orders", totalOrders],
          ["Delivered", delivered],
          ["Pending", pending],
          ["Paid", paid],
          ["Unpaid", unpaid],
        ].map(([title, value], index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 text-center"
          >
            <h2 className="text-gray-500 text-sm">
              {title}
            </h2>

            <p className="text-2xl font-bold text-gray-800">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {/* <th className="py-3 px-4 border">
                Order ID
              </th> */}

              <th className="py-3 px-4 border">
                Products
              </th>

              <th className="py-3 px-4 border">
                Quantity
              </th>

              <th className="py-3 px-4 border">
                Payment Method
              </th>

              <th className="py-3 px-4 border">
                Payment Status
              </th>

              <th className="py-3 px-4 border">
                Delivery Status
              </th>

              <th className="py-3 px-4 border">
                Shipping
              </th>

              <th className="py-3 px-4 border">
                Tax
              </th>

              <th className="py-3 px-4 border">
                Total
              </th>

              <th className="py-3 px-4 border">
                Date & Time
              </th>

              <th className="py-3 px-4 border text-center">
                Action
              </th>

              <th className="py-3 px-4 border text-center">
                Invoice
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleOrders.length > 0 ? (
              visibleOrders.map((item) => {
                const orderDate = new Date(
                  item.createdAt
                );

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* ORDER ID */}

                    {/* <td className="py-3 px-4 border font-medium">
                      {item._id}
                    </td> */}

                    {/* PRODUCTS */}

                    <td className="py-3 px-4 border">
                      <div className="space-y-4">
                        {item.order_items?.map(
                          (product) => (
                            <div
                              key={product._id}
                              className="flex gap-3"
                            >
                              <img
                                src={
                                  product.image?.[0]
                                }
                                alt={
                                  product.title
                                }
                                className="w-16 h-16 rounded object-cover border"
                              />

                              <div>
                                <h4 className="font-medium text-gray-800 line-clamp-2">
                                  {
                                    product.title
                                  }
                                </h4>

                                <p className="text-xs text-gray-500">
                                  Variant:{" "}
                                  {
                                    product
                                      .variant
                                      ?.value
                                  }
                                </p>

                                <p className="text-xs text-gray-500">
                                  Status:{" "}
                                  {
                                    product.delivery_status
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </td>

                    {/* QUANTITY */}

                    <td className="py-3 px-4 border">
                      {item.order_items?.reduce(
                        (acc, curr) =>
                          acc + curr.quantity,
                        0
                      )}
                    </td>

                    {/* PAYMENT METHOD */}

                    <td className="py-3 px-4 border uppercase">
                      {item.payment_method}
                    </td>

                    {/* PAYMENT STATUS */}

                    <td className="py-3 px-4 border">
                      {item.isPaid ? (
                        <Badge color="success">
                          Paid
                        </Badge>
                      ) : (
                        <Badge color="warning">
                          Unpaid
                        </Badge>
                      )}
                    </td>

                    {/* DELIVERY STATUS */}

                    <td className="py-3 px-4 border">
                      {item.isDelivered ? (
                        <Badge color="success">
                          Delivered
                        </Badge>
                      ) : (
                        <Badge color="warning">
                          Pending
                        </Badge>
                      )}
                    </td>

                    {/* SHIPPING */}

                    <td className="py-3 px-4 border">
                      <CurrencyFormatter
                        price={
                          item.shipping_price
                        }
                      />
                    </td>

                    {/* TAX */}

                    <td className="py-3 px-4 border">
                      <CurrencyFormatter
                        price={item.taxAmount}
                      />
                    </td>

                    {/* TOTAL */}

                    <td className="py-3 px-4 border font-semibold text-green-700">
                      <CurrencyFormatter
                        price={item.total}
                      />
                    </td>

                    {/* DATE & TIME */}

                    <td className="py-3 px-4 border">
                      <div className="text-sm">{orderDate.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{orderDate.toLocaleTimeString()}</div>
                    </td>

                    {/* ACTION */}

                    <td className="py-3 px-4 border text-center">
                      <Link
                        href={`/orders/${item._id}`}
                      >
                        <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                          View
                        </span>
                      </Link>
                    </td>

                    {/* INVOICE */}

                    <td className="py-3 px-4 border text-center">
                      <button
                        onClick={() => downloadInvoice(item._id)}
                        disabled={loadingOrderId === item._id}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingOrderId === item._id ? "Preparing..." : "Download Invoice"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-6 text-gray-500"
                >
                  No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(endIndex, totalOrders)}
          </span>{" "}
          of{" "}
          <span className="font-medium">
            {totalOrders}
          </span>{" "}
          orders
        </div>

        <div className="flex items-center gap-3">
          {/* ROWS */}

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(
                parseInt(e.target.value)
              );

              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value={5}>5</option>

            <option value={10}>10</option>

            <option value={20}>20</option>
          </select>

          {/* BUTTONS */}

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(p - 1, 1)
              )
            }
            disabled={currentPage === 1}
            className="border px-4 py-2 rounded-md"
          >
            Prev
          </button>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className="border px-4 py-2 rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* HIDDEN INVOICE RENDERER */}

      {invoiceOrder && (
        <div
          ref={invoiceRef}
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            width: "210mm",
            padding: "25px 30px",
            background: "white",
            fontFamily: "Arial, sans-serif",
            color: "#222",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #e5e5e5",
              paddingBottom: "15px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  letterSpacing: "1px",
                }}
              >
                TAX INVOICE
              </h1>

              <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#555" }}>
                <strong>Arenq</strong> <br />
                Factory : No. 327/2, Mohida TS, <br />
                Dondaicha Road, Shahada Nandurbar,<br />
                Maharashtra, Pincode - 425409, India.
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <img
                src="/images/logo/logo.png"
                width={110}
                style={{ marginBottom: "8px" }}
                alt="logo"
              />

              <p style={{ fontSize: "12px" }}>
                <strong>Invoice No:</strong> {invoiceOrder._id}
              </p>
              <p style={{ fontSize: "12px" }}>
                <strong>Date:</strong>{" "}
                {new Date(invoiceOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* BILLING + SHIPPING */}
          <div style={{ display: "flex", marginTop: "25px", gap: "30px" }}>
            <div style={{ width: "50%" }}>
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "5px",
                }}
              >
                Billing Address
              </h3>

              <p style={{ lineHeight: "1.6", fontSize: "12px" }}>
                <strong>{invoiceOrder.shipping_address?.fullname}</strong> <br />
                {invoiceOrder.shipping_address?.address_line}, <br />
                {invoiceOrder.shipping_address?.city}, {invoiceOrder.shipping_address?.state} -{" "}
                {invoiceOrder.shipping_address?.postal_code}
                <br />
                {invoiceOrder.shipping_address?.country} <br />
                Phone: {invoiceOrder.shipping_address?.mobile} <br />
                Email: {invoiceOrder.shipping_address?.email}
              </p>
            </div>

            <div style={{ width: "50%" }}>
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "5px",
                }}
              >
                Shipping Address
              </h3>

              <p style={{ lineHeight: "1.6", fontSize: "12px" }}>
                <strong>{invoiceOrder.shipping_address?.fullname}</strong> <br />
                {invoiceOrder.shipping_address?.address_line}, <br />
                {invoiceOrder.shipping_address?.city}, {invoiceOrder.shipping_address?.state} -{" "}
                {invoiceOrder.shipping_address?.postal_code}
                <br />
                {invoiceOrder.shipping_address?.country}
              </p>
            </div>
          </div>

          {/* PRODUCT TABLE WITH GST */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              fontSize: "11px",
            }}
          >
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Variant</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Tax %</th>
                <th style={styles.th}>Tax Amt</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>

            <tbody>
              {invoiceOrder.order_items?.map((item, i) => {
                const taxPercent =
                  item.taxPercentage ?? item.variant?.tax ?? item.tax ?? 0;

                return (
                  <tr key={i}>
                    <td style={styles.tdCenter}>{i + 1}</td>
                    <td style={styles.td}>{item.title}</td>
                    <td style={styles.tdCenter}>{item.quantity}</td>

                    <td style={styles.tdCenter}>
                      {item.variant?.value || "-"}
                    </td>

                    <td style={styles.tdCenter}>₹{item.price}</td>

                    <td style={styles.tdCenter}>{taxPercent}%</td>

                    <td style={styles.tdRight}>
                      ₹{(item.taxAmount ?? 0).toFixed(2)}
                    </td>

                    <td style={styles.tdRight}>
                      ₹{(item.total ?? item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* TOTAL SUMMARY */}
          <div style={{ marginTop: "30px", width: "40%", marginLeft: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={styles.tdLeft}>Subtotal:</td>
                  <td style={styles.tdRight}>₹{(invoiceOrder.subtotal ?? 0).toFixed(2)}</td>
                </tr>

                <tr>
                  <td style={styles.tdLeft}>Tax Amount (GST):</td>
                  <td style={styles.tdRight}>₹{(invoiceOrder.taxAmount ?? 0).toFixed(2)}</td>
                </tr>

                <tr>
                  <td style={styles.tdLeft}>Shipping:</td>
                  <td style={styles.tdRight}>₹{(invoiceOrder.shipping_price ?? 0).toFixed(2)}</td>
                </tr>

                <tr style={{ color: "green" }}>
                  <td style={styles.tdLeft}>Coupon Discount</td>
                  <td style={styles.tdRight}>- ₹{(invoiceOrder.discount ?? 0).toFixed(2)}</td>
                </tr>

                <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
                  <td style={styles.tdLeft}>Grand Total:</td>
                  <td style={styles.tdRight}>₹{(invoiceOrder.total ?? 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <hr style={{ marginTop: "35px" }} />
          <p style={{ textAlign: "center", fontSize: "11px", color: "#555" }}>
            Thank you for shopping with Arenq
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    fontWeight: "bold",
    textAlign: "center",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
  },
  tdCenter: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  },
  tdRight: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "right",
  },
  tdLeft: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
};

