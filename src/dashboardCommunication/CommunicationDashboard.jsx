import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/Slice/authSlice";
import { useNavigate, Navigate, Outlet, useParams } from "react-router-dom";
import CommunicationSidebar from "./slidebar/Sildebar";
import { MessageSquare, LogOut } from "lucide-react";

export default function CommunicationDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();

  // Redirect to username if not in URL
  useEffect(() => {
    if (!username && user) {
      navigate(`/communication-dashboard/${user.username}`, { replace: true });
    }
  }, [username, user, navigate]);

  // If not logged in → Block
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="app-shell flex">
      <CommunicationSidebar />
      <div className="flex-1 pl-72">
        {/* Header */}
        <div className="topbar">
          <div className="page flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <MessageSquare className="text-indigo-300" size={20} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Communication dashboard</div>
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

        {/* Dynamic Outlet Content */}
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
