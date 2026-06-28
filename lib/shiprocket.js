/* ---------------- LOGIN ---------------- */
export const shiprocketLogin = async () => {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_API_EMAIL,
        password: process.env.SHIPROCKET_API_PASS,
      }),
    }
  );

  const data = await res.json();
  if (!data?.token) {
    throw new Error("Shiprocket authentication failed");
  }

  return data.token;
};

/* ---------------- BUILD ORDER ---------------- */
export const buildShiprocketOrderPayload = ({ order, address }) => {
  const orderDate = new Date(order.createdAt)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  return {
    order_id: order._id.toString(),
    order_date: orderDate,
    pickup_location: "Office",

    billing_customer_name: address.fullname,
    billing_last_name: "",
    billing_address: address.address_line,
    billing_city: address.city,
    billing_pincode: address.postal_code,
    billing_state: address.state,
    billing_country: "India",
    billing_email: address.email,
    billing_phone: address.mobile,

    shipping_is_billing: true,

    order_items: order.order_items.map((item, i) => ({
      name: item.title,
      sku: item.variant?.value
        ? `${item.variant.value}-${item.id}`
        : `SKU-${item.id}-${i}`,
      units: Number(item.quantity),
      selling_price: Number(item.price),
    })),

    payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    shipping_charges: order.shipping_price,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.discount,
    sub_total: order.subtotal,

    length: 0.5,
    breadth: 0.5,
    height: 0.5,
    weight: Number(order.total_weight || 0.5),
  };
};

/* ---------------- CREATE ORDER ---------------- */
export const createShiprocketOrder = async (payload, token) => {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Shiprocket order failed");
  }

  return data;
};

/* ---------------- ASSIGN COURIER + AWB ---------------- */
export const assignShiprocketCourier = async (shipment_id, token) => {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id,
        courier_id: null, // auto-assign best courier
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "AWB assign failed");
  }

  return data;
};
