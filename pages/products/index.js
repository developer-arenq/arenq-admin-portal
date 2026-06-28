import Link from "next/link";
import { BsSearch } from "react-icons/bs";
import { FaFileExcel, FaPlusCircle, FaTrash } from "react-icons/fa";
import { Badge } from "flowbite-react";
import CurrencyFormatter from "../../helper/currencyFormatter";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import ConfimationModal from "../../components/confimationModal";
import exportToExcel from "../../components/export";
import { motion } from "framer-motion";

const categories_data = [
  { _id: "644132aa76fb670dd86bae3f", name: "Handlooms" },
  { _id: "64785e092fda48934d12332f", name: "Health Care" },
  { _id: "6441333d76fb670dd86bae56", name: "Organic Food Products" },
  { _id: "644132d476fb670dd86bae47", name: "Handcrafts" },
  { _id: "644132c476fb670dd86bae43", name: "Skincare & Beauty" },
];

export default function ProductsPage() {
  const { data: session } = useSession();
  const [productData, setProductData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(categories_data);
  const [deleteItem, setDeleteItem] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Pagination
  const totalPages = Math.ceil(productData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = productData.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Compact pagination numbers
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) end = Math.min(totalPages - 1, 3);
    if (currentPage >= totalPages - 1) start = Math.max(2, totalPages - 2);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  // ✅ Filter Search
  const filterProducts = (text) => {
    const t = text.toLowerCase();
    const filtered = allProducts.filter((item) => {
      const id = item._id.toLowerCase().includes(t);
      const name = item.name.toLowerCase().includes(t);
      const catMatch = categories
        ?.filter((i) => i._id === item.category_id)
        .some((x) => x.name.toLowerCase().includes(t));
      return id || name || catMatch;
    });
    setProductData(filtered);
    setCurrentPage(1);
  };

  const updateProductStatus = async (id, key, value) => {
    const product = allProducts.find((p) => p._id === id);
    if (!product) return;

    const form_data = new FormData();

    form_data.append("id", id);
    form_data.append("name", product.name);
    form_data.append(key, value); // ✅ only once

    const toastId = toast.loading("Please wait...");

    const data = await fetch(`/api/products/update`, {
      method: "PATCH",
      body: form_data,
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    });

    const res = await data.json();

    if (res.message) {
      toast.update(toastId, {
        render: res.message,
        autoClose: 1000,
        type: "success",
        isLoading: false,
      });

      setProductData((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );

      setAllProducts((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );
    } else {
      toast.update(toastId, {
        render: res.error,
        autoClose: 1000,
        type: "error",
        isLoading: false,
      });
    }
  };


  // ✅ Status Filter
  const applyStatusFilter = (status) => {
    setFilter(status);
    if (status === "All") setProductData(allProducts);
    else if (status === "Active") setProductData(allProducts.filter((p) => p.active));
    else if (status === "Inactive") setProductData(allProducts.filter((p) => !p.active));
    else if (status === "In Stock") setProductData(allProducts.filter((p) => !p.out_of_stock));
    else if (status === "Out of Stock") setProductData(allProducts.filter((p) => p.out_of_stock));
    setCurrentPage(1);
  };

  // ✅ Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/products/list`);
      const data = await res.json();

      // 🔥 Ensure productData is ALWAYS an array
      const arr = Array.isArray(data) ? data : [];

      setProductData(arr);
      setAllProducts(arr);
    } catch (err) {
      console.error(err);
      setProductData([]);
      setAllProducts([]);
    } finally {
      setAnimate(false);
    }
  };




  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Count filters
  const activeCount = allProducts.filter((p) => p.active).length;
  const inactiveCount = allProducts.filter((p) => !p.active).length;
  const outStockCount = allProducts.filter((p) => p.out_of_stock).length;
  const inStockCount = allProducts.filter((p) => !p.out_of_stock).length;

  // ✅ Delete Product


  const deleteProduct = async (pro_id) => {
    setConfirmationModal(!confirmationModal);
    const id = toast.loading("Deleting...");
    const response = await fetch(`/api/products/delete`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
      body: JSON.stringify({ id: pro_id }),
      method: "DELETE",
    });
    const res = await response.json();
    if (!response.ok)
      toast.update(id, { render: res.error, type: "error", isLoading: false });
    else {
      toast.update(id, {
        render: "Product deleted successfully",
        type: "success",
        isLoading: false,
      });
      fetchData();
    }
  };

  // ✅ Export Excel
  const exportExcel = () => {
    exportToExcel(productData, categories, []);  // no brands, avoid error
  };



  // ✅ Latest Add / Updated Products
  const lastAdded = [...allProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const lastUpdated = [...allProducts]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteProduct}
        deleteItem={deleteItem}
      />

      <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="page_title">Products</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/products/add-product">
              <button className="btn2 flex items-center gap-1">
                <FaPlusCircle /> Add Product
              </button>
            </Link>
            <button className="btn2 flex items-center gap-1" onClick={exportExcel}>
              <FaFileExcel /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {animate ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-5 space-y-8">
            {/* 🔹 Filter Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <select
                value={filter}
                onChange={(e) => applyStatusFilter(e.target.value)}
                className="border border-gray-300 text-sm rounded-lg p-2 focus:ring-green-400 focus:border-green-400 bg-white"
              >
                <option value="All">All Products ({allProducts.length})</option>
                <option value="Active">Active ({activeCount})</option>
                <option value="Inactive">Inactive ({inactiveCount})</option>
                <option value="In Stock">In Stock ({inStockCount})</option>
                <option value="Out of Stock">Out of Stock ({outStockCount})</option>
              </select>

              <div className="flex items-center border border-gray-300 p-1 px-2 rounded-full bg-white w-full sm:w-64">
                <BsSearch className="text-gray-400" />
                <input
                  type="search"
                  className="bg-transparent text-sm w-full capitalize border-0 focus:ring-0"
                  placeholder="Search..."
                  onChange={(e) => filterProducts(e.target.value)}
                />
              </div>
            </div>

            {/* 🔹 Product Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="overflow-x-auto rounded-md shadow-sm border bg-white">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">#</th>
                      <th className="py-3 px-4 sm:px-6">Product Id</th>
                      <th className="py-3 px-4 sm:px-6">Name</th>
                      <th className="py-3 px-4 sm:px-6">Active</th>
                      <th className="py-3 px-4 sm:px-6">Stock</th>
                      <th className="py-3 px-4 sm:px-6">Price</th>
                      <th className="py-3 px-4 sm:px-6">MRP</th>
                      <th className="py-3 px-4 sm:px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-4 px-4 sm:px-6">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-4 px-4 sm:px-6 break-all">{item._id}</td>
                          <td className="py-4 px-4 sm:px-6 line-clamp-2">{item.name}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-2">
                              {/* Active Toggle */}
                              <div className="flex items-center gap-x-2">
                                <Badge color={item.active ? "success" : "warning"}>
                                  {item.active ? "Active" : "Inactive"}
                                </Badge>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    onChange={() => updateProductStatus(item._id, "active", !item.active)}
                                    checked={item.active}
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                              </div>


                            </div>

                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-x-2">
                              <Badge color={item.out_of_stock ? "failure" : "info"}>
                                {item.out_of_stock ? "Out of Stock" : "In Stock"}
                              </Badge>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  onChange={() => updateProductStatus(item._id, "out_of_stock", !item.out_of_stock)}
                                  checked={item.out_of_stock}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <CurrencyFormatter price={item.price} />
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <CurrencyFormatter price={item.MRP} />
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex gap-4 items-center">
                              <Link
                                href={`/products/update-product/${item._id}`}
                                className="text-blue-600 text-sm font-medium"
                              >
                                Edit
                              </Link>
                              <FaTrash
                                className="text-red-600 cursor-pointer hover:text-red-800"
                                onClick={() => {
                                  setDeleteItem(item._id);
                                  setConfirmationModal(true);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-6 text-center text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🔹 Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${currentPage === page ? "bg-green-500 text-white" : "hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              )}
            </motion.div>

            {/* 🔹 Recent Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {/* Last Added */}
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">🆕 Last Added Products</h2>
                {lastAdded.length > 0 ? (
                  lastAdded.map((p) => (
                    <div key={p._id} className="flex justify-between border-b py-2 text-sm">
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent products added.</p>
                )}
              </div>

              {/* Last Updated */}
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">♻️ Last Updated Products</h2>
                {lastUpdated.length > 0 ? (
                  lastUpdated.map((p) => (
                    <div key={p._id} className="flex justify-between border-b py-2 text-sm">
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent updates.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
