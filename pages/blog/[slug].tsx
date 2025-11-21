"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Comment {
  name: string;
  message: string;
  date: string;
}

interface Blog {
  title: string;
  category: string;
  views: number;
  likes: number;
  content: string;
  image: string;
  externalUrl?: string;
  comments?: Comment[];
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (!res.ok) throw new Error((await res.json()).message || "Blog not found");
        const data = await res.json();
        setBlog(data);

        // Optional: record a view count
        await fetch(`/api/blog/${slug}/view`, { method: "PATCH" });
      } catch (err: any) {
        setError(err.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) return <p className="text-center mt-10">Loading blog...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!blog) return <p className="text-center mt-10">Blog not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{blog.title}</h1>

      <p className="text-gray-500 text-sm mt-1">
        Category: {blog.category || "Other"} • Views: {blog.views || 0} • Likes: {blog.likes || 0}
      </p>

      <div className="w-full h-72 relative mt-6">
        <Image
          src={blog.image || "/placeholder.jpg"}
          alt={blog.title || "Blog Image"}
          fill
          className="object-cover rounded-xl"
        />
      </div>

      <div
        className="mt-6 text-lg leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{ __html: blog.content || "" }}
      />

      {blog.externalUrl && (
        <a
          href={blog.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-4 inline-block"
        >
          Read Original Source →
        </a>
      )}

      {/* LIKE BUTTON */}
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg">
        ❤️ Like ({blog.likes || 0})
      </button>

      {/* COMMENTS */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Comments</h2>

      <div className="mt-6 space-y-4">
        {blog.comments?.length ? (
          blog.comments.map((c, idx) => (
            <div key={idx} className="border p-3 rounded">
              <p className="font-bold">{c.name}</p>
              <p className="text-gray-600">{c.message}</p>
              <p className="text-xs text-gray-400">{new Date(c.date).toDateString()}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}
