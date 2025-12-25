import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RecapBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("recap2025Seen");
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("recap2025Seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-blue-500 text-white p-4 rounded-full shadow-lg animate-fade-in">
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-10 text-white text-lg hover:opacity-80"
        aria-label="Close recap popup"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold mb-2">
        🎉 Your 2025 Recap is Here! 
      </h2>

      <p className="text-sm mb-3">
        Discover your writing journey in 2025 with RTEX's personalized recap.
      </p>

      <Link
        to="/recap"
        onClick={handleClose}
        className="inline-block bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition"
      >
        View Your Recap
      </Link>
    </div>
  );
};

export default RecapBanner;
