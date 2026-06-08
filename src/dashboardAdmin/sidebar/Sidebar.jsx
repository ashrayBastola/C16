import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle, PackageSearch, Shield, Terminal } from "lucide-react";

export default function Sidebar() {
  const links = [
    { name: "Messages", path: "/admin-dashboard/messages", icon: <MessageCircle size={20} /> },
    { name: "Products", path: "/admin-dashboard/products", icon: <PackageSearch size={20} /> },
    { name: "Tribe",   path: "/admin-dashboard/tribe", icon: <Terminal size={20} />}
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <Shield className="text-indigo-300" size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Admin</div>
            <div className="text-xs text-slate-400">Control panel</div>
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

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          Tip: use search in Messages to quickly find users.
        </div>
      </div>
    </aside>
  );
}
