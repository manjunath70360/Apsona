import React from "react";
import { FaTrash, FaArchive } from "react-icons/fa";
import Cookies from "js-cookie";
import "./index.css";

function Note({ note, setNotes }) {
  const handleDelete = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `https://apsona-1.onrender.com/api/notes/${note.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleArchive = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `https://apsona-1.onrender.com/api/notes/${note.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isArchived: !note.isArchived }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update note: ${errorData.error || 'Unknown error'}`);
      }
      

      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === note.id ? { ...n, isArchived: !n.isArchived } : n
        )
      );
    } catch (error) {
      console.error('Failed to update note:', error.message);
      
    }
  };
  

  return (
    <div className="note" style={{ background: note.color }}>
      <div className="title-time">
        <h3 className="title">{note.title}</h3>
        {note.createdAt ? <p className="time">{note.createdAt}</p>:""}
      </div>
      <p className="para">{note.content}</p>
      <div className="note-actions">
     
        <FaTrash onClick={handleDelete} className="icon" />
        <FaArchive onClick={handleArchive} className="icon" />
      </div>
    </div>
  );
}

export default Note;
