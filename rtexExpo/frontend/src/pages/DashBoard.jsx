import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../services/webSocketService.js";
import { Loader2 } from "lucide-react";
import { User2Icon } from "lucide-react";
import { LucideShare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
function Dashboard() {
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalExports, setTotalExports] = useState(0);

  const fetchLinks = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
      `https://rtex-1.onrender.com/expo/getlinks?page=${pageNum}`,
      {
        headers: {
            "x-rtex-key": "abc@1230",
        },
    }
    );
      setLinks(res.data.data || []);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotalExports(res.data.total || 0);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // New link published → just add
    socket.on("link:published", (newLink) => {
      console.log("🔵 new link published", newLink);
      setLinks((prev) => [newLink, ...prev]);
      setTotalExports((prev) => prev + 1);
    });

    // Update online user count
    socket.on("users:online", (count) => {
      setOnlineCount(count);
    })

    // Fetch total exports once
    socket.on("exports:total", (count) => {
      setTotalExports(count);
    })

    // Link visibility toggled
    socket.on("link:visibility", ({ publicId, isPublic }) => {
      setLinks((prev) =>
        prev.map((item) =>
          item.publicId === publicId ? { ...item, isPublic } : item
        )
      );
    });

    socket.on("link:count", ({ publicId, impressions }) => {
      setLinks((prev) =>
        prev.map((item) =>
          item.publicId === publicId ? { ...item, impressions } : item
        )
      );
    });

    // Alias updated
    socket.on("link:alias", ({ publicId, alias }) => {
      setLinks((prev) =>
        prev.map((item) =>
          item.publicId === publicId
            ? {
                ...item,
                link: `https://rtex.vercel.app/public/${alias}`,
              }
            : item
        )
      );
    });

    // Letter changed
    socket.on("letter:changed", ({ publicId, title }) => {
      console.log("item recived",publicId,title)
      setLinks((prev) =>
        prev.map((item) =>
          item.publicId === publicId ? { ...item, title, updatedAt: new Date().toISOString() } : item
        )
      );
    });
    socket.on("link:visibility", ({ publicId, isPublic }) => {
      setLinks((prev) =>
        prev.map((item) =>
          item.publicId === publicId ? { ...item, isPublic } : item
        )
      );
    });

    // Letter deleted
    socket.on("letter:deleted", ({ publicId }) => {
      setLinks((prev) => prev.filter((item) => item.publicId !== publicId));
      setTotalExports((prev) => Math.max(0, prev - 1));
    });

    return () => {
      socket.off("link:published");
      socket.off("link:visibility");
      socket.off("link:alias");
      socket.off("letter:changed");
      socket.off("letter:deleted");
      socket.off("users:online");
      socket.off("exports:total")
    };
  }, []);

  useEffect(() => {
    fetchLinks(page);
  }, [page]);

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

    return (
    <div className="min-h-screen bg-black text-blue-300 p-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl text-blue-400">RTEX public dashboard</h1>
            <div className="flex items-center gap-2">
              <span>
                <div>
                  <LucideShare className="h-6 w-6 text-blue-400 inline-block mr-1" />
                  <span className="text-sm text-gray-400">{totalExports} Total Exports </span>
                </div>
              </span>
              <span>
                <div>
                  <User2Icon className="h-6 w-6 text-blue-400 inline-block ml-1 mr-1" />
                  <span className="text-sm text-gray-400">{onlineCount} Online</span>
                </div>
              </span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-gray-400">Live Updates</span>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
              <span className="ml-3 text-gray-400">Loading data...</span>
            </div>
          )}

          {error && (
            <p className="text-center text-red-400 font-medium">{error}</p>
          )}

          {!loading && !error && (
            <>
              {/* Table Layout */}
              <div className="overflow-x-auto">
                <table className="w-full border border-blue-500 rounded-l shadow-lg bg-gray-900">
                  <thead className="bg-blue-800/40 text-blue-300">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Link</th>
                      <th className="px-4 py-3 text-left">Impressions</th>
                      <th className="px-4 py-3 text-left">Visibility</th>
                      <th className="px-4 py-3 text-left">Encryption</th>
                      <th className="px-4 py-3 text-left">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((item, idx) => (
                      <tr
                        key={item.publicId}
                        className="border-t border-blue-500 hover:bg-gray-800/60 transition"
                      >
                        <td className="px-4 py-3">{(page - 1) * links.length + idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.title || "Untitled"}</td>
                        <td className="px-4 py-3">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            Open →
                          </a>
                        </td>
                        <td className="px-4 py-3">{item.impressions || 0}</td>
                        <td className="px-4 py-3">
                          {item.isPublic ? (
                            <span className="px-2 py-1 text-green-500 text-xs font-bold">
                              Public
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-red-500 text-xs font-bold">
                              Private
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.encrypted ? (
                            <span className="px-2 py-1 text-red-500 text-xs font-bold">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-green-500 text-xs font-bold">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-4 mt-5">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-blue-500"
                >
                  Prev
                </button>
                <span className="text-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-blue-500"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

  export default Dashboard;
