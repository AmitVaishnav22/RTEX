import { useState, useEffect } from "react";
import { generateNotes } from "../utils/AiService.js";


function Notes({ publicId, letter }) {
  const [notes, setNotes] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`notes_${publicId}`);
    if (saved) {
        setNotes(saved);
        setSavedNotes(true);
    }
  }, [publicId]);

  const saveNotes = () => {
    if(localStorage.getItem(`notes_${publicId}`)){
        localStorage.removeItem(`notes_${publicId}`);
    }
    localStorage.setItem(`notes_${publicId}`, notes);
    setSavedNotes(true);
    alert("Notes saved");
  }


  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const aiText = await generateNotes(letter); 
      setNotes((prevNotes) => prevNotes + "\n\n" + aiText);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI notes");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 w-full bg-black text-white p-3 rounded-lg bg-gray-900 resize-none"
        placeholder="Write your notes here..."
      />

      <div className="mt-2 flex gap-2">
        <div
          onClick={saveNotes}
          className="px-2 py-2 text-yellow-500 font-bold bg-black rounded-md cursor-pointer hover:bg-gray-800"
        >
          {savedNotes ? "Update" : "Save"} Notes
        </div>

        <button
            onClick={handleGenerateAI}
            disabled={loadingAI}
            className="px-1 py-1 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 cursor-pointer"
            >
            <img
                src={
                loadingAI
                    ? "https://cdn.neowin.com/news/images/uploaded/2024/08/1724861624_gemini_august_release_1.width-1600.format-webp.jpg" // image while generating
                    : "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.png" // default AI image
                }
                alt="AI"
                className="w-7 h-8"
            />
        </button>
      </div>
    </div>
    
  );
}
export default Notes;
