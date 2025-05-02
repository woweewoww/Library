import React, { useState, useEffect } from "react";
import "./Library.css";

const BASE_URL = "https://openlibrary.org/search.json";

const Library = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("self");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authors, setAuthors] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const BookSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}?q=${searchQuery}&page=${page}`);
      const data = await res.json();

      const mappedBooks = data.docs.map((book) => ({
        title: book.title,
        authors: book.author_name?.join(", ") || "Unknown",
        authorArray: book.author_name || [],
        date: book.first_publish_year || "N/A",
        coverId: book.cover_i,
      }));

      // Set distinct authors and years for filters
      setAuthors([...new Set(mappedBooks.flatMap((b) => b.authorArray))]);
      setYears([
        ...new Set(mappedBooks.map((b) => b.date).filter((y) => y !== "N/A")),
      ]);

      setBooks(mappedBooks);
    } catch (err) {
      setError("Failed to fetch books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    BookSearch();
  }, [page, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    BookSearch();
  };

  const filteredBooks = books.filter((book) => {
    return (
      (selectedAuthor ? book.authors.includes(selectedAuthor) : true) &&
      (selectedYear ? book.date === selectedYear : true)
    );
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const comparison = a.title.localeCompare(b.title);
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="container">
      <h1>📚 Book Finder</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search Books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          Toggle Order ({sortOrder})
        </button>
      </form>

      <div className="filters">
        <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
          <option value="">All Authors</option>
          {authors.map((author, i) => (
            <option key={i} value={author}>
              {author}
            </option>
          ))}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All Years</option>
          {years.sort().map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="book-grid">
        {sortedBooks.map((book, index) => (
          <div key={index} className="book-card">
            {book.coverId ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                alt={book.title}
              />
            ) : (
              <div className="placeholder">No Cover</div>
            )}
            <h3>{book.title}</h3>
            <p>{book.authors}</p>
            <p><em>{book.date}</em></p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Library;
