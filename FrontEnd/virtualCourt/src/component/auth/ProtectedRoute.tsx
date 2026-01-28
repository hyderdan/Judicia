import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        // Not logged in -> Redirect to login
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(storedUser);

        // If roles are specified, check if user has permission
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Role not authorized -> Redirect to their own dashboard or 404
            // For now, let's redirect to login to be safe, or maybe home
            return <Navigate to="/login" replace />;
        }

        // Authorized -> Render child routes
        return <Outlet />;

    } catch (e) {
        // JSON parse error -> Redirect to login
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }
}
