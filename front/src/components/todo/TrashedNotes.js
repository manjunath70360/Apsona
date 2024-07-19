import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Note from "./Note";
import "./index.css";

import CollapsibleExample from "../navbar";

function TrashedNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let isMounted = true; 

    const fetchNotes = async () => {
      const token = Cookies.get("token");
      try {
        const response = await fetch(
          "https://apsona-1.onrender.com/api/notes/trashed",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch trashed notes");
        }
        const data = await response.json();
        if (isMounted) {
          setNotes(data);
        }
      } catch (error) {
        console.error(error.message);
       
      }
    };

    fetchNotes();

    return () => {
      isMounted = false; 
    };
  }, []);

  const handleEmptyTrash = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(
        "https://apsona-1.onrender.com/api/notes/trashed/empty",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to empty trash");
      }
      setNotes([]);
    } catch (error) {
      console.error(error.message);
      alert("Failed to empty trash");
    }
  };

  return (
    <div className="app-container">
<CollapsibleExample />
      <div className="main-container">
        <button className="empty-trash-btn" onClick={handleEmptyTrash}>
          Empty Trash Now
        </button>
        <div className="notes-grid">
          {notes.map((note) => (
            <Note key={note.id} note={note} setNotes={setNotes} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrashedNotes;
