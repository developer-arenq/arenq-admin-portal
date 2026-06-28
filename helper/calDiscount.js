import currencyFormatter from "./currencyFormatter";

function calDiscount(discount_type, discount, price) {
  if (discount_type == "percentage") {
    var result = price - (discount / 100) * price;
    return currencyFormatter({ price: result });
  } else {
    var result = price - discount;

    return currencyFormatter({ price: result });
  }
}

export default calDiscount;
