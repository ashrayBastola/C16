import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";

export default function CommunicationSidebar() {
  const { user } = useSelector((state) => state.auth);
  const links = [
    { name: "Messages", path: `/communication-dashboard/${user?.username}/communication-messages`, icon: <MessageCircle size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <MessageCircle className="text-indigo-300" size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Communication</div>
            <div className="text-xs text-slate-400">{user?.username || "Dashboard"}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <span className="text-slate-300">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
