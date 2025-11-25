export interface FlashSaleItem {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  endsAt: string;
}


export interface AdminFlashSale {
  _id: string;
  productId: string;
  salePrice: number;
  startTime: string;
  endTime: string;
  active: boolean;
  product: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  } | null;
}
