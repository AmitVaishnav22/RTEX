import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Slide from "./Slide.jsx"

const TOTAL_SLIDES = 5;

const Recap2025 = () => {
  const [recap, setRecap] = useState(null);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.close();
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await axios.get(
          "https://rtex-1.onrender.com/recap/2025-recap",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        //console.log("Recap data:", res.data);

        setRecap(res.data);
      } catch (err) {
        console.error("Failed to load recap", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const next = () => setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
  const prev = () => setSlide((s) => Math.max(s - 1, 0));

  if (loading) {
    return (
      <div className="h-screen w-full bg-black text-white flex items-center justify-center">
        Loading your 2025 recap…
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="h-screen w-full bg-black text-white flex items-center justify-center">
        Unable to load recap
      </div>
    );
  }

  return (
    <>
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center">
       <Slide slide={slide} recap={recap} /> 

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === slide ? "bg-white" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-6">
        <button
          onClick={prev}
          disabled={slide === 0}
          className="px-5 py-2 border border-gray-600 rounded disabled:opacity-30"
        >
          Prev
        </button>

        <button
          onClick={next}
          disabled={slide === TOTAL_SLIDES - 1}
          className="px-5 py-2 border border-gray-600 rounded disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
    {/* Footer */}
    <div className="text-center sticky bottom-0 bg-black py-2">
      <h2 className="text-xl font-bold text-blue-400 tracking-wider">
        RTEX WorkSpace
      </h2>
      <p className="text-sm text-gray-400">
        Private Works, Public Access — Powered by RTEX
      </p>
    </div>
    </>
  );
};

export default Recap2025;
