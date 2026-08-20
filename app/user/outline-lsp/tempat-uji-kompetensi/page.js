"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./tempat-uji-kompetensi.module.css";

export default function TempatUjiKompetensi() {
  const [tuks, setTuks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTuks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tempat-uji-kompetensi");
        if (!res.ok) throw new Error("Fetch gagal");
        const data = await res.json();
        setTuks(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data tempat uji kompetensi");
      } finally {
        setLoading(false);
      }
    };

    fetchTuks();
  }, []);

  const filteredTuks = tuks.filter((tuk) =>
    tuk.nama_tuk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTuks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedTuks = filteredTuks.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  // ✅ Extracted from nested ternary into independent statement
  const renderContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }

    if (tuks.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Tidak ada data tempat uji kompetensi.
        </div>
      );
    }

    return (
      <div className={styles.detailContainer}>
        {/* Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama TUK"
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.rowsPerPageContainer}>
            <label htmlFor="rowsPerPage" className={styles.rowsLabel}>
              Tampilkan:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className={styles.rowsSelect}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Info */}
        <div className={styles.resultsInfo}>
          Menampilkan {startIndex + 1} hingga{" "}
          {Math.min(endIndex, filteredTuks.length)} dari{" "}
          {filteredTuks.length} data
        </div>

        {/* Table */}
        {filteredTuks.length === 0 ? (
          <div className={styles.emptyMessage}>
            Tidak ada hasil pencarian
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode TUK</th>
                  <th>Nama</th>
                  <th>Jenis</th>
                  <th>Jumlah Skema</th>
                </tr>
              </thead>
              <tbody>
                {displayedTuks.map((tuk, index) => (
                  <tr key={tuk.id_tuk}>
                    <td>{startIndex + index + 1}</td>
                    <td>{tuk.kode_tuk}</td>
                    <td>
                      <Link
                        href={`/user/outline-lsp/tempat-uji-kompetensi/${tuk.id_tuk}`}
                        className={styles.schemeLink}
                      >
                        {tuk.nama_tuk}
                      </Link>
                    </td>
                    <td>{tuk.jenis}</td>
                    <td>{tuk.jumlah_skema}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredTuks.length > 0 && totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              Sebelumnya
            </button>
            <div className={styles.pageInfo}>
              Halaman {currentPage} dari {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationBtn}
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Tempat Uji Kompetensi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Tempat Uji Kompetensi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Daftar tempat uji kompetensi yang tersedia.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {/* ✅ Single call replaces the nested ternary */}
          {renderContent()}
        </div>
      </section>
    </>
  );
}