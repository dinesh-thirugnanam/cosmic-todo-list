"use client";

import { useState, useEffect } from "react";
import { updateNode } from "../../lib/actions";
import { X } from "lucide-react";

export default function Header({ nodes = [],setNodeClicked, selectedNodeId, setSelectedNodeId, listName, onSort, onDeleteNode }) {
  const [currentListName, setCurrentListName] = useState(listName);

  useEffect(() => {
    setCurrentListName(listName);
  }, [listName]);

  const handleListNameChange = async (e) => {
    const newName = e.target.textContent;
    if (newName && newName !== currentListName) {
      setCurrentListName(newName);
      if (selectedNodeId) {
        try {
          const result = await updateNode(selectedNodeId, { listName: newName });
          if (!result.success) {
            console.error(result.error);
            setCurrentListName(listName); // Revert on error
          }
        } catch (err) {
          console.error("Failed to update list name:", err);
          setCurrentListName(listName);
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-between py-5">
      <div className="flex items-center">
        <img
          src="/sun.svg"
          alt="Sun Icon"
          className="w-10 mr-3 animate-spin"
          style={{ animation: "spin 5s linear infinite" }}
        />
        <h2
          contentEditable
          onBlur={handleListNameChange}
          className="text-2xl font-bold outline-none"
          suppressContentEditableWarning
        >
          {currentListName}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {nodes.length > 0 ? (
          <select
            value={selectedNodeId || ""}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-gray-900 text-white border border-cyan-400 rounded px-2 py-1 focus:outline-none focus:border-cyan-300"
          >
            {nodes.map((node) => (
              <option key={node._id} value={node._id}>
                {node.listName}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-gray-500">No lists available</span>
        )}
        <div className="relative group">
          <button className="bg-gray-900 text-white border border-cyan-400 rounded px-3 py-1 hover:bg-cyan-400 hover:text-black">
            Sort Tasks
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-400 rounded shadow-lg hidden group-hover:block">
            <a
              href="#"
              onClick={() => onSort("alpha")}
              className="block px-4 py-2 text-white hover:bg-cyan-400 hover:text-black"
            >
              Alphabetical
            </a>
            <a
              href="#"
              onClick={() => onSort("date")}
              className="block px-4 py-2 text-white hover:bg-cyan-400 hover:text-black"
            >
              Creation Date
            </a>
          </div>
        </div>
        <button
          onClick={onDeleteNode}
          className="bg-red-500 text-white rounded px-3 py-1 hover:bg-red-400"
        >
          Delete List
        </button>
        <button
          onClick={()=>setNodeClicked([false,null])}
          className="bg-red-500 text-white rounded px-3 py-1 hover:bg-red-400"
        >
          <X className="rotate-0 hover:rotate-90 transition-all ease-out"/>
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}