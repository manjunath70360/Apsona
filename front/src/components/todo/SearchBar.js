import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import "./index.css";

function SearchBar({ setNotes }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleSearch = async () => {
      const token = Cookies.get("token");

      if (!token) {
        console.error("Token is missing");
        return;
      }

      try {
        let url = `https://apsona-1.onrender.com/api/notes`;

        if (query) {
          url = `https://apsona-1.onrender.com/api/notes/search?query=${query}`;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Failed to fetch notes");
          return;
        }

        const data = await response.json();
        setNotes(data);
      
      } catch (error) {
        console.error("Error during search:", error);
      }
    };

    handleSearch();
  }, [query, setNotes]);

  return (
    <div className="search-form">
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        className="input-search"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-btn" onClick={() => setQuery(query)} type="button">
        Search
      </button>
    </div>
  );
}

export default SearchBar;
