import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Note from "./Note";
import CollapsibleExample from "../navbar";
import "./index.css";

function ArchivedNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const token = Cookies.get("token");
      const response = await fetch(
        "https://apsona-1.onrender.com/api/notes/archived",
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      
      if (!response.ok) {
       
        console.error("Failed to fetch archived notes:", await response.text());
        return;
      }

      const data = await response.json();
    
      setNotes(data);
    };

    fetchNotes();
  }, []);

  return (
  
      <div className="app-container">
        <CollapsibleExample />
        <h1 className="header">Archived</h1>
     <div className="main-container">
     <div className="notes-grid">
        {notes.map((note) => (
          <Note key={note.id} note={note} setNotes={setNotes} /> 
        ))}
      </div>
     </div>
      </div>

  );
}

export default ArchivedNotes;
