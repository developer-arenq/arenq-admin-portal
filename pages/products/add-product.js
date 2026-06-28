/* eslint-disable @next/next/no-img-element */

import { RiCloseCircleLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import FormData from "form-data";
import { toast } from "react-toastify";
import { subcategories } from '../../public/data/subcatData'
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const [category, brand] = await Promise.all([
    fetch(`${process.env.HOST}/api/categories/list`),
    fetch(`${process.env.HOST}/api/brand/all`),
  ]);

  const [category_res, brand_res] = await Promise.all([
    category.json(),
    brand.json(),
  ]);

  return {
    props: {
      categories: category_res.filter((item) => item.active == true),
      brands: brand_res.filter((item) => item.active == true),
    },
  };
}

export default function Home({ categories, brands }) {
  const [product, setProduct] = useState({});
  const [imageArray, setImageArray] = useState([]);
  const [image, setImage] = useState([]);
  const [catArray, setCatArray] = useState(categories);
  const [brandArray, setBrandArray] = useState(brands);
  const [mainImage, setMainImage] = useState();
  const [filename, setfilname] = useState(null);
  const [variants, setVariants] = useState([]);
  const [videoArray, setVideoArray] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "",
    canonical: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "image") {
      let uploadFile = [...image];
      Array.from(e.target.files).forEach((file) => {

        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          return;
        }

        if (file.size > 1024 * 1024 * 5) {
          toast.error(`${file.name} exceeds 5MB`);
          return;
        }

        uploadFile.push({ image: file });
        const fileName = file.name;
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
          setImageArray((old) => [...old, { base64: e.target.result, name: fileName }]);
        };
        fileReader.readAsDataURL(file);
      });
      setImage(uploadFile);
    }

    // ✅ Handle video upload
    else if (name === "video") {
      let uploadVideos = [...videoFiles];
      Array.from(e.target.files).forEach((file) => {
        if (!file.type.startsWith("video/")) {
          toast.error(`${file.name} is not a video`);
          return;
        }

        if (file.size > 1024 * 1024 * 50) {
          toast.error(`${file.name} exceeds 50MB`);
          return;
        }
        uploadVideos.push({ video: file });
        const fileName = file.name;
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
          setVideoArray((old) => [...old, { base64: e.target.result, name: fileName }]);
        };
        fileReader.readAsDataURL(file);
      });
      setVideoFiles(uploadVideos);
    }

    else if (
      ["datasheet", "catalogue", "manual", "warranty"].includes(name)
    ) {
      setProduct((prev) => ({
        ...prev,
        [name]: e.target.files[0],
      }));
    }
    // ✅ Handle other product fields
    else {
      setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
    }


  };




  // Add a function to handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    files.forEach((file) => {

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      if (file.size > 1024 * 1024 * 5) {
        toast.error(`${file.name} exceeds 5MB`);
        return;
      }

      const fileName = file.name;
      let fileReader = new FileReader();
      fileReader.onload = function (e) {
        setImageArray((old) => [...old, { base64: e.target.result, name: fileName }]);
      };
      fileReader.readAsDataURL(file);
      setImage((prev) => [
        ...prev,
        { image: file },
      ]);
    });
  };


  const handleVariantChange = (index, e) => {
    const updated = [...variants];
    updated[index][e.target.name] = e.target.value;
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
    setVariants(variants.filter((_, i) => i !== index));
  };


  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    //
    // 🔥 MAIN IMAGE VALIDATION
    //
    if (
      image.length > 0 &&
      !mainImage
    ) {
      toast.error(
        "Please select main image"
      );

      setLoading(false);

      return;
    }

    try {

      //
      // 🔥 FORM DATA
      //
      const form_data = new FormData();

      form_data.append(
        "name",
        product.name || ""
      );

      form_data.append(
        "desc",
        product.desc || ""
      );

      form_data.append(
        "faq",
        product.faq || ""
      );

      form_data.append(
        "subcat",
        product.subcat || ""
      );

      form_data.append(
        "label",
        product.label || ""
      );

      form_data.append(
        "price",
        product.price || ""
      );



      form_data.append(
        "MRP",
        product.MRP || ""
      );

      form_data.append(
        "tax",
        product.tax || ""
      );
      form_data.append(
        "stock",
        product.stock || ""
      );



      //
      // 🔥 BASIC SEO
      //


      form_data.append(
        "short_desc",
        product.short_desc || ""
      );

      form_data.append(
        "long_description",
        product.long_description || ""
      );

      form_data.append(
        "internal_links",
        product.internal_links || ""
      );

      form_data.append(
        "related_blogs",
        product.related_blogs || ""
      );




      //
      // 🔥 AI SEO
      //
      form_data.append(
        "ai_overview_content",
        product.ai_overview_content || ""
      );





      form_data.append(
        "alt_text",
        product.alt_text || ""
      );




      //
      // 🔥 CATEGORY / BRAND
      //
      form_data.append(
        "category_id",
        product.category_id
          ? product.category_id
          : catArray[0]?._id
      );

      form_data.append(
        "brand_id",
        product.brand_id
          ? product.brand_id
          : brandArray[0]?._id
      );

      //
      // 🔥 VARIANTS
      //
      form_data.append(
        "variants",
        JSON.stringify(variants)
      );

      form_data.append(
        "key_features",
        product.key_features || ""
      );

      form_data.append(
        "applications",
        product.applications || ""
      );

      form_data.append(
        "advantages",
        product.advantages || ""
      );

      form_data.append(
        "compatible_devices",
        product.compatible_devices || ""
      );

      //
      // 🔥 TAGS
      //
      form_data.append(
        "tags",
        product.tags || ""
      );

      //
      // 🔥 FEATURED
      //
      form_data.append(
        "featured",
        product.featured
          ? product.featured
          : "new_arrival"
      );

      //
      // 🔥 MAIN IMAGE
      //
      form_data.append(
        "main_image",
        filename || ""
      );

      //
      // 🔥 IMAGES
      //
      image.forEach((x) => {
        form_data.append(
          "image",
          x.image
        );
      });

      //
      // 🔥 VIDEOS
      //
      videoFiles.forEach((v) => {
        form_data.append(
          "videos",
          v.video
        );
      });

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

      form_data.append("power", product.power || "");
      form_data.append("nominal_voltage", product.nominal_voltage || "");
      form_data.append("capacity", product.capacity || "");
      form_data.append("cycle_life", product.cycle_life || "");
      form_data.append("charging_voltage", product.charging_voltage || "");
      form_data.append("charging_current", product.charging_current || "");
      form_data.append("discharging_current", product.discharging_current || "");
      form_data.append("dimensions", product.dimensions || "");
      form_data.append("weight", product.weight || "");
      form_data.append("connector", product.connector || "");


      //
      // 🔥 MAIN VIDEO
      //
      if (mainVideo?.filename) {
        form_data.append(
          "main_video",
          mainVideo.filename
        );
      }

      if (product.datasheet)
        form_data.append("datasheet", product.datasheet);

      if (product.catalogue)
        form_data.append("catalogue", product.catalogue);

      if (product.manual)
        form_data.append("manual", product.manual);

      if (product.warranty)
        form_data.append("warranty", product.warranty);

      //
      // 🔥 LOADING TOAST
      //
      const id = toast.loading(
        "Please wait..."
      );

      //
      // 🔥 API CALL
      //
      const response = await fetch(
        `/api/products/create`,
        {
          method: "POST",
          body: form_data,
        }
      );

      const res = await response.json();

      //
      // 🔥 ERROR
      //
      if (res.error) {

        toast.update(id, {
          render: res.error,
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });

      } else {

        //
        // 🔥 SUCCESS
        //
        toast.update(id, {
          render:
            "Product successfully added",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });

        //
        // 🔥 RESET
        //
        setImage([]);
        setImageArray([]);
        setVideoArray([]);
        setVideoFiles([]);
        setVariants([]);
        setMainImage(null);
        setMainVideo(null);

        //
        // 🔥 RESET FORM
        //
        e.target.reset();

        //
        // 🔥 REDIRECT
        //
        setTimeout(() => {
          router.push("/products");
        }, 1200);
      }

    } catch (err) {

      console.error(err);

      toast.error(
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleMainImageSelect = (selectedImage) => {
    setfilname(selectedImage.filename);
    setMainImage(selectedImage);
  };



  return (
    <>
      <div className="p-5 min-h-screen">
        <div className="">
          {/* title */}
          <h1 className="text-xl font-medium">Add Products</h1>

          <div className="overflow-x-auto relative my-4"></div>
          <form className="form" onSubmit={submitHandler}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* 📝 Description */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">📝 Description</h2>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        onChange={handleInputChange}
                        required
                        minLength={1}
                        maxLength={150}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="desc"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Product Description
                      </label>
                      <textarea
                        id="desc"
                        name="desc"
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Short Description
                      </label>

                      <textarea
                        name="short_desc"
                        rows="2"
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Long Description
                      </label>

                      <textarea
                        name="long_description"
                        rows="8"
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 📂 Category */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">📂 Category</h2>
                  <select
                    name="category_id"
                    id="category_id"
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                  >
                    {catArray.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🏷️ Brand */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">🏷️ Brand</h2>
                  <select
                    name="brand_id"
                    id="brand_id"
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                  >
                    {brandArray.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

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


                {/* ❓ FAQ */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">❓ FAQ</h2>
                  <textarea
                    id="faq"
                    name="faq"
                    rows="4"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                  ></textarea>
                </div>

                {/* 🏷️ Tags */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">🏷️ Tags</h2>
                  <textarea
                    id="tags"
                    name="tags"
                    rows="2"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                  ></textarea>
                </div>


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

                <div className="bg-white border p-5 rounded-xl shadow-sm">

                  <h2 className="text-lg font-semibold mb-4">
                    ⭐ Product Features
                  </h2>

                  <textarea
                    name="key_features"
                    placeholder="Feature 1, Feature2..."
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded mb-3"
                  />

                  <textarea
                    name="applications"
                    placeholder="Applications"
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded mb-3"
                  />

                  <textarea
                    name="advantages"
                    placeholder="Advantages"
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded mb-3"
                  />

                  <textarea
                    name="compatible_devices"
                    placeholder="Compatible Devices"
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />

                </div>





              </div>


              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* 🖼️ Images */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">🖼️ Product Images</h2>

                  {imageArray.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageArray.map((x, idx) => (
                          <div key={idx} className="relative group border rounded-lg p-2 bg-gray-50">
                            {/* ❌ Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setImageArray(imageArray.filter((_, i) => i !== idx));
                                setImage(image.filter((_, i) => i !== idx));
                                if (mainImage?.index === idx) setMainImage(null);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                            >
                              <RiCloseCircleLine size={18} />
                            </button>

                            {/* 🖼️ Image Preview */}
                            <img
                              src={x.base64}
                              alt={x.name || `Image ${idx + 1}`}
                              className={`w-full h-28 object-cover rounded-md border-2 transition ${mainImage?.index === idx
                                ? "border-green-500 shadow-md"
                                : "border-transparent"
                                }`}
                            />

                            {/* 🌟 Set as Main Image */}
                            <div className="flex items-center justify-center mt-2">
                              <input
                                type="radio"
                                id={`main-${idx}`}
                                name="mainImage"
                                checked={mainImage?.index === idx}
                                onChange={() =>
                                  handleMainImageSelect({
                                    url: x.base64,
                                    index: idx,
                                    filename: x.name,
                                  })
                                }
                                className="cursor-pointer text-green-600 focus:ring-green-500"
                              />
                              <label
                                htmlFor={`main-${idx}`}
                                className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                              >
                                {mainImage?.index === idx ? "✅ Main Image" : "Set as Main"}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 🟩 Show Currently Selected Main Image */}
                      {mainImage?.url && (
                        <div className="mt-5 p-3 border rounded-md bg-gray-50">
                          <p className="font-medium mb-2">Main Image Preview:</p>
                          <img
                            src={mainImage.url}
                            alt="Main"
                            className="object-contain h-40 w-full rounded-md"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <label
                      htmlFor="image"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <p className="text-sm text-gray-600 mb-1">Click or drag & drop files</p>
                      <p className="text-xs text-gray-500">JPG, PNG, or GIF (Max. 1MB)</p>
                      <input
                        id="image"
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
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
                    </div>

                  </div>
                </div>



                {/* 🏷️ ALT Text */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">🏷️ ALT Text</h2>
                  <input
                    type="text"
                    id="alt_text"
                    name="alt_text"
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-400"
                  />
                </div>


                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">
                    ⚡ Technical Specifications
                  </h2>

                  <div className="grid grid-cols-2 gap-4">

                    <input name="power" placeholder="Power" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="nominal_voltage" placeholder="Nominal Voltage" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="capacity" placeholder="Capacity" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="cycle_life" placeholder="Cycle Life" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="charging_voltage" placeholder="Charging Voltage" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="charging_current" placeholder="Charging Current" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="discharging_current" placeholder="Discharging Current" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="dimensions" placeholder="Dimensions" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="weight" placeholder="Weight" onChange={handleInputChange} className="border p-2 rounded" />

                    <input name="connector" placeholder="Connector" onChange={handleInputChange} className="border p-2 rounded" />

                  </div>

                </div>

                {/* 🎥 Videos */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">🎥 Product Videos</h2>

                  {videoArray.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videoArray.map((vid, idx) => (
                        <div key={idx} className="relative">
                          {/* ❌ Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              setVideoArray(videoArray.filter((_, i) => i !== idx));
                              setVideoFiles(videoFiles.filter((_, i) => i !== idx));
                              if (mainVideo?.index === idx) setMainVideo(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <RiCloseCircleLine size={18} />
                          </button>

                          <video
                            src={vid.base64}
                            controls
                            className={`w-full h-40 object-cover rounded-md border-2 ${mainVideo?.index === idx ? "border-green-500" : "border-transparent"
                              }`}
                          />

                          {/* 🌟 Set Main Video */}
                          <div className="flex items-center justify-center mt-2">
                            <input
                              type="radio"
                              id={`mainVideo-${idx}`}
                              name="mainVideo"
                              checked={mainVideo?.index === idx}
                              onChange={() =>
                                setMainVideo({ url: vid.base64, index: idx, filename: vid.name })
                              }
                              className="cursor-pointer text-green-600 focus:ring-green-500"
                            />
                            <label
                              htmlFor={`mainVideo-${idx}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer"
                            >
                              {mainVideo?.index === idx ? "✅ Main Video" : "Set as Main"}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label
                      htmlFor="video"
                      className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <p className="text-sm text-gray-600 mb-1">Click or drag & drop to upload</p>
                      <p className="text-xs text-gray-500">MP4, WebM (Max. 50MB)</p>
                      <input
                        id="video"
                        type="file"
                        name="video"
                        accept="video/*"
                        multiple
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>










                {/* 💰 Pricing */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">💰 Pricing</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="number"
                      id="MRP"
                      name="MRP"
                      placeholder="MRP"
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2.5 text-sm"
                    />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Discounted Price"
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg p-2.5 text-sm"
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



                        {/* <input
                          type="text"
                          name="SKU"
                          placeholder="SKU"
                          value={variant.SKU}
                          onChange={(e) => handleVariantChange(index, e)}
                          className="p-2 border rounded"
                        /> */}

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

                {/* 📦 Battery Type */}
                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">📦 Battery Type</h2>

                  <select
                    name="subcat"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Select Battery Type</option>

                    <option value="Lithium Iron Phosphate (LiFePO4)">
                      Lithium Iron Phosphate (LiFePO4)
                    </option>

                    <option value="Lithium Ion">
                      Lithium Ion
                    </option>

                    <option value="Lead Acid">
                      Lead Acid
                    </option>

                    <option value="Tubular Battery">
                      Tubular Battery
                    </option>

                    <option value="Gel Battery">
                      Gel Battery
                    </option>
                  </select>


                    <div className="mt-4">
                    <label className="block text-sm mb-2">Stock</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      placeholder="Stock"
                    />
                  </div>
                </div>

                <div className="bg-white border p-5 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Tax</h2>

                  <div className="mt-4">
                    <label className="block text-sm mb-2">Tax</label>
                    <input
                      type="number"
                      id="tax"
                      name="tax"
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                      placeholder="Tax 5%"
                    />
                  </div>

                

                </div>
                {/* ✅ Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md text-sm transition disabled:opacity-50"
                  >
                    {loading ? "Uploading..." : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}

