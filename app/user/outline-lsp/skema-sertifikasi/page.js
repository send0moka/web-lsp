"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./skema-list.module.css";

export default function SchemaCertification() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/skema-sertifikasi");
        if (!res.ok) throw new Error("Fetch gagal");

        const data = await res.json();
        setSchemes(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data skema sertifikasi");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // Filter schemes berdasarkan search query
  const filteredSchemes = schemes.filter((scheme) =>
    scheme.nama_skema.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.jenis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSchemes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedSchemes = filteredSchemes.slice(startIndex, endIndex);

  // Reset ke page 1 ketika search berubah
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Reset ke page 1 ketika rows per page berubah
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Render content based on state
  const renderContent = () => {
    if (error) {
      return <div className={styles.errorMessage}>{error}</div>;
    }

    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }

    if (schemes.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data skema sertifikasi.</div>;
    }

    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama skema atau jenis"
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

        {/* Results info */}
        <div className={styles.resultsInfo}>
          Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredSchemes.length)} dari {filteredSchemes.length} data
        </div>

        {/* Table */}
        {filteredSchemes.length === 0 ? (
          <div className={styles.emptyMessage}>Tidak ada hasil pencarian untuk "{searchQuery}"</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Skema</th>
                  <th>Nama Skema</th>
                  <th>Jenis</th>
                  <th>Jumlah Unit</th>
                </tr>
              </thead>
              <tbody>
                {displayedSchemes.map((scheme, index) => (
                  <tr key={scheme.id_skema}>
                    <td>{startIndex + index + 1}</td>
                    <td>{scheme.kode_skema}</td>
                    <td>
                      <Link href={`/user/outline-lsp/skema-sertifikasi/${scheme.id_skema}`} className={styles.schemeLink}>
                        {scheme.nama_skema}
                      </Link>
                    </td>
                    <td>{scheme.jenis}</td>
                    <td>{scheme.jumlah_unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredSchemes.length > 0 && totalPages > 1 && (
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
        <span>Skema Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Skema Sertifikasi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Daftar lengkap skema sertifikasi yang tersedia.</p>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {renderContent()}
        </div>
      </section>
    </>
  );
}