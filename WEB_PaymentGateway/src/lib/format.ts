export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // tanpa desimal
  }).format(value);

export const formatNumberID = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);
