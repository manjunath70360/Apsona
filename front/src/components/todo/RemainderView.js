import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Note from "./Note";
import "./index.css";

import CollapsibleExample from "../navbar";

function ReminderView() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let isMounted = true; 

    const fetchNotes = async () => {
      const token = Cookies.get("token");
      try {
        const response = await fetch(
          "https://apsona-1.onrender.com/api/notes/reminders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notes with reminders");
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

  return (
    <div className="app-container">
      <CollapsibleExample />
      <h1 className="header">Remainder</h1>
      <div className="notes-grid">
        {notes.map((note) => (
          <Note key={note._id} note={note} setNotes={setNotes} />
        ))}
      </div>
    </div>
  );
}

export default ReminderView;
