import React from "react";

function currencyFormatter({ price }) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    style: "currency",
    currency: "INR",
  }).format(price);
}

export default currencyFormatter;
