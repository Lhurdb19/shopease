export interface IReview {
  name: string;
  rating: number;
  message: string;
  date: string;
}

export interface IProduct {
  _id: string; // ALWAYS string on the front-end
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
}
