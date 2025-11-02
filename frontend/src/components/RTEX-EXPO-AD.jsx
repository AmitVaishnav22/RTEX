import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const RtexExpoAd = () => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Check if user has already interacted with the ad
    const adSeen = localStorage.getItem("rtexExpoAdSeen");
    if (!adSeen) {
      const timer = setTimeout(() => setShowAd(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpen = () => {
    // Mark ad as seen forever
    localStorage.setItem("rtexExpoAdSeen", "true");
    window.open("https://rtex-expo.vercel.app", "_blank");
    setShowAd(false);
  };

  const handleClose = () => {
    setShowAd(false);
  };

  if (!showAd) return null;

  return (
    <div
      className="fixed bottom-6 right-6 bg-gray-900 text-white border border-blue-700 rounded-xl p-4 shadow-lg z-50 w-72 animate-fadeIn"
      style={{
        backgroundImage:
          "url('https://iconape.com/wp-content/files/kd/291769/png/expo-logo.png')",
        backgroundSize: "120px",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right -10px bottom -5px",
      }}
    >
      {/* Overlay gradient to polish background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-transparent pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-blue-400">Explore More</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          Discover more public workspaces and exports on{" "}
          <span className="text-blue-400 font-semibold">RTEX EXPO</span> — a
          companion RTEX product.
        </p>

        <button
          onClick={handleOpen}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-medium transition-all"
        >
          Visit RTEX EXPO
        </button>
      </div>
    </div>
  );
};

export default RtexExpoAd;
