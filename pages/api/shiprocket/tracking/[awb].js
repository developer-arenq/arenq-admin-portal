export default async function handler(req, res) {
  const { awb } = req.query;

  try {
    // 1️⃣ Get Shiprocket token
    const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    const { token } = await authRes.json();
    if (!token) return res.status(401).json({ error: "Auth failed" });

    // 2️⃣ Fetch tracking info
    const trackRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await trackRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Shiprocket API failed:", err);
    res.status(500).json({ error: "Shiprocket fetch failed" });
  }
}
