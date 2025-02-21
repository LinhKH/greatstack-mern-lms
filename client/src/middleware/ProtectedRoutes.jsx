import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";

export const ProtectedRoute = ({ children }) => {
  const { userData } = useContext(AppContext);

  if (!userData) {
    toast.error("Please login to access this page");
    return <Navigate to="/" />;
  }

  return children;
};

export const AuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useSelector((store) => store.auth);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { userData } = useContext(AppContext);
  const { user } = useUser();
  if (!userData) {
    toast.error("Please login to access this page");
    return <Navigate to="/" />;
  }

  if (user.publicMetadata.role !== 'educator') {
    return <Navigate to="/" />;
  }

  return children;
};
