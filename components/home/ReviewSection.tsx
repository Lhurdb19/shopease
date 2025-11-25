"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FaStar } from "react-icons/fa";

interface Props {
  _id: string;
}

interface Review {
  _id: string;
  name: string;
  rating: number;
  message: string;
  date: string;
}

export default function ReviewSection({ _id }: Props) {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const [editing, setEditing] = useState<Review | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${_id}/review?page=${page}&limit=5`);
      const data = await res.json();

      setReviews(data.reviews || []);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [_id, page]);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
      : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Number(r.rating) === star).length,
  }));

  const handleSubmit = async () => {
    if (!session) return (window.location.href = "/auth/login");
    if (!message.trim()) return toast.error("Review cannot be empty");
    if (!rating) return toast.error("Please choose a star rating");

    const reviewData = {
      name: session.user?.name || "Anonymous",
      rating,
      message,
    };

    try {
      const res = await fetch(`/api/products/${_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || "Failed to submit review");
        return;
      }

      setReviews([data.review, ...reviews]);
      setMessage("");
      setRating(0);
      toast.success("Review submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    }
  };


  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/products/${_id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editing._id,
          rating: editRating,
          message: editMessage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.msg || "Failed to submit review");
        return;
      }


      toast.success("Review updated!");
      setEditing(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error("Update error");
    }
  };

  const deleteReview = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${_id}/review`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: deleteId }),
      });

      if (!res.ok) return toast.error("Failed to delete review");

      toast.success("Review deleted!");
      setDeleteId(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error("Delete error");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold mb-2 text-gray-900">Customer Reviews</h3>

      {/* ⭐ Rating Summary */}
      <div className="mb-6 p-4 border rounded bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-yellow-500 text-2xl font-bold">{average.toFixed(1)}</span>
          <span className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                size={18}
                className={s <= Math.round(average) ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </span>
          <span className="text-gray-700 text-sm">({totalReviews} reviews)</span>
        </div>

        <div className="mt-3 space-y-1">
          {breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-gray-700">{row.star}⭐</span>
              <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full"
                  style={{ width: totalReviews ? `${(row.count / totalReviews) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-6 text-gray-600">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ Review Form */}
      <div className="mb-6 border p-4 rounded bg-white shadow-sm text-sm">
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={22}
              className={`cursor-pointer ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
                }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your review..."
          className="w-full border rounded p-2 text-gray-900 text-sm"
        />
        <button
          onClick={handleSubmit}
          className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
        >
          Submit Review
        </button>
      </div>

      {/* ⭐ Review List */}
      <div className="space-y-3 text-sm">
        {reviews.length === 0 && <p className="text-gray-600 text-sm">No reviews yet.</p>}

        {reviews.map((rev) => (
          <div key={rev._id} className="border p-3 rounded bg-white shadow-sm relative text-sm">
            <button
              className="absolute top-2 right-2 p-1 text-base"
              onClick={() =>
                setDropdownOpen(dropdownOpen === rev._id ? null : rev._id)
              }
            >
              ⋮
            </button>

            {dropdownOpen === rev._id && (
              <div className="absolute right-2 top-6 bg-white shadow-md rounded border w-28 z-50 text-sm">
                <button
                  onClick={() => {
                    setEditing(rev);
                    setEditMessage(rev.message);
                    setEditRating(rev.rating);
                    setDropdownOpen(null);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteId(rev._id);
                    setDropdownOpen(null);
                  }}
                  className="block w-full text-left px-2 py-1 text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}

            <div className="font-semibold text-sm">{rev.name}</div>
            <div className="flex text-yellow-400 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  size={14}
                  className={s <= rev.rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-gray-700 text-sm">{rev.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(rev.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {/* ⭐ Pagination */}
      {totalReviews > 5 && (
        <div className="flex gap-2 mt-3 text-sm">
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* ⭐ Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-sm">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-md">
            <h3 className="font-semibold mb-2">Edit Review</h3>
            <select
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
              className="border p-2 rounded w-full mb-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
            <textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              className="border p-2 rounded w-full mb-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1 border rounded text-sm">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-3 py-1 bg-black text-white rounded text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-sm">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-sm">
            <h3 className="font-semibold mb-2">Delete Review?</h3>
            <p className="text-xs mb-3">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1 border rounded text-sm">
                Cancel
              </button>
              <button
                onClick={deleteReview}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
