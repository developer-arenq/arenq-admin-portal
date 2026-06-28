/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { RiCloseCircleLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import TextEditor from "../../../components/textEditor";

export async function getServerSideProps({ query }) {
  const { product_id } = query;
  const [categoriesRes, prodRes, brandsRes] = await Promise.all([
    fetch(`${process.env.HOST}/api/categories/list`).then((res) => res.json()),
    fetch(`${process.env.HOST}/api/products/id/${product_id}`).then((res) => res.json()),
    fetch(`${process.env.HOST}/api/brand/all`).then((res) => res.json()),
  ]);

  return {
    props: {
      categories: categoriesRes.filter((c) => c.active),
      brands: brandsRes.filter((b) => b.active),
      prod: prodRes,
    },
  };
}

export default function ProductUpdate({ categories, brands, prod }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [product, setProduct] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imageArray, setImageArray] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoArray, setVideoArray] = useState([]);
  const [variants, setVariants] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVideos, setDeletedVideos] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catArray, setCatArray] = useState(categories);
  const [brandArray, setBrandArray] = useState(brands);
  const [documents, setDocuments] = useState({
    datasheet: null,
    catalogue: null,
    manual: null,
    warranty: null,
  });
  // ✅ SEO and structured data
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "",
    canonical: "",
  });

  const [structuredData, setStructuredData] = useState({
    brand: "Arenq",
    sku: "",
    currency: "INR",
    availability: "InStock",
    price: 0,
    ratingValue: 0,
    reviewCount: 0,
  });

  // ---------------- Initialize product ----------------
  useEffect(() => {
    if (prod) {
      setProduct({
        ...prod,

        short_desc:
          prod.short_desc || "",

        long_description:
          prod.long_description || "",



      });
      setImageArray(prod.images || []);
      setVideoArray(prod.videos || []);
      setVariants(prod.variants || []);
      if (prod.images && prod.images.length > 0) setMainImage(prod.images[0]);

      // Load SEO
      const seoData = prod.seo || {};
      setSeo({
        title: seoData.title || "",
        description: seoData.description || "",
        keywords: Array.isArray(seoData.keywords)
          ? seoData.keywords.join(", ")
          : seoData.keywords || "",
        canonical: seoData.canonical || "",
      });

      // Load structured data
      const sd = prod.structured_data || {};
      setStructuredData({
        brand: sd.brand || "Arenq",
        sku: sd.sku || prod.sku || "",
        currency: sd.currency || "INR",
        availability: sd.availability || "InStock",
        price: sd.price || prod.price || 0,
        ratingValue: sd.ratingValue || 0,
        reviewCount: sd.reviewCount || 0,
      });
    }

    setDocuments({
      datasheet: prod.datasheet || "",
      catalogue: prod.catalogue || "",
      manual: prod.manual || "",
      warranty: prod.warranty || "",
    });
  }, [prod]);

  // ---------------- Handle input changes ----------------
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files) {

      const validFiles = [];

      const validPreviews = [];

      Array.from(files).forEach((file) => {

        if (
          !file.type.startsWith("image/")
        ) {
          toast.error(
            `${file.name} is not an image`
          );

          return;
        }

        if (
          file.size >
          1024 * 1024 * 5
        ) {
          toast.error(
            `${file.name} exceeds 5MB`
          );

          return;
        }

        validFiles.push(file);

        validPreviews.push({
          image: file,
          base64:
            URL.createObjectURL(file),
        });
      });

      setImageFiles((prev) => [
        ...prev,
        ...validFiles,
      ]);

      setImageArray((prev) => [
        ...prev,
        ...validPreviews,
      ]);
    }
    else if (name === "video" && files) {

      const validFiles = [];

      const validPreviews = [];

      Array.from(files).forEach((file) => {

        if (
          !file.type.startsWith("video/")
        ) {
          toast.error(
            `${file.name} is not a video`
          );

          return;
        }

        if (
          file.size >
          1024 * 1024 * 50
        ) {
          toast.error(
            `${file.name} exceeds 50MB`
          );

          return;
        }

        validFiles.push(file);

        validPreviews.push({
          video: file,
          preview:
            URL.createObjectURL(file),
        });
      });

      setVideoFiles((prev) => [
        ...prev,
        ...validFiles,
      ]);

      setVideoArray((prev) => [
        ...prev,
        ...validPreviews,
      ]);
    }
    else if (["datasheet", "catalogue", "manual", "warranty"].includes(name)) {
      setDocuments((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
    else {

      let updated = {
        ...product,
        [name]: value,
      };

      //
      // 🔥 AUTO SLUG
      //
      if (name === "name") {

        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      setProduct(updated);
    }
  };

  useEffect(() => {

    return () => {

      imageArray.forEach((img) => {

        if (
          typeof img !== "string" &&
          img.base64
        ) {

          URL.revokeObjectURL(
            img.base64
          );
        }
      });

      videoArray.forEach((video) => {

        if (
          typeof video !== "string" &&
          video.preview
        ) {

          URL.revokeObjectURL(
            video.preview
          );
        }
      });

    };

  }, [imageArray, videoArray]);

  // ---------------- Handle image delete ----------------
  const handleImageDelete = (img, index) => {
    const newImages = imageArray.filter((i) => i !== img);
    setImageArray(newImages);
    if (typeof img === "string" && !img.startsWith("blob:")) {
      setDeletedImages((prev) => [...prev, img]);
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    if (
      mainImage ===
      (
        typeof img === "string"
          ? img
          : img.base64
      )
    )
      setMainImage(
        newImages[0]
          ? typeof newImages[0] ===
            "string"
            ? newImages[0]
            : newImages[0].base64
          : null
      );
  };

  const handleMainImageSelect =
    async (img) => {

      if (
        typeof img === "string"
      ) {

        setMainImage(img);

      } else {

        setMainImage(
          img.base64
        );
      }
    };



  // ---------------- Handle variants ----------------
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        model: "",
        voltage: "",
        capacity: "",
        price: "",
        MRP: "",
        stock: "",
        SKU: "",
      },
    ]);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // ---------------- Submit ----------------
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form_data = new FormData();
    if (
      imageArray.length > 0 &&
      !mainImage
    ) {

      toast.error(
        "Please select main image"
      );

      setLoading(false);

      return;
    }
    form_data.append("id", prod._id);
    form_data.append("name", product.name);
    form_data.append("desc", product.desc);
    form_data.append("slug", product.slug); // 👈 ADD THIS
    form_data.append("faq", product.faq);
    form_data.append("tags", product.tags);
    form_data.append("price", product.price);
    form_data.append("MRP", product.MRP);
    form_data.append("tax", product.tax);
    form_data.append("purchase_count", product.purchase_count);
    form_data.append("variants", JSON.stringify(variants));
    form_data.append("subcat", product.subcat);
    form_data.append("label", product.label);
    form_data.append("category_id", product.category_id);
    form_data.append("brand_id", product.brand_id);
    form_data.append("alt_text", product.alt_text);
    form_data.append("featured", product.featured);
    form_data.append("stock", product.stock);



    form_data.append("key_features", product.key_features || "");
    form_data.append("applications", product.applications || "");
    form_data.append("advantages", product.advantages || "");
    form_data.append("compatible_devices", product.compatible_devices || "");

    if (documents.datasheet)
      form_data.append("datasheet", documents.datasheet);

    if (documents.catalogue)
      form_data.append("catalogue", documents.catalogue);

    if (documents.manual)
      form_data.append("manual", documents.manual);

    if (documents.warranty)
      form_data.append("warranty", documents.warranty);
    //

    // 🔥 ADVANCED SEO
    //
    form_data.append(
      "short_desc",
      product.short_desc || ""
    );

    form_data.append(
      "long_description",
      product.long_description || ""
    );






    form_data.append("main_image", mainImage);
    form_data.append("deletedImages", JSON.stringify(deletedImages));
    form_data.append("deletedVideos", JSON.stringify(deletedVideos));

    // ✅ SEO + Structured Data
    form_data.append(
      "seo",
      JSON.stringify({
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        canonical: seo.canonical,
      })
    );
    form_data.append("structured_data", JSON.stringify(structuredData));

    imageFiles.forEach((file) => form_data.append("image", file));
    videoFiles.forEach((file) => form_data.append("video", file));

    const toastId = toast.loading("Please wait...");

    try {
      const response = await fetch("/api/products/update", {
        method: "PATCH",
        body: form_data,
        headers: { Authorization: `Bearer ${session?.user.accessToken}` },
      });
      const res = await response.json();

      if (response.ok) {
        toast.update(toastId, { render: res.message, type: "success", isLoading: false, autoClose: 1200 });
        setImageFiles([]);
        setImageArray([]);
        setVideoFiles([]);
        setVideoArray([]);
        setDeletedImages([]);
        setDeletedVideos([]);
        setMainImage(null);
        setVariants([]);
        router.back();
      } else {
        toast.update(toastId, { render: res.error, type: "error", isLoading: false, autoClose: 2000 });
      }
    } catch (err) {

      toast.update(toastId, {
        render:
          err.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    if (product.name) {

      setSeo((prev) => ({

        ...prev,

        title:
          prev.title ||
          `Buy ${product.name} Online`,

        canonical:
          prev.canonical ||
          `https://www.arenq.co.in/products/${product.slug}`,
      }));
    }

  }, [
    product.name,
    product.slug,
  ]);

  // ---------------- UI ----------------
  return (
    <div className="p-3 sm:p-5 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-medium mb-4">Update Product</h1>

      <form onSubmit={submitHandler}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT COLUMN */}
          <div className="p-2 space-y-4">
            {/* Description */}
            <div className="border p-4 sm:p-5 rounded-md">
              <label className="block mb-2 text-sm font-light">Product name</label>
              <input
                type="text"
                name="name"
                value={product.name || ""}
                onChange={handleInputChange}
                className="border-gray-300 rounded p-2 w-full"
              />
              <label className="block mt-4 mb-2 text-sm font-light">Description</label>
              <TextEditor prevDesc={prod.desc} setProduct={setProduct} product={product} />
            </div>
            {/* 🔥 ADVANCED PRODUCT SEO */}
            <div className="border p-4 sm:p-5 rounded-md">
              <h2 className="text-lg font-semibold mb-4">
                🚀 Advanced SEO
              </h2>

              <div className="space-y-4">

                <textarea
                  name="short_desc"
                  value={product.short_desc || ""}
                  onChange={handleInputChange}
                  placeholder="Short Description"
                  className="border-gray-300 rounded p-2 w-full"
                  rows={3}
                />

                <textarea
                  name="long_description"
                  value={product.long_description || ""}
                  onChange={handleInputChange}
                  placeholder="Long Description"
                  className="border-gray-300 rounded p-2 w-full"
                  rows={6}
                />






              </div>
            </div>




            <div className="border p-4 sm:p-5 rounded-md">
              <label className="block mb-2 text-sm font-medium">
                Brand
              </label>

              <select
                name="brand_id"
                value={
                  product.brand_id ||
                  brandArray?.[0]?._id ||
                  ""
                }
                onChange={handleInputChange}
                className="border-gray-300 rounded p-2 w-full"
              >
                {brandArray.map((brand) => (
                  <option
                    key={brand._id}
                    value={brand._id}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="border p-4 sm:p-5 rounded-md mt-4">
              <label className="block mb-2 text-sm font-medium">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={product.slug || ""}
                onChange={handleInputChange}
                placeholder="e.g. seabuckthorn-juice"
                className="border-gray-300 rounded p-2 w-full"
              />
            </div>

            {product.oldSlugs && product.oldSlugs.length > 0 && (
              <div className="border p-4 sm:p-5 rounded-md mt-4 bg-gray-50">
                <label className="block mb-2 text-sm font-medium">Old URLs</label>
                <div className="flex flex-wrap gap-2">
                  {product.oldSlugs.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-200 px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="border p-4 sm:p-5 rounded-md">
              <label className="block mb-2 text-sm font-medium">Category</label>
              <select
                name="category_id"
                value={
                  product.category_id ||
                  catArray?.[0]?._id ||
                  ""
                } onChange={handleInputChange}
                className="border-gray-300 rounded p-2 w-full"
              >
                {catArray.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>


            {/* ⭐ Featured */}
            <div className="bg-white border p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">🌟 Featured</h2>

              <select
                name="featured"
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2.5"
              >
                <option value="new_arrival">New Arrival</option>
                <option value="best_seller">Best Seller</option>
                <option value="top_deals">Top Deals</option>
                <option value="featured">Featured Product</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* 🏷️ Label */}
            <div className="bg-white border p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">🏷️ Label</h2>

              <select
                name="label"
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2.5"
              >
                <option value="new_launch">New Launch</option>
                <option value="best_seller">Best Seller</option>
                <option value="premium_quality">Premium Quality</option>
                <option value="hot_selling">Hot Selling</option>
                <option value="limited_stock">Limited Stock</option>
                <option value="none">None</option>
              </select>
            </div>


            {/* SEO */}
            <div className="border p-4 sm:p-5 rounded-md">
              <h2 className="font-semibold mb-3">SEO Settings</h2>
              <input
                type="text"
                value={seo.title}
                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                placeholder="SEO Title"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />
              <textarea
                value={seo.description}
                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                placeholder="SEO Description"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                placeholder="Keywords (comma separated)"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />

              <input
                type="text"
                value={seo.canonical}
                onChange={(e) =>
                  setSeo({
                    ...seo,
                    canonical: e.target.value,
                  })
                }
                placeholder="Canonical URL"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />


            </div>



            {/* Product Features */}

            <div className="border p-5 rounded-xl shadow-sm bg-white mt-6">
              <h2 className="text-lg font-semibold mb-5">
                ⭐ Product Features
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Key Features
                  </label>
                  <textarea
                    name="key_features"
                    rows={3}
                    value={product.key_features || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Applications
                  </label>
                  <textarea
                    name="applications"
                    rows={3}
                    value={product.applications || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Advantages
                  </label>
                  <textarea
                    name="advantages"
                    rows={3}
                    value={product.advantages || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Compatible Devices
                  </label>
                  <textarea
                    name="compatible_devices"
                    rows={3}
                    value={product.compatible_devices || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

              </div>
            </div>



            {/* Structured Data */}
            <div className="border p-4 sm:p-5 rounded-md">
              <h2 className="font-semibold mb-3">Structured Data</h2>
              <input
                type="text"
                value={structuredData.brand}
                onChange={(e) => setStructuredData({ ...structuredData, brand: e.target.value })}
                placeholder="Brand"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />
              <input
                type="text"
                value={structuredData.sku}
                onChange={(e) => setStructuredData({ ...structuredData, sku: e.target.value })}
                placeholder="SKU"
                className="border-gray-300 p-2 rounded w-full mb-3"
              />
              <input
                type="number"
                step="0.01"
                value={structuredData.price}
                onChange={(e) => setStructuredData({ ...structuredData, price: e.target.value })}
                placeholder="Price"
                className="border-gray-300 p-2 rounded w-full"
              />
            </div>



          </div>

          {/* RIGHT COLUMN */}
          <div className="p-2 space-y-4">
            {/* Images */}
            <div className="border p-4 sm:p-5 rounded-md">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">  Images (MAX. 5MB)</p>
                </div>
                <input
                  id="image"
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  multiple
                  className="hidden"
                  accept="image/*"
                />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {imageArray.map((x, idx) => (
                  <div className="relative" key={idx}>
                    <span
                      className="absolute right-1 top-1 z-10 text-white text-xl bg-red-500 border border-gray-500 rounded-md cursor-pointer p-0.5"
                      onClick={() => handleImageDelete(x, idx)}
                    >
                      <RiCloseCircleLine />
                    </span>
                    <img
                      src={
                        typeof x === "string"
                          ? x
                          : x.base64
                      }
                      alt=""
                      className="object-cover rounded w-full h-28 sm:h-32"
                    />
                    <div className="flex items-center justify-center mt-1">
                      <input
                        type="checkbox"
                        checked={
                          mainImage ===
                          (
                            typeof x === "string"
                              ? x
                              : x.base64
                          )
                        }
                        onChange={() => handleMainImageSelect(x, idx)}
                      />
                      <span className="ml-2 text-xs sm:text-sm">Set as Main Image</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ALT Text */}
            <div className="border p-4 sm:p-5 rounded-md">
              <h1 className="mb-3 font-medium">ALT text</h1>
              <input
                type="text"
                id="alt_text"
                name="alt_text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                onChange={handleInputChange}
                value={product.alt_text || ""}
              />
            </div>

            <div className="border p-5 rounded-xl shadow-sm bg-white">
              <h2 className="text-lg font-semibold mb-5">
                📄 Product Documents
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Datasheet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datasheet (PDF)
                  </label>

                  <input
                    type="file"
                    name="datasheet"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:bg-green-600 file:text-white
        hover:file:bg-green-700"
                  />

                  {prod.datasheet && (
                    <a
                      href={prod.datasheet}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View Datasheet
                    </a>
                  )}
                </div>

                {/* Catalogue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catalogue (PDF)
                  </label>

                  <input
                    type="file"
                    name="catalogue"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:bg-green-600 file:text-white
        hover:file:bg-green-700"
                  />

                  {prod.catalogue && (
                    <a
                      href={prod.catalogue}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View Catalogue
                    </a>
                  )}
                </div>

                {/* Manual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Manual (PDF)
                  </label>

                  <input
                    type="file"
                    name="manual"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:bg-green-600 file:text-white
        hover:file:bg-green-700"
                  />

                  {prod.manual && (
                    <a
                      href={prod.manual}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View Manual
                    </a>
                  )}
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Card (PDF)
                  </label>

                  <input
                    type="file"
                    name="warranty"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:bg-green-600 file:text-white
        hover:file:bg-green-700"
                  />

                  {prod.warranty && (
                    <a
                      href={prod.warranty}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      View Warranty
                    </a>
                  )}
                </div>

              </div>
            </div>



            {/* Videos */}
            <div className="border p-4 sm:p-5 rounded-md">

              {/* 🔥 VIDEO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {videoArray.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No videos uploaded
                  </p>
                )}

                {videoArray.map((src, idx) => (
                  <div key={idx} className="relative">

                    {/* 🔥 DELETE BUTTON */}
                    <span
                      className="absolute right-1 top-1 z-10 text-white text-xl bg-red-500 border border-gray-500 rounded-md cursor-pointer p-0.5"
                      onClick={() => {

                        const video =
                          videoArray[idx];

                        //
                        // 🔥 STORE OLD VIDEOS
                        //
                        if (
                          typeof video === "string" &&
                          !video.startsWith("blob:")
                        ) {

                          setDeletedVideos(
                            (prev) => [
                              ...prev,
                              video,
                            ]
                          );
                        }

                        //
                        // 🔥 REMOVE VIDEO PREVIEW
                        //
                        setVideoArray(
                          videoArray.filter(
                            (_, i) => i !== idx
                          )
                        );

                        //
                        // 🔥 REMOVE FILE
                        //
                        setVideoFiles(
                          videoFiles.filter(
                            (_, i) => i !== idx
                          )
                        );
                      }}
                    >
                      <RiCloseCircleLine />
                    </span>

                    {/* 🔥 VIDEO */}
                    <video
                      controls
                      className="w-full h-40 sm:h-48 object-cover rounded"
                    >
                      <source
                        src={
                          typeof src === "string"
                            ? src
                            : src.preview
                        }
                      />
                    </video>
                  </div>
                ))}
              </div>

              {/* 🔥 VIDEO UPLOAD BOX */}
              <div className="flex items-center justify-center w-full h-52 border-2 border-dashed rounded-lg mt-4 bg-gray-50 hover:bg-gray-100 transition">

                <label
                  htmlFor="video"
                  className="cursor-pointer text-sm text-gray-500 flex flex-col items-center"
                >

                  <span className="text-base font-medium">
                    Click to upload videos
                  </span>

                  <span className="text-xs text-gray-400 mt-1">
                    Videos (MAX. 50MB)
                  </span>

                </label>

                <input
                  id="video"
                  type="file"
                  name="video"
                  accept="video/*"
                  multiple
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            </div>




            <div className="border p-4 sm:p-5 rounded-md">
              <h2 className="font-semibold mb-3">SEO  Data</h2>

              <div className="mb-4">
                <label htmlFor="faq" className="block mb-2 text-sm font-light text-gray-900">
                  FAQ
                </label>

                <textarea
                  name="faq"
                  value={product.faq || ""}
                  onChange={handleInputChange}
                  placeholder="FAQ"
                  className="border-gray-300 rounded p-2 w-full"
                  rows={5}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="tags" className="block mb-2 text-sm font-light text-gray-900">
                  Tags
                </label>
                <textarea
                  name="tags"
                  value={product.tags || ""}
                  onChange={handleInputChange}
                  placeholder="Tags"
                  className="border-gray-300 rounded p-2 w-full"
                  rows={5}
                />
              </div>




              <div>
                <label htmlFor="subcat" className="block mb-2 text-sm font-light text-gray-900">
                  Subcategory
                </label>
                <input
                  type="text"
                  id="subcat"
                  name="subcat"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                  onChange={handleInputChange}
                  value={product.subcat || ""}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm mb-2">Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  value={product.stock || ""}
                />
              </div>
            </div>
            {/* Pricing */}
            <div className="border p-4 sm:p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  name="MRP"
                  onChange={handleInputChange}
                  value={product.MRP || ""}
                  placeholder="MRP"
                  className="border-gray-300 rounded-lg p-2 w-full"
                />
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  onChange={handleInputChange}
                  value={product.price || ""}
                  placeholder="Discounted Price"
                  className="border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>



            {/* ⚙️ Variants */}
            <div className="bg-white border p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">⚙️ Battery Variants</h2>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    <input
                      type="number"
                      name="MRP"
                      placeholder="MRP"
                      value={variant.MRP}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />


                    <input
                      type="text"
                      name="model"
                      placeholder="Model"
                      value={variant.model}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />

                    <input
                      type="text"
                      name="voltage"
                      placeholder="Voltage (Ex. 48V)"
                      value={variant.voltage}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />

                    <input
                      type="text"
                      name="capacity"
                      placeholder="Capacity (Ex. 100Ah)"
                      value={variant.capacity}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />



                    <input
                      type="text"
                      name="sku"
                      placeholder="sku"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />

                    <input
                      type="number"
                      name="stock"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="p-2 border rounded"
                    />

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <RiCloseCircleLine size={22} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Variant
                </button>
              </div>
            </div>


            <div className="border p-4 sm:p-5 rounded-md">
              <label
                htmlFor="tax"
                className="block mb-2 text-sm font-light text-gray-900"
              >
                Tax
              </label>
              <input
                type="number"
                id="tax"
                step="0.01"
                min="0"
                name="tax"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                onChange={handleInputChange}
                value={product.tax || ""}
                placeholder="Tax 5%"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md text-sm transition disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Product"}
          </button>
        </div>
      </form>
    </div>

  );
}
