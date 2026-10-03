import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviewList } from "apis/settings";

const Stars = ({ value, size = 18 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
    ))}
  </div>
);

const Review = () => {
  const { data: reviewList, isLoading } = useQuery({
    queryKey: ["getReviewList"],
    queryFn: getReviewList,
  });

  // newest first
  const reviews = [...(reviewList?.data || [])].reverse();
  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.Star || 0), 0) / reviews.length : 0;

  return (
    <>
      <div className="flex items-center mb-4 gap-6">
        <div className="text-2xl font-semibold">Customer Reviews</div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow">
            <span className="font-bold text-lg">{avg.toFixed(1)}</span>
            <Stars value={Math.round(avg)} size={16} />
            <span className="text-sm text-gray-500">({reviews.length})</span>
          </div>
        )}
      </div>
      <div className="w-full border rounded-xl bg-white shadow-sm overflow-x-auto">
        <table>
          <thead className="border-b text-sm text-gray-500">
            <tr>
              <th>#</th>
              <th>Order Time</th>
              <th>Rating</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-10">Loading...</td>
              </tr>
            )}
            {!isLoading && reviews.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-10">No reviews yet.</td>
              </tr>
            )}
            {reviews.map((review, index) => (
              <tr key={review.id} className="border-b last:border-0">
                <td>{index + 1}</td>
                <td className="whitespace-nowrap">{review.OrderTime}</td>
                <td>
                  <Stars value={review.Star} />
                </td>
                <td>{review.Remark || <span className="text-gray-400">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Review;
