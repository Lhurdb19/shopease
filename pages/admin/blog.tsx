"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import { MoreVertical, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

// Dynamically import Quill
const ReactQuillWrapper: any = dynamic(
  async () => (await import("react-quill-new")).default,
  { ssr: false }
);

// Blog type
interface Blog {
  _id: string;
  title: string;
  content: string;
  image: string;
  category: string;
}

export default function AdminBlogsPage() {
  const quillRef = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Popups
  const [showPreview, setShowPreview] = useState<Blog | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Fetch blogs on mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();

      console.log("API RESULT:", data);

      // Protect against wrong formats
      if (Array.isArray(data)) {
        setBlogs(data);
      } else if (Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else {
        setBlogs([]);
      }

    } catch (err) {
      toast.error("Failed to load blogs");
      setBlogs([]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Upload image
  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      if (!input.files?.[0]) return;
      const file = input.files[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "mystore/blogs");

      toast.info("Uploading image...");

      try {
        const res = await axios.post("/api/cloudinary-upload", formData);
        const imageUrl = res.data.url;
        setImage(imageUrl);

        const quill = quillRef.current?.getEditor?.();
        const range = quill?.getSelection(true);
        if (quill && range) quill.insertEmbed(range.index, "image", imageUrl);

        setShowImagePopup(true);
        toast.success("Image uploaded successfully!");
      } catch (err: any) {
        toast.error("Image upload failed");
      }
    };
  };

  // Quill toolbar
  const modules = {
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        [{ header: [1, 2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageUpload,
        link: () => setShowLinkPopup(true),
      },
    },
  };

  // Create blog
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!title || !content)
      return toast.error("Please fill all fields");

    setLoading(true);

    try {
      const res = await axios.post("/api/blogs", {
        title,
        content,
        image,
        category,
        author: "SuperAdmin"
      });

      if (res.status === 201) {
        toast.success("🎉 Blog created!");
        setTitle("");
        setContent("");
        setImage("");
        setCategory("Other");
        setShowSuccessModal(true);
        fetchBlogs();
      }
    } catch (err) {
      toast.error("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const handleDelete = async (slug: string) => {
    try {
      await axios.delete(`/api/blogs/${slug}`);
      toast.success("Blog deleted");
      setShowDeleteModal(null);
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  // Insert link
  const handleInsertLink = () => {
    const quill = quillRef.current?.getEditor?.();
    const range = quill?.getSelection();

    if (!range || !linkUrl) return;

    quill.format("link", linkUrl);
    setLinkUrl("");
    setShowLinkPopup(false);
  };

  const categoryStyles: any = {
    News: "bg-green-600 text-white",
    Announcements: "bg-blue-600 text-white",
    Tips: "bg-red-600 text-white",
    Tutorials: "bg-gray-200 text-black",
    Other: "bg-black text-white",
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 text-white">

      <h1 className="text-3xl font-bold mb-6 text-center">✍️ Manage Blog Posts</h1>

      {/* CREATE BLOG FORM */}
      <Card className="bg-gray-900 border-gray-700 text-white mb-10">
        <CardHeader>
          <CardTitle>Create a New Blog</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              placeholder="Blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-black"
              required
            />

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="News">News</SelectItem>
                <SelectItem value="Tips">Tips</SelectItem>
                <SelectItem value="Announcements">Announcements</SelectItem>
                <SelectItem value="Tutorials">Tutorials</SelectItem>
              </SelectContent>
            </Select>

            <ReactQuillWrapper
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Write your blog content..."
              className="bg-white text-black"
            />

            {image && (
              <div className="mt-3">
                <p className="text-sm">Featured Image:</p>
                <Image
                  src={image}
                  width={200}
                  height={200}
                  alt="Preview"
                  className="rounded-lg border w-40 h-40 object-cover"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white mt-4">
              {loading ? "Publishing..." : "Publish Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* BLOG LIST */}
      <h2 className="text-2xl font-semibold mb-4">All Blogs</h2>

      <div className="grid md:grid-cols-4 gap-8">
        {blogs.length === 0 && (
          <p className="text-gray-400">No blog posts found.</p>
        )}

        {blogs.map((blog) => (
          <Card
            key={blog._id}
            onClick={() => setShowPreview(blog)}
            className="bg-gray-900 border-gray-700 text-white cursor-pointer relative hover:shadow-green-500/20 transition-all"
          >
            <CardContent className="p-4">

              {/* ICON MENU */}
              <div
                className="absolute top-3 right-3 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === blog._id ? null : blog._id);
                }}
              >
                <MoreVertical className="text-gray-300 cursor-pointer" />

                {openMenu === blog._id && (
                  <div
                    className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-44 p-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteModal(blog._id)}
                      className="text-red-500 hover:bg-gray-700 w-full text-left"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <Image
                src={blog.image}
                width={300}
                height={300}
                alt={blog.title}
                className="rounded-lg mb-3 w-full h-40 object-cover"
              />

              <h3 className="text-lg font-semibold line-clamp-1">{blog.title}</h3>

              <p
                className={`text-[11px] px-2 py-1 rounded inline-block mt-1 ${categoryStyles[blog.category]}`}
              >
                {blog.category}
              </p>

              <div
                className="text-gray-300 text-[12px] line-clamp-3 mt-2"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* POPUPS BELOW */}

      {/* Insert Link Popup */}
      {showLinkPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-black w-[90%] max-w-sm relative">
            <button onClick={() => setShowLinkPopup(false)} className="absolute top-2 right-2">
              <X className="text-gray-600" />
            </button>

            <h3 className="text-lg font-bold mb-3">Insert Link</h3>

            <Input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mb-4"
            />

            <Button onClick={handleInsertLink} className="bg-green-600 text-white w-full">
              Insert
            </Button>
          </div>
        </div>
      )}

      {/* Image Uploaded Popup */}
      {showImagePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center text-black relative">
            <button onClick={() => setShowImagePopup(false)} className="absolute top-2 right-2">
              <X className="text-gray-600" />
            </button>

            <h3 className="text-lg font-bold mb-3">Image Uploaded!</h3>

            <Image src={image} alt="Uploaded" width={150} height={150} className="rounded-lg mx-auto" />

            <p className="mt-3 text-gray-600">Your image was successfully uploaded.</p>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[90%] max-w-sm">
            <h3 className="font-bold mb-3">Are you sure?</h3>
            <p className="text-gray-600 mb-5">
              This action will permanently delete this blog post.
            </p>

            <div className="flex justify-between">
              <Button onClick={() => setShowDeleteModal(null)} className="bg-gray-400 text-white">
                Cancel
              </Button>

              <Button
                onClick={() => handleDelete(showDeleteModal)}
                className="bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white text-black p-6 rounded-xl max-w-2xl w-[95%] relative">
            <button onClick={() => setShowPreview(null)} className="absolute top-2 right-2">
              <X className="text-gray-700" />
            </button>

            <Image
              src={showPreview.image}
              width={500}
              height={300}
              alt={showPreview.title}
              className="rounded-lg w-full h-60 object-cover mb-4"
            />

            <h2 className="text-2xl font-bold mb-2">{showPreview.title}</h2>

            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: showPreview.content }}
            />
          </div>
        </div>
      )}

      {/* Success popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center text-black">
            <h3 className="text-lg font-bold mb-2">🎉 Blog Published!</h3>
            <p>Your blog has been successfully posted.</p>

            <Button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 text-white mt-4"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
