import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Note from "./Note";
import SearchBar from "./SearchBar";
import "./index.css";
import { v4 as uuidv4 } from "uuid"; 


import { HuePicker } from 'react-color';



const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState("#ffffff");
  const [reminder, setReminder] = useState("");

  useEffect(() => {

    fetchNotes();
 
    
  }, []);

  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };


  const fetchNotes = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("https://apsona-1.onrender.com/api/notes", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setNotes(data);
      } else {
        console.error("Failed to fetch notes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const newNote = {
        id: uuidv4(),
        title,
        content,
        tags,
        color,
        reminder
      };

      const response = await fetch("https://apsona-1.onrender.com/api/notes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        fetchNotes()
        setTitle("");
        setContent("");
        setTags([]);
        setColor("#ffffff");
        setReminder("");
      } else {
        console.error("Failed to create note:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
    
  };


  return (
    <div className="main-content">
     
      <div className="create-note">
      <SearchBar setNotes={setNotes} />
        <form className="create-form" onSubmit={handleCreate}>
          <input
           className="input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
           className="input"
            type="text"
            placeholder="Tags (comma separated)"
            value={tags.join(",")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((tag) => tag.trim()))
            }
          />
          <p className="color-head">Choose color:</p>
         
         
    <div>
      <HuePicker
        color={color}
        style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: color,
          color: '#000',
        }}
        onChangeComplete={handleChangeComplete}
        width={300} 
      />
      <div>
       <p className="picked-color"  style={{color:color}}>{color}</p>
      </div>
    </div>
          <input
            type="datetime-local"
            className="input"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
          />
          <button type="submit">Create Note</button>
        </form>
      </div>
      <div className="notes-grid">
        {notes.map((note) => {
          return <Note key={note.id} note={note} setNotes={setNotes} />;
        })}
      </div>
    </div>
  );
};

export default Notes;
