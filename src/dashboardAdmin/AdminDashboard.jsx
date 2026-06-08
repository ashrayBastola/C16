import React from "react";
import Sidebar from "./sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/Slice/authSlice";
import { Shield, LogOut } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="app-shell flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 pl-72">

        {/* Header */}
        <div className="topbar">
          <div className="page flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Shield className="text-indigo-300" size={20} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Admin dashboard</div>
                <div className="text-xs text-slate-400">Manage products & messages</div>
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

        {/* Dynamic Page Content */}
        <div className="page">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
