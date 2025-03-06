import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviewList } from "apis/settings";

const Review = () => {
  const { data: reviewList } = useQuery({
    queryKey: ["getReviewList"],
    queryFn: getReviewList,
  });

  return (
    <>
      <div className="flex items-center mb-4">
        <div className="text-2xl font-semibold me-6">Customer Review</div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        <div className="col-span-5">
          <>
            <div className="w-full border rounded-xl">
              <table>
                <thead className="border-b">
                  <tr>
                    <th>#</th>
                    <th>Order Time</th>
                    <th>Rating</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewList?.data.map((review, index) => (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{review.OrderTime}</td>
                      <td>
                        <div className="flex gap-2">
                          {[...Array(5).keys()].map((_, ind) => (
                            <Star
                              size={18}
                              className={`${
                                ind < review.Star ? "text-yellow-400" : ""
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td>{review.Remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default Review;
