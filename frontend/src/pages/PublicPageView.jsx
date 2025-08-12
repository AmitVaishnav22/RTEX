import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicPageView = () => {
  const { publicId } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const res = await axios.get(`http://localhost:7000/letter/public/${publicId}`);
        setLetter(res.data);
        document.title = res.data.title || "Public Post";
      } catch (err) {
        setError("Could not load the letter. It may be deleted or unpublished.");
        document.title = "Letter Not Found";
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [publicId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-black text-white px-4 py-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-sharp text-blue-500 text-center mb-6">
          {letter.title}
        </h1>
        <div
          className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap text-left"
          dangerouslySetInnerHTML={{ __html: letter.content }}
        />
      </div>
    </div>
    <div className="text-center sticky bottom-0 bg-black py-4">
        <h2 className="text-2xl font-bold text-blue-400 tracking-wider">
          RTEX WorkSpace
        </h2>
        <p className="text-sm text-gray-400">Private Works, Public Access — Powered by RTEX</p>
      </div>
    </>

  );
};

export default PublicPageView;
