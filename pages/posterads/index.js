/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PosterAds = () => {
  const { status, data: session } = useSession();
  const [formData, setFormData] = useState({
    subject: "",
    heading: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Handle Input and Image Upload
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          image: {
            base64: reader.result,
            name: file.name,
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Submit Handler
  const submitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    toast.info("Sending Ad...", { autoClose: 1500 });

    const payload = {
      ...formData,
      image: formData.image?.base64 || "",
    };

    try {
      const res = await fetch("/api/posterads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Ad sent successfully 🎉");
        resetForm();
      } else {
        toast.error("Failed to send ad: " + (result.error || result.message));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      subject: "",
      heading: "",
      image: null,
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-100">
      <ToastContainer />

      {/* 🔹 Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          🖼️ Create & Send Poster Ads
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Upload promotional ads with a heading and subject.
        </p>
      </div>

      {/* 🔹 Form */}
      <form
        onSubmit={submitHandler}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left Side - Form Inputs */}
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter ad subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter ad heading"
              />
            </div>
          </div>

          {/* Right Side - Image Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            {formData.image ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: null }))
                  }
                  className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full p-1 text-xl shadow hover:scale-110 transition"
                >
                  <RiCloseCircleLine />
                </button>
                <img
                  src={formData.image.base64}
                  alt={formData.image.name}
                  className="rounded-lg w-44 h-44 sm:w-52 sm:h-52 object-cover"
                />
                <p className="text-gray-500 text-xs mt-2">
                  {formData.image.name}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2 text-sm sm:text-base">
                  Upload Ad Image
                </p>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="text-sm sm:text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-lg text-white font-medium text-sm sm:text-base transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Ad"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PosterAds;
