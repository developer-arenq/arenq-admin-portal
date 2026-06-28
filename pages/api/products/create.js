import main from "../../../database/conn";
import Product from "../../../model/productSchema";
import S3 from "aws-sdk/clients/s3";
import nextConnect from "next-connect";
import multer from "multer";
import sharp from "sharp";
 import AWS from "aws-sdk";
 
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(
  upload.fields([
    { name: "image", maxCount: 10 },
    { name: "videos", maxCount: 5 },

    { name: "datasheet", maxCount: 1 },
    { name: "catalogue", maxCount: 1 },
    { name: "manual", maxCount: 1 },
    { name: "warranty", maxCount: 1 },
  ])
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text) {
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

// ─── POST ────────────────────────────────────────────────────────────────────

apiRoute.post(async (req, res) => {
  await main().catch((err) => console.error(err));

  try {
    const {
      // Basic
      name,
      desc,
      short_desc,
      long_description,

      // Pricing
      price,
      MRP,
      tax,

      // Category
      category_id,
      brand_id,
      subcat,

      // Media
      alt_text,
      featured,
      label,

      // Technical Specifications
      power,
      nominal_voltage,
      capacity,
      cycle_life,
      charging_voltage,
      charging_current,
      discharging_current,
      dimensions,
      weight,
      connector,

      // Features
      key_features,
      applications,
      advantages,
      compatible_devices,

      // Downloads
      datasheet,
      catalogue,
      manual,
      warranty,

      // FAQ
      faq,
      seo,
      // Tags
      tags,
      stock,
      // Variants
      variants: variantsRaw,

      // Main Media
      main_image,
      main_video,
    } = req.body;

    // ── Required fields ────────────────────────────────────────────────────
    const required = { name, desc, price, MRP, category_id, brand_id };
    for (const [key, value] of Object.entries(required)) {
      if (!value) return res.status(400).json({ error: `Missing field: ${key}` });
    }

    // ── Numbers ────────────────────────────────────────────────────────────
    const numericPrice = parseFloat(price);
    const numericMRP = parseFloat(MRP);
    if (isNaN(numericPrice) || isNaN(numericMRP)) {
      return res.status(400).json({ error: "Price and MRP must be numeric." });
    }


    let seoData = {};

    try {
      seoData = seo ? JSON.parse(seo) : {};
    } catch {
      return res.status(400).json({
        error: "Invalid SEO JSON",
      });
    }

    if (seoData.keywords && typeof seoData.keywords === "string") {
      seoData.keywords = seoData.keywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean);
    }

    // ── Arrays ─────────────────────────────────────────────────────────────
    const tagsArray = parseArray(tags);
    const keyFeaturesArray = parseArray(key_features);
    const advantagesArray = parseArray(advantages);
    const compatibleArray = parseArray(compatible_devices);
    const applicationsArray = parseArray(applications);


    // ── FAQ ────────────────────────────────────────────────────────────────
    const faqArray = [];

    if (faq) {
      const blocks = faq.trim().split(/\n\s*\n/); // blank line separates FAQs

      blocks.forEach((block) => {
        const match = block.match(
          /Q\d*\.?\s*(.*?)\s*Ans\.?\s*(.*)/is
        );

        if (match) {
          faqArray.push({
            question: match[1].trim(),
            answer: match[2].trim(),
          });
        }
      });
    }


    // ── Variants ───────────────────────────────────────────────────────────
    let variants = [];
    try {
      variants = JSON.parse(variantsRaw || "[]");
    } catch {
      return res.status(400).json({ error: "Invalid variants JSON format" });
    }

    for (const v of variants) {
      if (parseFloat(v.MRP) <= parseFloat(v.price)) {
        return res.status(400).json({ error: "Variant MRP must be greater than price" });
      }
    }


    // Apply tax to all variants
    const numericTax = !isNaN(Number(tax)) ? Number(tax) : 0;
    variants = variants.map((v) => ({ ...v, tax: numericTax }));

    // ── Create SKU ────────────────────────────────────────────────────────────────

    const productSKU = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    variants = variants.map((v, index) => ({
      sku: `${productSKU}-${index + 1}`,
      model: v.model,
      voltage: v.voltage,
      capacity: v.capacity,
      price: Number(v.price),
      MRP: Number(v.MRP),
      stock: Number(v.stock),
    }));



    // ── Slug ───────────────────────────────────────────────────────────────
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // ── S3 ─────────────────────────────────────────────────────────────────
   

const s3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,

  httpOptions: {
    timeout: 10 * 60 * 1000,      // 10 minutes
    connectTimeout: 60 * 1000,
  },

  maxRetries: 3,
});

    const imageFiles = req.files["image"] || [];
    const videoFiles = req.files["videos"] || [];
    const datasheetFile = req.files?.datasheet?.[0];
    const catalogueFile = req.files?.catalogue?.[0];
    const manualFile = req.files?.manual?.[0];
    const warrantyFile = req.files?.warranty?.[0];

    // ── Image upload ───────────────────────────────────────────────────────
    const imageUrls = [];
    let mainImageUrl = "";

    await Promise.all(
      imageFiles.map(async (file) => {
        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error(`Image ${file.originalname} exceeds 5 MB limit.`);
        }

        const keyName = `${slug}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.webp`;

        const optimizedBuffer = await sharp(file.buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const uploaded = await s3
          .upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: keyName,
            Body: optimizedBuffer,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000",
          })
          .promise();

        imageUrls.push(uploaded.Location);

        if (main_image === file.originalname) {
          mainImageUrl = uploaded.Location;
        }
      })
    );


    async function uploadPdf(file, folder) {
      if (!file) return "";

      const uploaded = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${folder}/${slug}-${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();

      return uploaded.Location;
    }
    const [
      datasheetUrl,
      catalogueUrl,
      manualUrl,
      warrantyUrl,
    ] = await Promise.all([
      uploadPdf(datasheetFile, "datasheets"),
      uploadPdf(catalogueFile, "catalogues"),
      uploadPdf(manualFile, "manuals"),
      uploadPdf(warrantyFile, "warranty"),
    ]);

    if (!mainImageUrl && imageUrls.length > 0) mainImageUrl = imageUrls[0];

    // Put main image first in array
    const idx = imageUrls.indexOf(mainImageUrl);
    if (idx > -1) {
      const [main] = imageUrls.splice(idx, 1);
      imageUrls.unshift(main);
    }

    // ── Video upload ───────────────────────────────────────────────────────
    const videoUrls = [];
    let mainVideoUrl = "";

    await Promise.all(
      videoFiles.map(async (file) => {
        if (file.size > MAX_VIDEO_SIZE) {
          throw new Error(`Video ${file.originalname} exceeds 50 MB limit.`);
        }

        const keyName = `video-${slug}-${Date.now()}-${file.originalname}`;

        const uploaded = await s3
          .upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: keyName,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
          .promise();

        videoUrls.push(uploaded.Location);

        if (main_video === file.originalname) {
          mainVideoUrl = uploaded.Location;
        }
      })
    );

    if (!mainVideoUrl && videoUrls.length > 0) mainVideoUrl = videoUrls[0];



    // ── Save product ───────────────────────────────────────────────────────
    const product = await Product.create({
      name,
      slug,
      desc,
      short_desc,
      long_description,

      price: numericPrice,
      MRP: numericMRP,
      tax: numericTax,

      category_id,
      brand_id,
      subcat,

      specifications: {
        power,
        nominal_voltage,
        capacity,
        cycle_life,
        charging_voltage,
        charging_current,
        discharging_current,
        dimensions,
        weight,
        connector,
      },

      key_features: keyFeaturesArray,
      applications: applicationsArray,
      advantages: advantagesArray,
      compatible_devices: compatibleArray,

      datasheet: datasheetUrl,
      catalogue: catalogueUrl,
      manual: manualUrl,
      warranty: warrantyUrl,

      alt_text,

      images: imageUrls,
      main_image: mainImageUrl,
      videos: videoUrls,

      tags: tagsArray,
      faq: faqArray,   // ✅ Correct


      featured,
      label,
      stock,
      variants,
      seo: seoData,
      sku: productSKU
    });

    return res.status(200).json({
      message: "✅ Product successfully uploaded",
      data: product,
    });

  } catch (error) {
    console.error("❌ Product creation failed:", error);
    return res.status(500).json({
      error: error.message || "Failed to upload product!",
    });
  }
});

export default apiRoute;

export const config = {
  api: { bodyParser: false },
};