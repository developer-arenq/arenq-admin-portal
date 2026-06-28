import main from "../../../database/conn";
import Product from "../../../model/productSchema";
import S3 from "aws-sdk/clients/s3";
import mime from "mime-types";
import nextConnect from "next-connect";
import multer from "multer";
import sharp from "sharp";

// ─── Multer ──────────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' not allowed` });
  },
});

apiRoute.use(
  upload.fields([
    { name: "image", maxCount: 10 },
    { name: "video", maxCount: 5 },
  ])
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArray(field) {
  return field
    ? field.split(",").map((i) => i.trim()).filter(Boolean)
    : [];
}

function parseLines(field) {
  return field
    ? field.split("\n").map((i) => i.trim()).filter(Boolean)
    : [];
}

function safeParseJSON(jsonString, field) {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new Error(`Invalid JSON in field "${field}"`);
  }
}

async function uploadBase64ImageToS3(base64Data, s3, bucket, slug) {
  const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 string");

  const buffer = Buffer.from(matches[2], "base64");

  const webpBuffer = await sharp(buffer)
    .resize(1200)
    .toFormat("webp", { quality: 80 })
    .toBuffer();

  const key = `${slug}.webp`;

  const data = await s3
    .upload({
      Bucket: bucket,
      Key: key,
      Body: webpBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000",
    })
    .promise();

  return data.Location;
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

apiRoute.patch(async (req, res) => {
  await main().catch((err) => console.error(err));

  const {
    id,
    name,
    slug: incomingSlug,
    desc,
    short_desc,
    long_description,
    application,
    series,
    model_number,
    overview,
    why_choose,
    comparison,

    // Pricing
    price,
    MRP,
    tax,

    // Category
    category_id,
    brand_id,
    subcat,

    // Labels / flags
    featured,
    label,
    active,
    out_of_stock,
    discount_id,

    // Media SEO
    alt_text,
    main_image,
    main_video,
    youtube_video,

    // Downloads
    datasheet,
    catalogue,
    manual,
    warranty,
    brochures,

    // Technical specs (flat)
    chemistry,
    cell_type,
    nominal_voltage,
    capacity,
    power,
    cycle_life,
    dod,
    max_cutoff_voltage,
    min_cutoff_voltage,
    charging_voltage,
    charging_current,
    discharging_current,
    working_temperature,
    storage_temperature,
    dimensions,
    weight,
    protection_level,
    balancing_current,
    communication,
    connector,

    // Feature arrays
    key_features,
    advantages,
    certifications,
    compatible_devices,
    applications,
    industries,

    // Content arrays
    installation,
    maintenance,
    safety,

    // Tags / FAQ
    tags,
    faq,

    // Counters
    purchase_count,
    wishlist_count,
    share_count,
    view_count,

    // JSON fields
    variants: variantsRaw,
    deletedImages: deletedImagesRaw,
    deletedVideos: deletedVideosRaw,
    seo,
    structured_data,
    SKU,
  } = req.body;

  // ── Required ────────────────────────────────────────────────────────────────
  if (!id) return res.status(400).json({ error: "Missing field: id" });
  if (!name) return res.status(400).json({ error: "Missing field: name" });

  // ── Parse JSON fields ───────────────────────────────────────────────────────
  let variants = [];
  let deletedImages = [];
  let deletedVideos = [];
  let seoData = {};
  let structuredDataObj = null;

  try {
    variants = safeParseJSON(variantsRaw, "variants");
    deletedImages = safeParseJSON(deletedImagesRaw, "deletedImages");
    deletedVideos = safeParseJSON(deletedVideosRaw, "deletedVideos");
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    if (seo) {
      seoData = JSON.parse(seo);
      if (seoData.keywords && !Array.isArray(seoData.keywords)) {
        seoData.keywords = String(seoData.keywords).split(",").map((k) => k.trim());
      }
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON in field 'seo'" });
  }

  try {
    if (structured_data) structuredDataObj = JSON.parse(structured_data);
  } catch {
    return res.status(400).json({ error: "Invalid JSON in field 'structured_data'" });
  }

  // ── Fetch existing product ──────────────────────────────────────────────────
  const existingProduct = await Product.findById(id);
  if (!existingProduct) return res.status(404).json({ error: "Product not found" });

  // ── Slug handling ───────────────────────────────────────────────────────────
  const newSlug = incomingSlug ? generateSlug(incomingSlug) : existingProduct.slug;
  let slug = existingProduct.slug;
  let oldSlugs = [...(existingProduct.oldSlugs || [])];

  if (newSlug && newSlug !== existingProduct.slug) {
    const slugExists = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
    if (slugExists) return res.status(400).json({ error: "Slug already exists" });
    slug = newSlug;
    if (!oldSlugs.includes(existingProduct.slug)) oldSlugs.push(existingProduct.slug);
  }

  // ── Auto canonical ──────────────────────────────────────────────────────────
  if (!seoData.canonical) {
    seoData.canonical = `https://www.arenq.co.in/products/${slug}`;
  }

  // ── Tax / booleans ──────────────────────────────────────────────────────────
  const numericTax = !isNaN(Number(tax)) ? Number(tax) : existingProduct.tax || 0;

  if (Array.isArray(variants) && variants.length > 0) {
    variants = variants.map((v) => ({ ...v, tax: numericTax }));
  }

  const parsedOutOfStock =
    out_of_stock !== undefined
      ? out_of_stock === true || out_of_stock === "true"
      : existingProduct.out_of_stock;

  const parsedActive =
    active !== undefined
      ? active === true || active === "true"
      : existingProduct.active;

  // ── S3 ──────────────────────────────────────────────────────────────────────
  const s3 = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  });
  const bucket = process.env.AWS_BUCKET_NAME;

  // ── Delete removed images ───────────────────────────────────────────────────
  let updatedImages = [...(existingProduct.images || [])];
  for (const img of deletedImages) {
    updatedImages = updatedImages.filter((i) => i !== img);
    if (img?.includes("amazonaws.com")) {
      const key = img.split("/").slice(3).join("/");
      await s3.deleteObject({ Bucket: bucket, Key: key }).promise().catch(console.error);
    }
  }

  // ── Delete removed videos ───────────────────────────────────────────────────
  let updatedVideos = [...(existingProduct.videos || [])];
  for (const vid of deletedVideos) {
    updatedVideos = updatedVideos.filter((v) => v !== vid);
    if (vid?.includes("amazonaws.com")) {
      const key = vid.split("/").slice(3).join("/");
      await s3.deleteObject({ Bucket: bucket, Key: key }).promise().catch(console.error);
    }
  }

  // ── Main image ──────────────────────────────────────────────────────────────
  let resolvedMainImage = existingProduct.main_image;

  if (typeof main_image === "string" && main_image.startsWith("data:image")) {
    try {
      if (existingProduct.main_image?.includes("amazonaws.com")) {
        const oldKey = existingProduct.main_image.split("/").slice(3).join("/");
        await s3.deleteObject({ Bucket: bucket, Key: oldKey }).promise().catch(console.error);
      }
      resolvedMainImage = await uploadBase64ImageToS3(main_image, s3, bucket, slug);
    } catch {
      return res.status(500).json({ error: "Main image upload failed" });
    }
  } else if (typeof main_image === "string" && main_image) {
    resolvedMainImage = main_image;
  }

  // ── Upload new images ───────────────────────────────────────────────────────
  let newImgs = [];
  if (req.files?.image?.length) {
    newImgs = await Promise.all(
      req.files.image.map(async (file) => {
        const buffer = await sharp(file.buffer)
          .resize(1200)
          .toFormat("webp", { quality: 80 })
          .toBuffer();

        const key = `${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;

        const uploaded = await s3
          .upload({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000",
          })
          .promise();

        return uploaded.Location;
      })
    );
  }

  // ── Upload new videos ───────────────────────────────────────────────────────
  let newVids = [];
  if (req.files?.video?.length) {
    newVids = await Promise.all(
      req.files.video.map(async (file) => {
        const contentType = mime.lookup(file.originalname) || "video/mp4";
        const key = `video-${slug}-${Date.now()}-${file.originalname}`;

        const uploaded = await s3
          .upload({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: contentType,
          })
          .promise();

        return uploaded.Location;
      })
    );
  }

  // ── Merge media ─────────────────────────────────────────────────────────────
  const finalImages = [...updatedImages, ...newImgs];
  const finalVideos = [...updatedVideos, ...newVids];

  // Put main image first
  if (resolvedMainImage) {
    const idx = finalImages.indexOf(resolvedMainImage);
    if (idx > -1) {
      const [main] = finalImages.splice(idx, 1);
      finalImages.unshift(main);
    }
  }

  // ── Build update payload ────────────────────────────────────────────────────
  const update = {
    // Basic
    name,
    slug,
    oldSlugs,
    desc: desc || existingProduct.desc,
    short_desc: short_desc || existingProduct.short_desc,
    long_description: long_description || existingProduct.long_description,
    application: application || existingProduct.application,
    series: series || existingProduct.series,
    model_number: model_number || existingProduct.model_number,
    overview: overview || existingProduct.overview,
    why_choose: why_choose || existingProduct.why_choose,
    comparison: comparison || existingProduct.comparison,

    // Pricing
    price: price !== undefined ? Number(price) : existingProduct.price,
    MRP: MRP !== undefined ? Number(MRP) : existingProduct.MRP,
    tax: numericTax,

    // Category
    category_id: category_id || existingProduct.category_id,
    brand_id: brand_id || existingProduct.brand_id,
    subcat: subcat || existingProduct.subcat,
    discount_id,

    // Labels / flags
    featured: featured !== undefined ? featured : existingProduct.featured,
    label: label !== undefined ? label : existingProduct.label,
    active: parsedActive,
    out_of_stock: parsedOutOfStock,

    // Media
    alt_text: alt_text || existingProduct.alt_text,
    main_image: resolvedMainImage,
    images: finalImages,
    videos: finalVideos,
    main_video: main_video || existingProduct.main_video,
    youtube_video: youtube_video !== undefined ? youtube_video : existingProduct.youtube_video,

    // Downloads
    datasheet: datasheet || existingProduct.datasheet,
    catalogue: catalogue || existingProduct.catalogue,
    manual: manual || existingProduct.manual,
    warranty: warranty || existingProduct.warranty,
    brochures: brochures ? parseArray(brochures) : existingProduct.brochures,

    // Technical specifications (nested)
    specifications: {
      ...(existingProduct.specifications?.toObject
        ? existingProduct.specifications.toObject()
        : Object.fromEntries(existingProduct.specifications || [])),
      ...(chemistry !== undefined && { chemistry }),
      ...(cell_type !== undefined && { cell_type }),
      ...(cycle_life !== undefined && { cycle_life }),
      ...(dod !== undefined && { dod }),
      ...(charging_current !== undefined && { charging_current }),
      ...(discharging_current !== undefined && { discharging_current }),
      ...(working_temperature !== undefined && { working_temperature }),
      ...(storage_temperature !== undefined && { storage_temperature }),
      ...(dimensions !== undefined && { dimensions }),
      ...(weight !== undefined && { weight }),
      ...(protection_level !== undefined && { protection_level }),
      ...(balancing_current !== undefined && { balancing_current }),
      ...(communication !== undefined && { communication }),
      ...(connector !== undefined && { connector }),
      ...(nominal_voltage !== undefined && { nominal_voltage: Number(nominal_voltage) }),
      ...(capacity !== undefined && { capacity: Number(capacity) }),
      ...(power !== undefined && { power: Number(power) }),
      ...(max_cutoff_voltage !== undefined && { max_cutoff_voltage: Number(max_cutoff_voltage) }),
      ...(min_cutoff_voltage !== undefined && { min_cutoff_voltage: Number(min_cutoff_voltage) }),
      ...(charging_voltage !== undefined && { charging_voltage: Number(charging_voltage) }),
    },

    // Feature arrays
    key_features: key_features ? parseArray(key_features) : existingProduct.key_features,
    advantages: advantages ? parseArray(advantages) : existingProduct.advantages,
    certifications: certifications ? parseArray(certifications) : existingProduct.certifications,
    compatible_devices: compatible_devices ? parseArray(compatible_devices) : existingProduct.compatible_devices,
    applications: applications ? parseArray(applications) : existingProduct.applications,
    industries: industries ? parseArray(industries) : existingProduct.industries,

    // Content arrays
    installation: installation ? parseLines(installation) : existingProduct.installation,
    maintenance: maintenance ? parseLines(maintenance) : existingProduct.maintenance,
    safety: safety ? parseLines(safety) : existingProduct.safety,

    // Tags / FAQ
    tags: tags ? parseArray(tags) : existingProduct.tags,
    faq: faq
      ? faq.split("\n").filter(Boolean).map((item) => {
        const parts = item.split("Ans.");
        return {
          question: parts[0].replace(/^Q\.?\s*/i, "").trim(),
          answer: parts[1] ? parts[1].trim() : "",
        };
      })
      : existingProduct.faq,

    // Counters
    purchase_count: purchase_count !== undefined ? Number(purchase_count) : existingProduct.purchase_count,
    wishlist_count: wishlist_count !== undefined ? Number(wishlist_count) : existingProduct.wishlist_count,
    share_count: share_count !== undefined ? Number(share_count) : existingProduct.share_count,
    view_count: view_count !== undefined ? Number(view_count) : existingProduct.view_count,

    // Variants
    ...(variants.length && { variants }),

    // SEO
    seo: { ...existingProduct.seo, ...seoData },

    // Structured data
    structured_data: {
      ...(structuredDataObj || {}),
      image: [resolvedMainImage],
      brand: structuredDataObj?.brand || "Arenq",
      sku: structuredDataObj?.sku || existingProduct.SKU,
      currency: "INR",
      availability: parsedOutOfStock ? "OutOfStock" : "InStock",
      price: price !== undefined ? Number(price) : existingProduct.price,
      ratingValue: existingProduct.rating || 0,
      reviewCount: existingProduct.review_count || 0,
      tax: numericTax,
    },
  };

  // Remove undefined values
  Object.keys(update).forEach((key) => {
    if (update[key] === undefined || update[key] === "undefined") delete update[key];
  });

  // ── Save ────────────────────────────────────────────────────────────────────
  try {
    const updated = await Product.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({
      message: "✅ Product updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: "Update failed", details: error.message });
  }
});

export default apiRoute;

export const config = {
  api: { bodyParser: false },
};