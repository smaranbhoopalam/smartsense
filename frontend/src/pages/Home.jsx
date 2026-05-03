import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🧠",
    title: "ML Prediction",
    desc: "Advanced model trained on 10,000+ medical records to predict diabetes risk.",
  },
  {
    icon: "📊",
    title: "Health Dashboard",
    desc: "Track your health history and see trends over time from your personal cloud.",
  },
  {
    icon: "🏥",
    title: "Hospital Locator",
    desc: "Find the 5 nearest hospitals to your location in real time.",
  },
  {
    icon: "🤖",
    title: "AI Health Tips",
    desc: "Personalized advice powered by Gemini AI based on your profile.",
  },
  {
    icon: "🎙️",
    title: "Voice Commands",
    desc: "Navigate the app hands-free using natural voice commands.",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Your data is encrypted and never shared with third parties.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* HERO */}
      <section className="pt-32 pb-24 px-6 text-center">
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Powered by Gemini AI + ML
        </div>
        <h1 className="text-6xl font-black tracking-tight mb-6 leading-tight">
          Your Personal <br />
          <span className="text-emerald-400">AI Health Guard</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Analyze your lifestyle and medical data to predict risks for Diabetes, Hypertension, and Obesity — before they happen.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/predict"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-10 rounded-2xl text-lg transition-all shadow-xl shadow-emerald-500/20"
          >
            Predict My Risk
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-bold py-4 px-10 rounded-2xl text-lg transition-all"
            >
              My Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-800/50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12 text-white">
            Everything you need to stay <span className="text-emerald-400">ahead of your health</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-8 bg-slate-900 border border-slate-700 hover:border-emerald-500/40 rounded-3xl transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-emerald-400">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-4 text-white">Ready to take control?</h2>
        <p className="text-slate-400 mb-8 text-lg">Run your first health prediction in under 30 seconds.</p>
        <Link
          to="/predict"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-12 rounded-2xl text-lg transition-all shadow-xl shadow-emerald-500/20"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
