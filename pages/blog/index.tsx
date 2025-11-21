"use client";

import { useEffect, useState } from "react";
import BlogCard from "./blogcard";

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blog");
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data);
        setFiltered(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleFilter = (value: string) => {
    setCategory(value);
    setFiltered(value === "All" ? blogs : blogs.filter((b) => b.category === value));
  };

  if (loading) return <p className="text-center mt-10">Loading blogs...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!filtered.length) return <p className="text-center mt-10">No blogs found.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 lg:px-20 xl:px-32 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">📰 All Blog Posts</h1>

      {/* Category Filter */}
      <div className="flex justify-center mb-6">
        <select
          value={category}
          onChange={(e) => handleFilter(e.target.value)}
          className="border bg-black px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Categories</option>
          {Array.from(new Set(blogs.map(b => b.category))).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Blog Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((blog) => (
          <BlogCard key={blog._slug} blog={blog} onClick={() => setSelectedBlog(blog)} />
        ))}
      </div>

      {/* Modal Overlay */}
      {selectedBlog && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.9)] flex items-start justify-center z-50 p-6 overflow-auto"
          onClick={() => setSelectedBlog(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setSelectedBlog(null)}
            >
              ✕
            </button>

            {/* Blog Content */}
            <h2 className="text-2xl font-bold mb-2">{selectedBlog.title}</h2>
            <p className="text-sm text-gray-400 mb-4 uppercase">{selectedBlog.category}</p>

            {selectedBlog.image && (
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full max-w-[600px] max-h-[400px] object-cover rounded mb-4 mx-auto"
              />
            )}

            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
