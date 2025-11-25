import { IProduct } from "@/models/Product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: IProduct[];
  onOpen: (p: IProduct) => void;
}

export default function ProductGrid({ products, onOpen }: ProductGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
