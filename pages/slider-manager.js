/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "flowbite-react";
import {
  RiAddCircleFill,
  RiCloseCircleLine,
  RiDeleteBin6Line,
  RiEdit2Fill,
} from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SliderManager() {
  const [sliders, setSliders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    image: null,
    link: "/shop",
    order: 1,
    sliderType: "desktop",
  });

  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Sliders
  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/slider/all");
      const data = await res.json();
      setSliders(data.sort((a, b) => a.order - b.order));
    } catch {
      toast.error("Failed to fetch sliders");
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Input Change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload / Update Slider
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.image && !isEditing)
      return toast.error("Please upload an image");

    const fd = new FormData();
    fd.append("link", formData.link);
    fd.append("order", formData.order);
    fd.append("sliderType", formData.sliderType);
    if (formData.image) fd.append("image", formData.image);

    setIsUploading(true);

    const apiURL = isEditing
      ? `/api/slider/update?id=${editId}`
      : `/api/slider/add`;

    const res = await fetch(apiURL, {
      method: "POST",
      body: fd,
    });

    const result = await res.json();
    setIsUploading(false);

    if (res.ok) {
      toast.success(isEditing ? "Updated Successfully ✨" : "Uploaded Successfully 🎉");
      closeModal();
      fetchSliders();
    } else toast.error(result.error || "Failed!");
  };

  // Edit Button
  const handleEdit = (slider) => {
    setIsEditing(true);
    setEditId(slider._id);
    setFormData({
      image: null,
      link: slider.link,
      order: slider.order,
      sliderType: slider.sliderType,
    });
    setPreview(slider.imageUrl);
    setOpenModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Confirm Delete?")) return;
    const res = await fetch(`/api/slider/delete?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Deleted Successfully");
      fetchSliders();
    }
  };

  // Order Update
  const handleOrderChange = async (id, order) => {
    await fetch(`/api/slider/updateOrder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, order: Number(order) }),
    });
    fetchSliders();
  };

  const closeModal = () => {
    setIsEditing(false);
    setEditId(null);
    setPreview(null);
    setFormData({ image: null, link: "/shop", order: 1, sliderType: "desktop" });
    setOpenModal(false);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎞 Slider Manager</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RiAddCircleFill size={22} /> Add Slider
        </button>
      </div>

      {/* 🎯 MODAL */}
      <Modal show={openModal} onClose={closeModal} size="lg" popup>
        <Modal.Header />
        <Modal.Body>
          <h2 className="text-lg font-semibold mb-4 text-center">
            {isEditing ? "Edit Slider" : "Upload New Slider"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">

            <div>
              <label>Select Image</label>
              {preview ? (
                <div className="relative">
                  <img src={preview} className="rounded-lg w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1"
                  >
                    <RiCloseCircleLine size={20} />
                  </button>
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={handleInputChange} className="border p-2 w-full rounded" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" name="link" value={formData.link} onChange={handleInputChange} placeholder="Redirect Link" />
              <input type="number" className="border p-2 rounded" name="order" value={formData.order} onChange={handleInputChange} />
            </div>

            <select name="sliderType" value={formData.sliderType} onChange={handleInputChange} className="border p-2 rounded w-full">
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>

            <button type="submit" className="bg-green-600 w-full rounded-lg text-white py-2">
              {isUploading ? "Saving..." : isEditing ? "Update Slider" : "Upload Slider"}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* DESKTOP LIST */}
      <h2 className="font-semibold text-lg mt-5 mb-2">Desktop Sliders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sliders.filter(s => s.sliderType === "desktop").map((s) => (
          <div key={s._id} className="bg-white p-3 rounded-lg shadow">
            <img src={s.imageUrl} className="h-40 w-full object-cover rounded" />

            <div className="flex justify-between items-center mt-2">
              <input type="number" value={s.order} className="border p-1 w-14" onChange={(e) => handleOrderChange(s._id, e.target.value)} />
              <span className="text-xs bg-blue-200 px-2 py-1 rounded">Desktop</span>

              <div className="flex gap-2">
                <button className="text-blue-600" onClick={() => handleEdit(s)}>
                  <RiEdit2Fill size={18} />
                </button>
                {/* <button className="text-red-600" onClick={() => handleDelete(s._id)}>
                  <RiDeleteBin6Line size={18} />
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE LIST */}
      <h2 className="font-semibold text-lg mt-8 mb-2">Mobile Sliders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sliders.filter(s => s.sliderType === "mobile").map((s) => (
          <div key={s._id} className="bg-white p-3 rounded-lg shadow">
            <img src={s.imageUrl} className="h-40 w-full object-cover rounded" />

            <div className="flex justify-between items-center mt-2">
              <input type="number" value={s.order} className="border p-1 w-14" onChange={(e) => handleOrderChange(s._id, e.target.value)} />
              <span className="text-xs bg-green-200 px-2 py-1 rounded">Mobile</span>

              <div className="flex gap-2">
                <button className="text-blue-600" onClick={() => handleEdit(s)}>
                  <RiEdit2Fill size={18} />
                </button>
                {/* <button className="text-red-600" onClick={() => handleDelete(s._id)}>
                  <RiDeleteBin6Line size={18} />
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
