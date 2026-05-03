import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import NavTab from "./NavTab";

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setLoginLoading(true);
      try {
        // Fetch user info from Google using the access token
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        // googleUser has: sub, name, email, picture

        // Sync with our backend
        const res = await api.loginGoogle(googleUser);
        if (res.status === "Success") {
          login(res.user);
          navigate("/dashboard");
        } else {
          // Backend down — store Google profile locally
          login({
            google_id: googleUser.sub,
            full_name: googleUser.name,
            email: googleUser.email,
            profile_picture: googleUser.picture,
          });
          navigate("/dashboard");
        }
      } catch {
        console.error("Login failed");
      } finally {
        setLoginLoading(false);
      }
    },
    onError: () => setLoginLoading(false),
  });

  const avatar = user?.profile_picture || user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || "U")}&background=10b981&color=fff`;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white italic text-sm">L</div>
        <span className="text-xl font-bold text-white">LifeGuard <span className="text-emerald-400">AI</span></span>
      </Link>

      <div className="hidden md:flex gap-1 text-slate-300 font-medium text-sm">
        <NavTab to="/"           label="Home"        color="emerald" />
        <NavTab to="/predict"    label="Predict"     color="blue" />
        {user && <NavTab to="/dashboard"  label="Dashboard"  color="purple" />}
        <NavTab to="/hospitals"  label="Hospitals"   color="rose" />
        <NavTab to="/smartsense" label="SmartSense"  color="cyan" dot dotColor="#06b6d4" />
        {user && <NavTab to="/profile"    label="Profile"    color="orange" />}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover" />
            <span className="text-slate-300 text-sm hidden md:block">{user.full_name}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-slate-400 hover:text-red-400 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => googleLogin()}
            disabled={loginLoading}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-full transition-all text-sm shadow disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loginLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        )}
      </div>
    </nav>
  );
}
