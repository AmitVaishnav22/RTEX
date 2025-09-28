import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicPageView = () => {
  const { publicId } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [needPasscode, setNeedPasscode] = useState(false);

  
  const fetchLetter = async (code = "") => {
      try {
        const res = await axios.get(`https://rtex-1.onrender.com/letter/public/${publicId}`,
          { params: code ? { passcode: code } : {} }
        );
        //console.log("Letter fetched:", res);
        setLetter(res.data);
        document.title = res.data.title || "Public Post";
        setError("");
        setNeedPasscode(false);
      } catch (err) {
        if (err.response?.status === 401) {
          setNeedPasscode(true);
          document.title = "Passcode Required";
        } else if (err.response?.status === 405) {
          setError("Incorrect passcode.");
          document.title = "Access Denied";
        } else {
          setError("Could not load the letter. It may be deleted or unpublished.");
          document.title = "Letter Not Found";
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
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
  if (needPasscode) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
        <p className="mb-4 text-blue-400">This workspace is protected. Enter passcode:</p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="border rounded px-2 py-1 text-black"
        />
        <button
          onClick={() => fetchLetter(passcode)}
          className="mt-3 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Submit
        </button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
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
