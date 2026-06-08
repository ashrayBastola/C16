import React, { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, Sparkles, LogIn, UserCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/Slice/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function HackingInterface() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const redirectByRole = useMemo(
    () => ({
      admin: "/admin-dashboard",
      student: "/student-dashboard",
      communication: "/communication-dashboard",
    }),
    []
  );

  useEffect(() => {
    if (user?.role && redirectByRole[user.role]) {
      navigate(redirectByRole[user.role]);
    }
  }, [user, navigate, redirectByRole]);

  const handleLogin = (e) => {
    e?.preventDefault?.();
    if (!username.trim() || !password) {
      setFormError("Please enter both username and password.");
      return;
    }
    setFormError("");
    dispatch(loginUser({ username: username.trim(), password }));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/40">
              <LogIn size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">SellingProduct</div>
              <div className="text-[11px] text-slate-400">
                Unified access portal for all roles
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-slate-300/90 md:flex">
            <span className="badge">Admin</span>
            <span className="badge">Student</span>
            <span className="badge">Communication</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-2">
        {/* Left: Hero */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <Sparkles size={14} className="text-indigo-300" />
            Modern dashboard experience
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            SellingProduct
            <span className="block text-slate-300 text-xl md:text-2xl mt-3 font-medium">
              Secure login for Admin, Student, and Communication roles.
            </span>
          </h1>

          <p className="max-w-prose text-slate-300 leading-relaxed">
            A clean, responsive UI with consistent navigation, readable typography, and
            fast messaging flows—built on your existing backend and auth.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card">
              <div className="card-body flex items-start gap-3">
                <ShieldCheck className="text-emerald-300" />
                <div>
                  <div className="font-semibold text-white">Role-based access</div>
                  <div className="text-sm text-slate-300">Automatic redirect after login.</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body flex items-start gap-3">
                <Lock className="text-indigo-300" />
                <div>
                  <div className="font-semibold text-white">Secure sessions</div>
                  <div className="text-sm text-slate-300">Tokens stored for API access.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300/90">
            <div className="badge">
              <UserCircle2 className="mr-1.5 h-3 w-3" />
              Admin, Student & Communication dashboards
            </div>
            <span className="text-slate-400">
              Tip: Use your role-specific credentials provided by the system administrator.
            </span>
          </div>
        </div>

        {/* Right: Login */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Lock className="text-indigo-300" size={18} />
              <div>
                <div className="text-white font-semibold">Sign in</div>
                <div className="text-sm text-slate-300">Use your assigned credentials.</div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-24"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost px-3 py-1.5 text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {formError && !error && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {formError}
                </div>
              )}

              {error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || !username.trim() || !password}
                className="btn btn-primary w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="space-y-1 text-xs text-slate-400">
                <div>
                  By continuing, you agree to your organization’s access policies.
                </div>
                <div className="text-slate-300">
                  New here?{" "}
                  <Link to="/signup" className="text-indigo-300 hover:text-indigo-200">
                    Create a student account
                  </Link>
                  .
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 text-[11px] text-slate-500">
        <span>© {new Date().getFullYear()} SellingProduct. All rights reserved.</span>
        <span className="hidden md:inline">
          Need help? Contact your administrator for credential or access support.
        </span>
      </footer>
    </div>
  );
}
