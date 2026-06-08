import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, clearCreateUserState } from "../../store/Slice/authSlice";
import { Eye, EyeOff } from "lucide-react";

export default function AdminCreateUser() {
  const dispatch = useDispatch();
  const { createUserLoading, createUserError, createUserSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    password: "",
    role: "communication",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createUser(formData));
  };

  useEffect(() => {
    if (createUserSuccess || createUserError) {
      const timer = setTimeout(() => dispatch(clearCreateUserState()), 3000);
      return () => clearTimeout(timer);
    }
  }, [createUserSuccess, createUserError, dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-400">Admin</div>
        <h1 className="text-2xl font-semibold text-white">Create user</h1>
      </div>

      <div className="card max-w-2xl">
        <div className="card-header">
          <div className="text-sm font-semibold text-white">New account</div>
          <div className="text-sm text-slate-400">Create Student or Communication users.</div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g. ram123"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Full name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="communication">Communication</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input pr-12"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost px-3 py-1.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {createUserSuccess ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {createUserSuccess}
              </div>
            ) : null}
            {createUserError ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {createUserError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={createUserLoading}
                className="btn btn-primary"
              >
                {createUserLoading ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
