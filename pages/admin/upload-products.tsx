"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";


interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

// Modal component
const Modal = ({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function UploadProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "", price: "", stock: "", category: "" });
  const [newImages, setNewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "update" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/products/list");
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  // Authorization
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["admin", "superadmin"].includes((session.user as any)?.role)) {
      toast.error("You are not authorized to access this page.");
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises)
      .then((res) => setNewImages((prev) => [...prev, ...res]))
      .catch(() => toast.error("Failed to read selected files."));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Open modals
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setModalType("delete");
    setModalOpen(true);
  };

  const openUpdateModal = (product: Product) => {
    setSelectedProduct(product);
    setModalType("update");
    setModalOpen(true);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setExistingImages(product.images);
    setNewImages([]);
    setEditingId(product._id);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await axios.delete(`/api/admin/products/delete/${selectedProduct._id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    } finally {
      setModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !newImages.length) return toast.error("Please select at least 1 image.");
    if (!session) return toast.error("Session expired. Please log in again.");

    setLoading(true);
    try {
      if (editingId) {
        // Update product
        await axios.put(`/api/admin/products/update/${editingId}`, {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          existingImages,
          newImages,
        });
        toast.success("Product updated successfully!");
        setEditingId(null);
        setModalOpen(false);
      } else {
        // Create new product
        await axios.post("/api/admin/products/create", {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          imagesBase64: newImages,
        });
        toast.success("Product uploaded successfully!");
      }

      setForm({ title: "", description: "", price: "", stock: "", category: "" });
      setNewImages([]);
      setExistingImages([]);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Error saving product.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p className="p-6">Loading session...</p>;

  return (
    <div className="p-6">
      {/* Upload / Update Form */}
      <Card className="max-w-7xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>{editingId ? "Update Product" : "Upload New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <Input name="title" placeholder="Product Title" value={form.title} onChange={handleChange} required />
            <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <Input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
            <Input type="number" name="stock" placeholder="Stock quantity" value={form.stock} onChange={handleChange} />
            <input
              list="categories"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Select or enter category"
              required
            />
            <datalist id="categories">
              {categories.map((cat) => <option key={cat} value={cat} />)}
            </datalist>

            <Input type="file" multiple accept="image/*" onChange={handleNewImagesChange} />

            {/* Existing images */}
            {existingImages.length + newImages.length > 0 && (
              <ReactSortable
                list={[...existingImages, ...newImages].map((img, i) => ({ id: i, src: img }))}
                setList={(newOrder) => {
                  const reordered = newOrder.map((item) => item.src);
                  setExistingImages(reordered.slice(0, existingImages.length));
                  setNewImages(reordered.slice(existingImages.length));
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {[...existingImages, ...newImages].map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} className="w-full h-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() =>
                        idx < existingImages.length
                          ? removeExistingImage(idx)
                          : removeNewImage(idx - existingImages.length)
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </ReactSortable>
            )}

            <Button type="submit" disabled={loading || status !== "authenticated"}>
              {loading ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Update Product" : "Upload Product"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Product List */}
      <h2 className="text-xl font-bold mb-4">Existing Products</h2>
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-2 rounded relative">
            <img src={p.images[0]} className="w-full h-32 object-cover rounded" />
            <h4 className="font-semibold mt-2">{p.title}</h4>
            <p>₦{p.price}</p>
            <div className="flex justify-between mt-2">
              <Button onClick={() => openUpdateModal(p)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</Button>
              <Button onClick={() => openDeleteModal(p)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={modalType === "delete" ? "Confirm Delete" : "Update Product"}
        onClose={() => setModalOpen(false)}
      >
        {modalType === "delete" ? (
          <>
            <p className="text-red-400">Are you sure you want to delete <strong>{selectedProduct?.title}</strong>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setModalOpen(false)} variant="outline" className="text-black cursor-pointer">Cancel</Button>
              <Button onClick={confirmDelete} className="bg-red-600 text-white cursor-pointer">Delete</Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 w-full text-black overflow-y-auto">
            <Input name="title" value={form.title} onChange={handleChange} required />
            <Textarea name="description" value={form.description} onChange={handleChange} />
            <div className="flex gap-6">
            <Input type="number" name="price" value={form.price} onChange={handleChange} required />
            <Input type="number" name="stock" value={form.stock} onChange={handleChange} />
            </div>
             <div className="flex gap-6">

            <input
              list="categories"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              />
            <datalist id="categories">
              {categories.map((cat) => <option key={cat} value={cat} />)}
            </datalist>
            <Input type="file" multiple accept="image/*" onChange={handleNewImagesChange} />
              </div>

            {/* Existing & new image previews */}
            {existingImages.length + newImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {existingImages.map((img, idx) => (
                  <div key={`exist-${idx}`} className="relative">
                    <img src={img} className="w-full h-24 object-cover rounded border" />
                    <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">×</button>
                  </div>
                ))}
                {newImages.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <img src={img} className="w-full h-24 object-cover rounded border" />
                    <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700">×</button>
                  </div>
                ))}
              </div>
            )}

            <Button className="cursor-pointer" type="submit">{loading ? "Updating..." : "Update Product"}</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
