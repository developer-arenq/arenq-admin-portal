import transporter from "../lib/mailer";

export default async function sendCartMail(
  user,
  cart
) {
  const productsHTML = cart.items
    .map(
      (item) => `
      <div style="
        border:1px solid #ddd;
        padding:15px;
        margin-bottom:15px;
        border-radius:10px;
      ">
        <img 
          src="${item.thumbnail}" 
          width="120"
          style="border-radius:8px"
        />

        <h2>${item.title}</h2>

        <p>
          ₹${item.price}
        </p>

        <a 
          href="https://www.arenq.co.in/cart"
          style="
            display:inline-block;
            padding:10px 15px;
            background:black;
            color:white;
            text-decoration:none;
            border-radius:5px;
          "
        >
          Complete Order
        </a>
      </div>
    `
    )
    .join("");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,

    to: user.email,

    subject:
      "🛒 Your Cart is Waiting",

    html: `
      <div style="
        font-family:sans-serif;
        max-width:600px;
        margin:auto;
      ">
        <h1>
          Hi ${user.fullname} 👋
        </h1>

        <p>
          You left some products in your cart.
        </p>

        ${productsHTML}

        <h2>
          Cart Total:
          ₹${cart.total}
        </h2>

        <a 
          href="https://www.arenq.co.in/cart"
          style="
            display:inline-block;
            background:#16a34a;
            color:white;
            padding:14px 20px;
            border-radius:8px;
            text-decoration:none;
          "
        >
          Checkout Now
        </a>
      </div>
    `,
  });
}