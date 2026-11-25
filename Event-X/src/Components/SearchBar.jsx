
import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        search: search.trim(),
        category
      });
    }
  };

  return (
    <div className="search-container">

      <div className="search-input-box">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search events by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>

      <div className="search-category-box">
        <SlidersHorizontal size={19} />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Music">Music</option>
          <option value="Technology">Technology</option>
          <option value="Sports">Sports</option>
          <option value="Education">Education</option>
          <option value="Business">Business</option>
          <option value="Cultural">Cultural</option>
          <option value="Entertainment">Entertainment</option>
        </select>
      </div>

      <button
        className="search-button"
        onClick={handleSearch}
      >
        <Search size={18} />
        Search
      </button>

    </div>
  );
}

export default SearchBar;
