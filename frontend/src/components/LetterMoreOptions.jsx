import { useState } from 'react';
import { MoreVertical, Trash2, Link,Globe } from 'lucide-react';

const BASE_PUBLIC_URL = "https://rtex.vercel.app/public/";

export default function LetterMoreOptions({ letter, onDelete, onPublish }) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(prev => !prev);

  const handleCopyLink = async () => {
    const publicUrl = `${BASE_PUBLIC_URL}${letter.publicId}`;
    await navigator.clipboard.writeText(publicUrl);
    alert("Public link copied to clipboard!\n" + publicUrl);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className="p-1 rounded hover:bg-gray-700"
      >
        <MoreVertical size={18} />
      </button>

      {showMenu && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm text-gray-900">
          <div className="py-1">
            {letter.publicId!==null ? (
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <Link size={14} /> Copy Public Link
              </button>
            ) : (
              <button
                onClick={() => {
                  onPublish(letter._id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <Globe size={14}/>Publish
              </button>
            )}
            <button
              onClick={() => {
                onDelete(letter._id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
