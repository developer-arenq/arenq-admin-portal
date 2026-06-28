import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export async function getServerSideProps({ query }) {
  const { id } = query;
  const inventory = await fetch(`${process.env.HOST}/api/inventory/${id}`).then((res) => res.json());
  return { props: { inventory } };
}

export default function UpdateInventory({ inventory }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    product_title: "",
    SKU: "",
    quantity: 0,
    location: "Main Warehouse",
  });

  useEffect(() => {
    if (inventory) {
      setFormData({
        product_title: inventory.product_title || "",
        SKU: inventory.SKU || "",
        quantity: inventory.quantity || 0,
        location: inventory.location || "Main Warehouse",
      });
    }
  }, [inventory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "quantity" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating inventory...");

    try {
      const res = await fetch(`/api/inventory/${inventory._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.update(toastId, { render: data.message, type: "success", isLoading: false, autoClose: 1000 });
        router.push("/inventory");
      } else {
        toast.update(toastId, { render: data.error || "Update failed", type: "error", isLoading: false, autoClose: 1000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Server error", type: "error", isLoading: false, autoClose: 1000 });
    }
  };

  return (
    <div className="p-5 min-h-screen">
      <h1 className="text-xl font-medium mb-5">Update Inventory</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-2 border rounded-md">
            <label className="block mb-2 font-medium">Product Title</label>
            <input
              type="text"
              name="product_title"
              value={formData.product_title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              readOnly
            />
          </div>

          <div className="p-2 border rounded-md">
            <label className="block mb-2 font-medium">SKU</label>
            <input
              type="text"
              name="SKU"
              value={formData.SKU}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              readOnly
            />
          </div>

          <div className="p-2 border rounded-md">
            <label className="block mb-2 font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              min={0}
            />
          </div>

          <div className="p-2 border rounded-md">
            <label className="block mb-2 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button className="btn2" type="submit">
            Update Inventory
          </button>
        </div>
      </form>
    </div>
  );
}
