import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import Note from "./Note";

import "./index.css"

function TagView() {
  const { tag } = useParams();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const token = Cookies.get("token");
      const response = await fetch(
        `https://apsona-1.onrender.com/api/notes/tag/${tag}`,
        {
          headers: { Authorization: token },
        }
      );
      const data = await response.json();
      setNotes(data);
    };

    fetchNotes();
  }, [tag]);

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <Note key={note._id} note={note} setNotes={setNotes} />
      ))}
    </div>
  );
}

export default TagView;