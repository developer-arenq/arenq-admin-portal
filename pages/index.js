import Image from "next/image";
import { BsFillHandbagFill } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import CurrencyFormatter from "../helper/currencyFormatter";
import { motion } from "framer-motion";
import Card from "../components/card";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/orders/list`);
  const res = await data.json();

  const users_data = await fetch(`${process.env.HOST}/api/users/list`);
  const users = await users_data.json();

  return {
    props: {
      orders_array: res,
      users,
    },
  };
}

export let socket;

export default function Dashboard({ orders_array, users }) {
  const [orders, setOrders] = useState(orders_array);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(orders.length);
  const [totalUsers, setTotalUsers] = useState(users.length);
  const [products, setProducts] = useState(0);

  // Revenue Calculation
  const calRevenue = (ord) => {
    if (Array.isArray(ord)) {
      setTotalRevenue(
        ord.reduce((acc, order) => acc + Number(order.total || 0), 0)
      );
    } else {
      setTotalRevenue(0);
    }
  };

  // Products Count
  const no_of_products = async () => {
    try {
      const data = await fetch(`/api/products/list`);
      const res = await data.json();
      setProducts(res?.length || 0);
    } catch (err) {
      console.log(err);
    }
  };

  // Initial Load
  useEffect(() => {
    calRevenue(orders);
    setTotalSales(orders.length);
    no_of_products();
  }, [orders]);

  // Socket Setup
  useEffect(() => {
    socketInitializer();

    return () => {
      socket?.disconnect();
    };
  }, []);

  async function socketInitializer() {
    await fetch("/api/socket");

    socket = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("latest-order", (data) => {
      if (!orders.some((item) => item._id === data._id)) {
        setOrders((prev) => [data, ...prev]);
      }
    });
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-6"
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            icon={<GiReceiveMoney className="text-2xl text-green-500" />}
            color="green"
            value={<CurrencyFormatter price={totalRevenue} />}
            text="Total Revenue"
          />

          <Card
            icon={<BsFillHandbagFill className="text-2xl text-orange-500" />}
            color="orange"
            value={totalSales}
            text="Total Orders"
          />

          <Card
            icon={<FaShoppingCart className="text-2xl text-sky-500" />}
            color="blue"
            value={products}
            text="Products"
          />

          <Card
            icon={<HiUsers className="text-2xl text-gray-500" />}
            color="gray"
            value={totalUsers}
            text="Users"
          />
        </div>
      </motion.div>

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>

        <div className="overflow-x-auto bg-white shadow border rounded-xl">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                {/* <th className="py-4 px-4">Order ID</th> */}
                <th className="py-4 px-4">Products</th>
                <th className="py-4 px-4">Qty</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Subtotal</th>
                <th className="py-4 px-4">Shipping</th>
                <th className="py-4 px-4">Tax</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.slice(0, 10).map((item) => {
                  const orderDate = new Date(item.createdAt);

                  return (
                    <tr
                      key={item._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      {/* Order ID
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {item._id}
                      </td> */}

                      {/* Products */}
                      <td className="py-4 px-4">
                        <div className="space-y-3">
                          {item.order_items?.map((product) => (
                            <div
                              key={product._id}
                              className="flex items-center gap-3"
                            >
                              <img
                                src={product.image?.[0]}
                                alt={product.title}
                                className="w-14 h-14 rounded object-cover border"
                              />

                              <div>
                                <h4 className="font-medium text-gray-800 line-clamp-2">
                                  {product.title}
                                </h4>

                                <p className="text-xs text-gray-500">
                                  Variant: {product.variant?.value}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Delivery: {product.delivery_status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4">
                        {item.order_items?.reduce(
                          (acc, curr) => acc + curr.quantity,
                          0
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 uppercase">
                        {item.payment_method}
                      </td>

                      {/* Subtotal */}
                      <td className="py-4 px-4">
                        <CurrencyFormatter price={item.subtotal} />
                      </td>

                      {/* Shipping */}
                      <td className="py-4 px-4">
                        <CurrencyFormatter price={item.shipping_price} />
                      </td>

                      {/* Tax */}
                      <td className="py-4 px-4">
                        <CurrencyFormatter price={item.taxAmount} />
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-semibold text-green-600">
                        <CurrencyFormatter price={item.total} />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            item.isDelivered
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.isDelivered ? "Delivered" : "Pending"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        {orderDate.toLocaleDateString()}
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4">
                        {orderDate.toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-6 text-gray-500"
                  >
                    No Orders Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}