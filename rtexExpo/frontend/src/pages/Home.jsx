// src/pages/LandingPage.jsx
import { motion } from "framer-motion";
import { ArrowRight, Link, Zap, Share2, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-950 text-white flex flex-col">
      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.h1
          className="text-6xl font-extrabold mb-6 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-blue-500">Rtex Expo</span>  
          <br /> The Open Link Showcase
        </motion.h1>
        <motion.p
          className="text-lg text-gray-400 max-w-3xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Built as an extension of <span className="text-blue-400 font-semibold">Rtex</span>,  
          Expo is a public dashboard where all community-generated links live.  
          No logins. No barriers. Just visibility, reach, and collaboration.
        </motion.p>
        <motion.a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Explore Dashboard <ArrowRight size={20} />
        </motion.a>
      </header>

      {/* Why We Built Expo */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Why We Built Expo</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            In Rtex, users create and publish content. But we wanted to go a step further —  
            to give the community a single space where all public links are visible, searchable, and  
            immediately accessible without needing login or authentication.  
            Expo is that window into the Rtex ecosystem.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Link size={32} />}
            title="Public Links Directory"
            desc="Browse and discover every published link in one open dashboard."
          />
          <FeatureCard
            icon={<Zap size={32} />}
            title="Live Updates"
            desc="Powered by Redis Pub/Sub — see new content instantly, no refresh needed."
          />
          <FeatureCard
            icon={<Share2 size={32} />}
            title="Custom DNS Aliases (CDNS)"
            desc="Human-readable naming for your links. Think of it as app-level DNS."
          />
        </div>
      </section>

      {/* Interlinkage with Rtex */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">How Expo Fits with Rtex</h2>
            <p className="text-gray-400 mb-4">
              <span className="text-blue-400 font-semibold">Rtex</span> is where content is created and personalized.  
              <span className="text-blue-400 font-semibold">Rtex Expo</span> is where that content is showcased publicly.
            </p>
            <ul className="text-gray-300 space-y-3">
              <li>Users publish inside Rtex</li>
              <li>Expo fetches and lists public links</li>
              <li>Impressions & live activity are reflected instantly</li>
              <li>Shared visibility for all creators</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
          >
            <Layers size={60} className="mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">One Ecosystem</h3>
            <p className="text-gray-400">
              Rtex and Expo are two sides of the same coin —  
              one for creators, one for explorers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-900 to-black py-20 px-6 text-center">
        <motion.h2
          className="text-4xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Ready to Explore the Rtex Community?
        </motion.h2>
        <motion.a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition"
          whileHover={{ scale: 1.05 }}
        >
          Go to Dashboard <ArrowRight size={20} />
        </motion.a>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Rtex Expo · An extension of Rtex
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      className="bg-gray-800 rounded-2xl p-8 text-center shadow-lg"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex justify-center mb-4 text-blue-400">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </motion.div>
  );
}
