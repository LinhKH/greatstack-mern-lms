import axios from "axios";

import { useParams, Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useContext, useEffect, useState } from "react";
import Loading from "../components/common/Loading";

const PurchaseCourseProtectedRoute = ({ children }) => {
  const { courseId } = useParams();
  const { backendUrl, getToken } = useContext(AppContext);
  const [isPurchased, setIsPurchased] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
        const token = await getToken();
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/course/${courseId}/detail-with-status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsPurchased(data?.purchased);
      } catch (error) {
        console.error("Failed to fetch purchase status", error);
      } finally {
        setLoading(false);
      }
    };
    checkPurchaseStatus();
  }, [backendUrl, courseId]);

  if (loading) {
    return <Loading></Loading>;
  }

  return isPurchased ? children : <Navigate to={`/course/${courseId}`} />;
};
export default PurchaseCourseProtectedRoute;
