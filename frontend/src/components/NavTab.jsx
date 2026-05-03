import { Link, useLocation } from "react-router-dom";
import "./NavLink.css";

// color can be a named key or any CSS gradient/color string
const GRADIENT_MAP = {
  emerald: "linear-gradient(135deg, #10b981, #059669)",
  cyan:    "linear-gradient(135deg, #06b6d4, #0284c7)",
  blue:    "linear-gradient(135deg, #3b82f6, #6366f1)",
  purple:  "linear-gradient(135deg, #8b5cf6, #a855f7)",
  rose:    "linear-gradient(135deg, #f43f5e, #e11d48)",
  orange:  "linear-gradient(135deg, #f97316, #eab308)",
};

export default function NavTab({ to, label, color = "emerald", dot, dotColor }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const gradient = GRADIENT_MAP[color] || color;

  return (
    <Link
      to={to}
      className={`nav-tab${isActive ? " active" : ""}`}
    >
      {/* Colored backing */}
      <span className="nav-tab__back" style={{ background: gradient }} />

      {/* Frosted glass front */}
      <span className="nav-tab__front" />

      {/* Dot indicator */}
      {dot && (
        <span
          className="nav-tab__dot animate-pulse"
          style={{ background: dotColor || "#06b6d4" }}
        />
      )}

      {/* Text */}
      <span
        className="nav-tab__label"
        style={isActive ? { color: "#fff" } : undefined}
      >
        {label}
      </span>
    </Link>
  );
}
