import { GetServerSideProps } from "next";
import { connectDB } from "@/lib/db";
import ProductModel, { IProduct } from "@/models/Product";
import ProductDetails from "@/components/home/ProductDetails";
import { Toaster } from "sonner";
import Link from "next/link";

type Props = {
  product: IProduct | null;
  similar: IProduct[];
};

export default function ProductPage({ product, similar }: Props) {
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 md:px-8 lg:px-12 py-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-7xl mx-auto">
        {/* Product Details */}
        <ProductDetails product={product} />

        {/* Related / Similar Products */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4 text-black">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similar.map((p) => (
                <Link key={p._id} href={`/products/${p._id}`} className="block">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden">
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-full h-40 md:h-48 object-cover"
                    />
                    <div className="p-2 md:p-3">
                      <div className="text-[12px] md:text-sm font-semibold text-black line-clamp-2">
                        {p.title}
                      </div>
                      <p className="text-[10px] md:text-xs text-green-700 mt-1">
                        ₦{Number(p.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    await connectDB();
    const id = String(ctx.params?.id || "");
    const product = await ProductModel.findById(id).lean();

    if (!product) return { props: { product: null, similar: [] } };

    // Fetch similar products from same category
    const similar = await ProductModel.find({
      active: true,
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(8)
      .select("title images price category")
      .lean();

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        similar: JSON.parse(JSON.stringify(similar)),
      },
    };
  } catch (err) {
    console.error(err);
    return { props: { product: null, similar: [] } };
  }
};
