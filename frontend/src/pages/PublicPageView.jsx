import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Split from "react-split";
import { SplitSquareHorizontal as SplitIcon, NotepadText , TimerResetIcon, LucideListRestart, ListRestart, ListRestartIcon } from "lucide-react";
import UserInfo from "./UserInfo.jsx";
import Notes from "./Notes.jsx";
import RtexExpoAd from "../components/RTEX-EXPO-AD.jsx";

const PublicPageView = () => {
  const { publicId } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [needPasscode, setNeedPasscode] = useState(false);
  const [splits, setSplits] = useState(["content"]); 
  const [splitMode, setSplitMode] = useState(false);
  const [splitIndex, setSplitIndex] = useState(null);
  const contentRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const getCharIndexFromClick = (e) => {
      if (!contentRef.current) return 0;

      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (!range) return 0;

      // Ensure range is within our content div
      if (!contentRef.current.contains(range.startContainer)) return 0;

      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(contentRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const clickedText = preCaretRange.toString();

      // Adjust for scroll offset
      const scrollOffset = contentRef.current.scrollTop;
      const approxAdjustment = Math.floor(scrollOffset / 4); // fine-tuned experimentally

      return Math.max(0, Math.min(letter.content.length, clickedText.length - approxAdjustment));
    };


  
  const fetchLetter = async (code = "") => {
      try {
        const res = await axios.get(`https://rtex-1.onrender.com/letter/public/${publicId}`,
          { params: code ? { passcode: code } : {} }
        );

        console.log("Letter fetched:", res);
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
  if (isMobile) {
    return (
      <>
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-4 text-center">
          {letter.title}
        </h1>
        <p className="mt-6 text-sm text-gray-400 text-center">
          💡 View this workspace on a <span className="text-blue-400 font-semibold">desktop</span> to access more features.
        </p>
        <div
          className="prose prose-invert max-w-none text-left whitespace-pre-wrap border border-gray-700 rounded-xl p-4 bg-gray-900/30"
          dangerouslySetInnerHTML={{ __html: letter.content }}
        />
        {/* Footer */}
      </div>
      <RtexExpoAd />
      <div className="text-center z-0 sticky bottom-0 bg-black py-2">
          <h2 className="text-xl font-bold text-blue-400 tracking-wider">
            RTEX WorkSpace
          </h2>
          <p className="text-sm text-gray-400">
            Private Works, Public Access — Powered by RTEX
          </p>
        </div>
      </>
    );
  }
  return (
    <>
    <div className="min-h-screen w-full bg-black text-white  flex flex-col items-center justify-center">
      <div className="w-full rounded-xl shadow-lg p-6">
        {/* Title + Split aligned in one row */}
        <div className="flex items-center justify-between mb-8 space-x-2">
          <h1 className="text-3xl font-sharp text-blue-500 text-center">
            {letter.title}{" "}
          </h1>

          {/* Split + Notes buttons */}
          <div className="relative flex space-x-2">
            <button
              onClick={() => setSplitMode((prev) => !prev)}
              className="p-1 rounded hover:bg-red-600/20"
              title="Toggle Split Mode"
            >
              <SplitIcon className="h-6 w-6 text-red-400" />
            </button>
            <button
              onClick={() => {
                if (!splits.includes("notes") && splits.length < 3) {
                  setSplits((prev) => [...prev, "notes"]);
                }
              }}
              className="p-1 rounded hover:bg-yellow-600/20"
              title="Add Notes Panel"
            >
              <NotepadText className="h-6 w-6 text-yellow-400" />
            </button>
            <button
              onClick={() => {
                setSplits(["content"]);      
                setSplitIndex(null); 
                setSplitMode(false); 
              }}
              className="p-1 rounded hover:bg-gray-600/20"
              title="Reset Layout"
            >
              <ListRestartIcon className="h-6 w-6 text-gray-400" />
            </button>
            <div className="flex items-center space-x-2 mr-0" title="Publisher Info">
            <UserInfo user={{ name: letter.authorName, profile: letter.authorPhoto }} />
          </div>
          </div>
        </div>

        {/* Info prompt when split mode is active */}
        {splitMode && (
          <p className={`text-center text-sm mb-2 ${splits.length <= 2 ? "text-yellow-400" : "text-red-400"}`}>
            {splits.length <= 2 ? "Click anywhere in the content to create a split" : "Only 2 splits available"}
          </p>
        )}


     {/* Split container */}
      {splits.length > 0 && (
              <Split
                key={splits.length}
                className="flex h-[75vh] w-full"
                sizes={Array(splits.length).fill(100 / splits.length)}
                minSize={100}
                gutterSize={5}
                direction="horizontal"
                cursor="col-resize"
              >
                {splits.map((type, i) => {
                  let start = 0;
                  let end = letter.content.length;

                  if (splitIndex !== null) {
                    if (i === 0) {
                      start = 0;
                      end = splitIndex;
                    } else if (i === 1) {
                      start = splitIndex;
                      end = letter.content.length;
                    }
                  }

                  return (
                    <div
                      key={i}
                      ref={i === 0 ? contentRef : null}
                      className={`p-4 overflow-y-auto border border-gray-700 rounded-lg transition-all ${
                        splitMode ? "cursor-pointer hover:bg-blue-800/20" : ""
                      }`}
                      onClick={(e) => {
                        if (splitMode && splits.length <= 2) {
                          const index = getCharIndexFromClick(e);
                          if (index > 0 && index < letter.content.length) {
                            console.log("Split index:", index);
                            setSplitIndex(index);
                            setSplits((prev) => [...prev, "split"]);
                            setSplitMode(false);
                          }
                        }
                      }}
                    >
                      {(type === "content" || type === "split") && (
                        <div
                          className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap text-left"
                          dangerouslySetInnerHTML={{
                            __html: letter.content.slice(start, end),
                          }}
                        /> 
                      )}

                      {type === "notes" && <Notes publicId={publicId} letter={letter.content} />}
                    </div>
                  );
                })}
              </Split>
            )}
      </div>
      </div>

    <RtexExpoAd />

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
  )
};

export default PublicPageView;
