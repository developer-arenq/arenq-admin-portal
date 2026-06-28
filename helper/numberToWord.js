function NumberToWords(number) {
    if (number === 0) return "zero";
  
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
  
    if (number < 20) {
      return ones[number];
    }
  
    if (number < 100) {
      return `${tens[Math.floor(number / 10)]} ${ones[number % 10]}`.trim();
    }
  
    if (number < 1000) {
      return `${ones[Math.floor(number / 100)]} hundred ${NumberToWords(
        number % 100
      )}`.trim();
    }
  
    if (number < 1000000) {
      return `${NumberToWords(
        Math.floor(number / 1000)
      )} thousand ${NumberToWords(number % 1000)}`.trim();
    }
  
    if (number < 1000000000) {
      return `${NumberToWords(
        Math.floor(number / 1000000)
      )} million ${NumberToWords(number % 1000000)}`.trim();
    }
  
    return "number is too large";
  }
  
  export default NumberToWords;
  