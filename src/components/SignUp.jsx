import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../store/Slice/authSlice";
import { Lock, UserPlus, LogIn } from "lucide-react";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, registerLoading, registerError } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) {
      setLocalError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLocalError("");
    dispatch(
      registerUser({
        username: username.trim(),
        full_name: fullName.trim(),
        password,
      })
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/40">
              <UserPlus size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">SellingProduct</div>
              <div className="text-[11px] text-slate-400">Create your student account</div>
            </div>
          </div>

          <Link to="/" className="btn btn-ghost text-xs">
            <LogIn size={14} />
            Back to login
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center gap-10 px-6 py-10 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Join the bookstore
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create a student account so you can browse books, leave reviews, and chat with the AI
            assistant about what to read next.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Lock className="text-indigo-300" size={18} />
              <div>
                <div className="text-white font-semibold">Sign up</div>
                <div className="text-sm text-slate-300">It only takes a moment.</div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Optional, but helpful"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Choose a unique username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              {localError && !registerError && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {localError}
                </div>
              )}

              {registerError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {registerError}
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className="btn btn-primary w-full"
              >
                {registerLoading ? "Creating account..." : "Create account"}
              </button>

              <div className="text-xs text-slate-400">
                By creating an account, you agree to use this platform responsibly and follow your
                institution’s policies.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

