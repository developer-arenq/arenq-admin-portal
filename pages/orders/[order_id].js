/* eslint-disable react-hooks/exhaustive-deps */

import { Badge, Breadcrumb } from "flowbite-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { HiHome } from "react-icons/hi";
import { BsBoxSeam } from "react-icons/bs";
import CurrencyFormatter from "../../helper/currencyFormatter";
import toastifyFetch from "../../helper/toastifyFetch";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function getServerSideProps(context) {
  const { order_id } = context.query;

  const res = await fetch(
    `${process.env.HOST}/api/orders/${order_id}`
  ).then((r) => r.json());

  let payment = null;

  if (res.transaction_id) {
    const paymentInfo = await fetch(
      `${process.env.HOST}/api/payment/id/${res.transaction_id}`
    );

    payment = await paymentInfo.json();
  }

  return {
    props: {
      order: res,
      payment,
    },
  };
}

export default function OrderDetail({ order, payment }) {
  const { data: session } = useSession();

  const [isUpdating, setIsUpdating] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(order);

  const [tracking, setTracking] = useState(null);

  const invoiceRef = useRef(null);

  // ==========================================
  // FORMATTED DATE
  // ==========================================

  const formattedDate = new Date(
    currentOrder.createdAt
  ).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  // ==========================================
  // AUTO UPDATE SHIPROCKET STATUS
  // ==========================================

  const autoUpdateShiprocket = async () => {
    try {
      const res = await fetch(
        `/api/admin/order-tracking/${currentOrder._id}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      setTracking(data);

      if (!data?.status) return;

      const mappedStatus = data.status;

      const alreadyUpdated =
        currentOrder.order_items.every(
          (i) => i.delivery_status === mappedStatus
        );

      if (alreadyUpdated) return;

      await toastifyFetch(
        `/api/orders/${currentOrder._id}/update`,
        {
          delivery_status: mappedStatus,
        },
        session,
        "patch"
      );

      setCurrentOrder((prev) => ({
        ...prev,

        order_items: prev.order_items.map((item) => ({
          ...item,
          delivery_status: mappedStatus,
        })),

        isDelivered: mappedStatus === "delivered",
      }));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    autoUpdateShiprocket();

    const interval = setInterval(
      autoUpdateShiprocket,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [currentOrder._id]);

  // ==========================================
  // AUTO DELIVER AFTER 15 DAYS
  // ==========================================

  useEffect(() => {
    const FIFTEEN_DAYS =
      15 * 24 * 60 * 60 * 1000;

    const orderAge =
      Date.now() -
      new Date(currentOrder.createdAt).getTime();

    if (
      orderAge > FIFTEEN_DAYS &&
      !currentOrder.isDelivered
    ) {
      setCurrentOrder((prev) => ({
        ...prev,

        isDelivered: true,

        isPaid: true,

        order_items: prev.order_items.map((i) => ({
          ...i,
          delivery_status: "delivered",
        })),
      }));
    }
  }, [currentOrder.createdAt]);

  // ==========================================
  // UPDATE PAYMENT STATUS
  // ==========================================

  const updatePaymentStatus = async (
    auto = false
  ) => {
    try {
      setIsUpdating(true);

      await toastifyFetch(
        `/api/orders/${order._id}/update`,
        {
          isPaid: true,
        },
        session,
        "patch"
      );

      if (!auto) {
        alert("Payment marked as Paid");
      }

      location.reload();
    } catch (err) {
      console.log(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // UPDATE DELIVERY STATUS
  // ==========================================

  const handleDeliveryStatus = async (
    id,
    status
  ) => {
    await toastifyFetch(
      `/api/orders/${currentOrder._id}/update`,
      {
        order_item_id: id,
        delivery_status: status,
      },
      session,
      "patch"
    );

    setCurrentOrder((prev) => ({
      ...prev,

      order_items: prev.order_items.map((item) =>
        item._id === id
          ? {
            ...item,
            delivery_status: status,
          }
          : item
      ),

      isDelivered:
        status === "delivered"
          ? prev.order_items.every(
            (i) =>
              i._id === id ||
              i.delivery_status === "delivered"
          )
          : prev.isDelivered,
    }));

    if (
      status === "delivered" &&
      !currentOrder.isPaid
    ) {
      await updatePaymentStatus(true);
    }
  };

  // ==========================================
  // STATUS TIMELINE CHECK
  // ==========================================

  const checkStatus = (status, current) => {
    const stages = [
      "order_confirmed",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];

    return (
      stages.indexOf(current) >=
      stages.indexOf(status)
    );
  };

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const downloadInvoice = async () => {
    const element = invoiceRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      10,
      10,
      imgWidth,
      imgHeight
    );

    pdf.save(`Invoice_${order._id}.pdf`);
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* BREADCRUMB */}

      <Breadcrumb className="bg-white p-3 rounded-lg shadow mb-6">
        <Breadcrumb.Item icon={HiHome}>
          Dashboard
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          Orders
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          #{order._id}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* HEADER */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BsBoxSeam />
              Order #{order._id}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Placed on {formattedDate}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Download Invoice
            </button>

            {!currentOrder.isPaid && (
              <button
                onClick={() =>
                  updatePaymentStatus(false)
                }
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                {isUpdating
                  ? "Updating..."
                  : "Mark as Paid"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADDRESS + PAYMENT */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* SHIPPING */}

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">
            Shipping Address
          </h2>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {
                order.shipping_address
                  .fullname
              }
            </p>

            <p>
              {
                order.shipping_address
                  .address_line
              }
            </p>

            <p>
              {
                order.shipping_address
                  .city
              }
              ,{" "}
              {
                order.shipping_address
                  .state
              }{" "}
              -
              {
                order.shipping_address
                  .postal_code
              }
            </p>

            <p>
              {
                order.shipping_address
                  .country
              }
            </p>

            <p>
              {
                order.shipping_address
                  .email
              }
            </p>

            <p>
              {
                order.shipping_address
                  .mobile
              }
            </p>
          </div>
        </div>

        {/* BILLING */}

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">
            Billing Address
          </h2>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {
                order.shipping_address
                  .fullname
              }
            </p>

            <p>
              {
                order.shipping_address
                  .address_line
              }
            </p>

            <p>
              {
                order.shipping_address
                  .city
              }
              ,{" "}
              {
                order.shipping_address
                  .state
              }{" "}
              -
              {
                order.shipping_address
                  .postal_code
              }
            </p>

            <p>
              {
                order.shipping_address
                  .country
              }
            </p>

            <p>
              {
                order.shipping_address
                  .email
              }
            </p>

            <p>
              {
                order.shipping_address
                  .mobile
              }
            </p>
          </div>
        </div>

        {/* PAYMENT */}

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">
            Payment Details
          </h2>

          <p className="text-sm">
            Method :{" "}
            {order.payment_method}
          </p>

          <div className="mt-3">
            <p className="text-green-600 font-bold text-xl">
              <CurrencyFormatter
                price={order.total}
              />
            </p>

            <p className="text-xs text-gray-500">
              Including GST &
              Shipping
            </p>
          </div>

          <div className="mt-3">
            <Badge
              color={
                currentOrder.isPaid
                  ? "success"
                  : "warning"
              }
            >
              {currentOrder.isPaid
                ? "Paid"
                : "Unpaid"}
            </Badge>
          </div>
        </div>
      </div>

      {/* TRACKING */}

      {tracking && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            Track Your Order
          </h2>

          <div className="grid md:grid-cols-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm">
                Courier
              </p>

              <p className="font-semibold">
                {tracking.courier}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                AWB
              </p>

              <p className="font-semibold">
                {tracking.awb}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Location
              </p>

              <p className="font-semibold">
                {
                  tracking.current_location
                }
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Updated
              </p>

              <p className="font-semibold">
                {tracking.last_updated
                  ? new Date(
                    tracking.last_updated
                  ).toLocaleString()
                  : "Not Updated"}
              </p>
            </div>
          </div>

          {/* TIMELINE */}

          {tracking.tracking?.length >
            0 && (
              <div className="mt-8">
                <ol className="relative border-l border-gray-300 ml-3">
                  {tracking.tracking.map(
                    (t, i) => (
                      <li
                        key={i}
                        className="mb-8 ml-6"
                      >
                        <span className="absolute -left-3 w-6 h-6 bg-green-600 rounded-full"></span>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold capitalize">
                            {t.status.replaceAll(
                              "_",
                              " "
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            {t.location}
                          </p>

                          <p className="text-xs text-gray-400">
                            {t.date}
                          </p>
                        </div>
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}
        </div>
      )}

      {/* ORDER ITEMS */}

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">
          Order Items
        </h2>

        {currentOrder.order_items.map(
          (item) => (
            <div
              key={item._id}
              className="border-b py-5"
            >
              <div className="flex flex-col md:flex-row justify-between gap-5">
                {/* PRODUCT */}

                <div className="flex gap-4">
                  <Image
                    src={item.image[0]}
                    width={90}
                    height={90}
                    className="rounded-lg object-cover"
                    alt={item.title}
                  />

                  <div>
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Price :{" "}
                      <CurrencyFormatter
                        price={item.price}
                      />
                    </p>

                    <p className="text-sm text-gray-500">
                      Quantity :{" "}
                      {item.quantity}
                    </p>

                    {item.variant
                      ?.value && (
                        <p className="text-sm text-gray-500">
                          Variant :{" "}
                          {
                            item.variant
                              .value
                          }
                        </p>
                      )}
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <select
                    value={
                      currentOrder.isDelivered
                        ? "delivered"
                        : item.delivery_status
                    }
                    onChange={(e) =>
                      handleDeliveryStatus(
                        item._id,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded-md p-2 bg-gray-100"
                    disabled={
                      currentOrder.isDelivered
                    }
                  >
                    <option value="">
                      Change Status
                    </option>

                    <option value="order_confirmed">
                      Order Confirmed
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="out_for_delivery">
                      Out For Delivery
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>
                  </select>
                </div>
              </div>

              {/* TIMELINE */}

              <div className="flex justify-between mt-6">
                {[
                  "order_confirmed",
                  "shipped",
                  "out_for_delivery",
                  "delivered",
                ].map((status, idx) => (
                  <div
                    key={status}
                    className="flex-1 text-center relative"
                  >
                    <div
                      className={`w-6 h-6 mx-auto rounded-full ${checkStatus(
                        status,
                        item.delivery_status
                      )
                        ? "bg-green-500"
                        : "bg-gray-300"
                        }`}
                    ></div>

                    {idx < 3 && (
                      <div
                        className={`absolute top-3 left-1/2 w-full h-1 ${checkStatus(
                          status,
                          item.delivery_status
                        )
                          ? "bg-green-400"
                          : "bg-gray-200"
                          }`}
                      ></div>
                    )}

                    <p className="text-xs mt-2 capitalize text-gray-500">
                      {status.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* 🔒 Hidden Invoice for PDF */}
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
              <strong>Arrenq</strong> <br />
              GSTIN:  <br />
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
              <strong>Invoice No:</strong> {order._id}
            </p>
            <p style={{ fontSize: "12px" }}>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
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
              <strong>{order.shipping_address.fullname}</strong> <br />
              {order.shipping_address.address_line}, <br />
              {order.shipping_address.city}, {order.shipping_address.state} -{" "}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country} <br />
              Phone: {order.shipping_address.mobile} <br />
              Email: {order.shipping_address.email}
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
              <strong>{order.shipping_address.fullname}</strong> <br />
              {order.shipping_address.address_line}, <br />
              {order.shipping_address.city}, {order.shipping_address.state} -{" "}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
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
            {order.order_items.map((item, i) => {
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
                <td style={styles.tdRight}>₹{(order.subtotal ?? 0).toFixed(2)}</td>
              </tr>

              <tr>
                <td style={styles.tdLeft}>Tax Amount (GST):</td>
                <td style={styles.tdRight}>₹{(order.taxAmount ?? 0).toFixed(2)}</td>
              </tr>

              <tr>
                <td style={styles.tdLeft}>Shipping:</td>
                <td style={styles.tdRight}>₹{(order.shipping_price ?? 0).toFixed(2)}</td>
              </tr>

              <tr style={{ color: "green" }}>
                <td style={styles.tdLeft}>Coupon Discount</td>
                <td style={styles.tdRight}>- ₹{(order.discount ?? 0).toFixed(2)}</td>
              </tr>



              <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
                <td style={styles.tdLeft}>Grand Total:</td>
                <td style={styles.tdRight}>₹{(order.total ?? 0).toFixed(2)}</td>
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
