import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FaTrash, FaPlusCircle, FaFileExcel } from "react-icons/fa";
import { Badge } from "flowbite-react";
import { toast } from "react-toastify";
import ConfimationModal from "../../components/confimationModal";
import Export from "../../components/export";

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [allInventories, setAllInventories] = useState([]);
  const [deleteItem, setDeleteItem] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch inventory data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventories(data);
      setAllInventories(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter inventory
  const filterInventory = (searchText) => {
    const lower = searchText.toLowerCase();
    if (!searchText) return setInventories(allInventories);

    const filtered = allInventories.filter(
      (item) =>
        item.product_title.toLowerCase().includes(lower) ||
        item.SKU.toLowerCase().includes(lower) ||
        item.location.toLowerCase().includes(lower) ||
        item.product_id?._id?.toLowerCase().includes(lower)
    );
    setInventories(filtered);
  };

  // Delete inventory
  const deleteInventory = async (id) => {
    setConfirmationModal(false);
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.update(toastId, { render: "Deleted successfully", type: "success", isLoading: false, autoClose: 1000 });
        fetchData();
      } else {
        toast.update(toastId, { render: data.error, type: "error", isLoading: false, autoClose: 1000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Failed to delete", type: "error", isLoading: false, autoClose: 1000 });
    }
  };

  // Export inventory to Excel
  const exportInventory = () => {
    const exportData = inventories.map((inv) => ({
      ProductTitle: inv.product_title,
      ProductID: inv.product_id?._id,
      SKU: inv.SKU,
      Quantity: inv.quantity,
      Location: inv.location,
    }));
    Export({ data: exportData });
  };

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteInventory}
        deleteItem={deleteItem}
      />
      <div className="p-5 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="page_title">Inventory</h1>
          <div className="flex gap-2">
            {/* <Link href="/inventory/add-inventory">
              <button className="btn2"><FaPlusCircle /> Add Inventory</button>
            </Link> */}
            <button className="btn2" onClick={exportInventory}><FaFileExcel /> Export</button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center border border-gray-300 p-1 px-2 w-64">
            <BsSearch className="text-gray-400" />
            <input
              type="text"
              className="bg-gray-50 w-full h-6 border-0 focus:ring-0 focus:border-0"
              placeholder="Search inventory..."
              onChange={(e) => filterInventory(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-50 uppercase font-light">
                <tr>
                  <th className="border py-2 px-4">#</th>
                  <th className="border py-2 px-4">Product Title</th>
                  <th className="border py-2 px-4">Product ID</th>
                  <th className="border py-2 px-4">Quantity</th>
                  <th className="border py-2 px-4">SKU</th>
                  <th className="border py-2 px-4">Location</th>
                  <th className="border py-2 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((inv, index) => (
                  <tr key={inv._id} className="bg-white border-b">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4 max-w-xs truncate" title={inv.product_title}>
                      {inv.product_title}
                    </td>
                    <td className="py-2 px-4">{inv.product_id?._id}</td>
                    <td className="py-2 px-4">
                      {inv.quantity === 0 ? (
                        <Badge color="failure">Out of Stock</Badge>
                      ) : inv.quantity < 5 ? (
                        <Badge color="warning">Low Stock ({inv.quantity})</Badge>
                      ) : (
                        <Badge color="success">{inv.quantity}</Badge>
                      )}
                    </td>
                    <td className="py-2 px-4">{inv.SKU}</td>
                    <td className="py-2 px-4">{inv.location}</td>

                    <td className="py-5 px-6 cursor-pointer">
                      <div className="flex gap-5 items-center">
                        <Link href={`/inventory/update-inventory/${inv._id}`}>
                          <span className="font-medium text-sm text-blue-700">EDIT</span>
                        </Link>
                        <FaTrash
                           onClick={() => { setDeleteItem(inv._id); setConfirmationModal(true); }}
                        />
                      </div>
                    </td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
