import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/Slice/authSlice";
import { useNavigate, Navigate, Outlet, useParams } from "react-router-dom";
import { BookOpen, LogOut } from "lucide-react";
import StudentSidebar from "./sidebar/Sidebar";

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();

  // Redirect /student-dashboard → /student-dashboard/:username
  useEffect(() => {
    if (!username && user) {
      navigate(`/student-dashboard/${user.username}`, { replace: true });
    }
  }, [username, user, navigate]);

  // If not logged in → redirect
  if (!user) return <Navigate to="/" replace />;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="app-shell flex">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 pl-72">
        {/* Header */}
        <div className="topbar">
          <div className="page flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <BookOpen className="text-indigo-300" size={20} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Student dashboard</div>
                <div className="text-xs text-slate-400">{username || user.username}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Page */}
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
