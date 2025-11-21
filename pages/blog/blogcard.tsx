import Image from "next/image";

interface BlogCardProps {
  blog: any;
  onClick?: () => void;
}

export default function BlogCard({ blog, onClick }: BlogCardProps) {
  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").slice(0, 100) + "...";
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-xl shadow-md hover:shadow-xl transition-all bg-white flex flex-col h-[400px] overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full h-48">
        <Image
          src={blog.image || "/placeholder.jpg"}
          alt={blog.title || "Blog Image"}
          fill
          className="object-cover group-hover:scale-105 transition-all duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {blog.category || "Other"}
        </p>

        <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {blog.title || "Untitled Blog"}
        </h2>

        <p className="text-gray-600 text-sm mb-3">
          {stripHtml(blog.content || "")}
        </p>
      </div>
    </div>
  );
}
