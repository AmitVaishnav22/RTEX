import { useEffect, useState } from "react";
import { 
  MoreVertical, 
  Trash2, 
  Link as LinkIcon, 
  Globe, 
  Eye, 
  EyeOff,
  Copy,
  Lock,
  FireExtinguisher,
  PlaneLandingIcon,
  ALargeSmall
} from "lucide-react";
import { useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const BASE_PUBLIC_URL = "https://rtex.vercel.app/public/";

export default function LetterMoreOptions({ letter, onDelete, onPublish, onToggleVisibility,onSetPasscode,onsetAlias,getAlias }){;
  const [showMenu, setShowMenu] = useState(false);
  const [localVisibility, setLocalVisibility] = useState(letter.isPublic);
  const [showPasscodeField, setShowPasscodeField] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState(letter.passcode || "");
  const [openDNS, setOpenDNS] = useState(false);
  const [alias, setAlias] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const toggleTimeoutRef = useRef(null);
  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const fetchAlias = async () => {
      try {
        const response = await getAlias(letter.publicId);
        if (response) {
          setAlias(response);
        }
      } catch (error) {
        //console.error("Error fetching alias:", error);
      }
    }
    if (letter.publicId) {
      fetchAlias();
    }
  },[letter.publicId, getAlias]);

  const handleCopyLink = async () => {
    const publicUrl = `${BASE_PUBLIC_URL}${alias || letter.publicId}`;
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

  const handleSetPasscode = () => {
    // if (!passcodeInput.trim()) {
    //   alert("Please enter a passcode");
    //   return;
    // }
    onSetPasscode(letter._id, passcodeInput);
    setPasscodeInput("");
    setShowPasscodeField(false);
  }

  const handlesetAlias = ()=>{
    if (!customDomain.trim()) {
      alert("Please enter a valid alias");
      return;
    }
    onsetAlias(letter._id, customDomain);
    setCustomDomain("");
    setOpenDNS(false);
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
    <div className="relative z-50 w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-10 text-sm text-gray-900" >
      <div className="py-4 px-6">
        {letter.publicId ? (
          <div className="flex flex-col gap-2">
            <div className="px-2 text-l text-gray-500">Published Work
              <span className="text-blue-500 text-l font-semibold mr-2"> {letter.title}</span>
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
              <span className="truncate">
                {`${BASE_PUBLIC_URL}${alias || letter.publicId}`}
              </span>
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

            {/* Impressions Count */}
            <div className="flex items-center justify-between px-4 py-2">
              {/* Left side: Icon + Label */}
              <div className="flex items-center gap-2">
                <FireExtinguisher size={16} />
                <span>Impressions</span>
              </div>

              {/* Right side: Value */}
              <span className="font-semibold text-gray-800">{letter.impressions || 0}</span>
            </div>
            {/* Last Visited */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <PlaneLandingIcon size={16} />
                <span>Last Visited Globally</span>
              </div>
                  {letter.lastVisited ? (
                    <p className="text-sm text-gray-500">
                    {dayjs(letter.lastVisited).fromNow()}
                    </p>
                  ):(<span className="font-semibold">not recorded</span>)}
            </div>

            <div
              className="flex items-center justify-between px-4 py-2 cursor-pointer"
              onClick={() => {
                setOpenDNS(true);
                setCustomDomain(alias || "");
              }}
            >
              {/* Left side: Icon + Label */}
              <div className="flex items-center gap-2">
                <ALargeSmall size={16} />
                <span>Custom DNS</span>
              </div>

              {/* Right side: Value */}
              <span className="font-semibold text-red-800">NEW</span>
            </div>
            {openDNS && (
              <>
                <div className="absolute top-0 left-0 w-full h-full bg-white p-4 z-50">
                  <h2 className="text-lg font-semibold mb-4">Set Custom DNS</h2>

                  <div className="flex items-center">
                    {/* Non-editable base URL */}
                    <span className="text-gray-600 text-sm">{BASE_PUBLIC_URL}</span>

                    {/* Editable alias input */}
                    <input
                      type="text"
                      placeholder="your-custom-alias"
                      className="border rounded px-2 py-1 text-sm flex-1 ml-1"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setCustomDomain(letter.alias || ""); 
                        setOpenDNS(false); 
                      }}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handlesetAlias();
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Custom DNS feature is in beta. Ensure your alias is can be only setonce per workspace and follows our guidelines.<br/>
                      1. Alias must be unique across all users.<br/>
                      2. Only alphanumeric characters and hyphens are allowed.<br/>
                      3. Max length is 30 characters.<br/>
                      4. Once set, changing the alias may take up to 24 hours to propagate
                      due to DNS caching.<br/>
                      5. Misuse of custom aliases may lead to suspension of this feature.<br/>
                      6. We reserve the right to revoke custom aliases that violate our terms of service.<br/>
                      7. For any issues, contact support at rtex@tech.in<br/>
                    </p>
                  </div>
                </div>
              </>
              )}


            {/* Set passcode */}
            {showPasscodeField ? (
                <div className="flex flex-col gap-2 mt-2 ">
                  <input
                    type="text"
                    placeholder="Enter passcode"
                    className="border rounded px-2 py-1 text-sm"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                  />
                  
                  <button
                    onClick={handleSetPasscode}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded"
                    >
                    Save Passcode
                    </button>
                  </div>
                  ) : (
                    <button
                      onClick={() => setShowPasscodeField(true)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Lock size={14} /> {letter.passcode ? "Change Passcode" : "Set Passcode"}
                    </button>
                  )}
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

