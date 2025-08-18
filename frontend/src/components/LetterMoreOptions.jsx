import { useState } from "react";
import { 
  MoreVertical, 
  Trash2, 
  Link as LinkIcon, 
  Globe, 
  Eye, 
  EyeOff,
  Copy
} from "lucide-react";
import { useRef } from "react";

const BASE_PUBLIC_URL = "https://rtex.vercel.app/public/";

export default function LetterMoreOptions({ letter, onDelete, onPublish, onToggleVisibility }){;
  const [showMenu, setShowMenu] = useState(false);
  const [localVisibility, setLocalVisibility] = useState(letter.isPublic);
  const toggleTimeoutRef = useRef(null);
  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleCopyLink = async () => {
    const publicUrl = `${BASE_PUBLIC_URL}${letter.publicId}`;
    await navigator.clipboard.writeText(publicUrl);
    alert("Public link copied to clipboard!\n" + publicUrl);
    setShowMenu(false);
  };

  const handleToggleVisibility = async () => {
    const newVisibility = !localVisibility;
    setLocalVisibility(newVisibility);

    if (toggleTimeoutRef.current) {
      clearTimeout(toggleTimeoutRef.current);
    }
    toggleTimeoutRef.current = setTimeout(() => {
      onToggleVisibility(letter._id);
    }, 2500);
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className="p-1 rounded hover:bg-gray-700"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={() => setShowMenu(false)}
    ></div>

    {/* Modal Box */}
    <div className="relative z-50 w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-10 text-sm text-gray-900">
      <div className="py-4 px-6">
        {letter.publicId ? (
          <div className="flex flex-col gap-2">
            <div className="px-2 text-xs text-gray-500">Published Work
              <span className="text-blue-500 text-xs font-semibold mr-2"> {letter.title}</span>
              <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    localVisibility
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {localVisibility ? "Public" : "Private"}
                </span>  
            </div>

            <div className="flex items-center justify-between bg-gray-100 rounded px-2 py-1 text-xs">
              <span className="truncate">{`${BASE_PUBLIC_URL}${letter.publicId}`}</span>
              <button
                onClick={handleCopyLink}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy size={14} />
              </button>
            </div>

            {/* Toggle visibility */}
            <button
              onClick={handleToggleVisibility}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              {localVisibility ? (
                <>
                  <EyeOff size={14} /> Set Private
                </>
              ) : (
                <>
                  <Eye size={14} /> Set Public
                </>
              )}
            </button>

            {/* Impressions Count
            <div className="flex items-center justify-between px-4 py-2 text-gray-600 text-sm">
              <span>Impressions</span>
              <span className="font-semibold">{letter.impressions || 0}</span>
            </div> */}
          </div>
        ) : (
          <button
            onClick={() => {
              onPublish(letter._id);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <Globe size={14} /> Publish
          </button>
        )}

        {/* Delete option */}
        <button
          onClick={() => {
            onDelete(letter._id);
            setShowMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center gap-2 mt-2"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

