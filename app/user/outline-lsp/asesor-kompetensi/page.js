"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./asesor-kompetensi.module.css";

export default function AsesorKompetensi() {
  const [asesor, setAsesor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAsesor = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/asesor-kompetensi");
        if (!res.ok) throw new Error("Fetch gagal");

        const data = await res.json();
        setAsesor(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data asesor kompetensi");
      } finally {
        setLoading(false);
      }
    };

    fetchAsesor();
  }, []);

  // Filter skema berdasarkan search query
  const filteredAsesor = asesor.filter((asesor) =>
    asesor.nama_asesor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asesor.no_registrasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAsesor.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedAsesor = filteredAsesor.slice(startIndex, endIndex);

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

    if (asesor.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data asesor kompetensi.</div>;
    }

    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama asesor atau no registrasi"
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
          Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredAsesor.length)} dari {filteredAsesor.length} data
        </div>

        {/* Table */}
        {filteredAsesor.length === 0 ? (
          <div className={styles.emptyMessage}>Tidak ada hasil pencarian untuk "{searchQuery}"</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>No Registrasi</th>
                  <th>Nama Asesor</th>                      
                  <th>Jumlah Skema</th>
                </tr>
              </thead>
              <tbody>
                {displayedAsesor.map((asesor, index) => (
                  <tr key={asesor.id_asesor}>
                    <td>{startIndex + index + 1}</td>
                    <td>{asesor.no_registrasi}</td>
                    <td>
                      <Link href={`/user/outline-lsp/asesor-kompetensi/${asesor.id_asesor}`} className={styles.asesorLink}>
                        {asesor.nama_asesor}
                      </Link>
                    </td>
                    <td>{asesor.jumlah_skema}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAsesor.length > 0 && totalPages > 1 && (
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
        <span>Asesor Kompetensi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Asesor Kompetensi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Daftar lengkap asesor kompetensi yang tersedia.</p>
        </div>
      </section>

      {/* TAB */}
      <div className={styles.tabContainer}>
        <Link
          href="/user/outline-lsp/asesor-kompetensi/grid"
          className={styles.tabItem}
        >
          Asesor Kompetensi
        </Link>
        
        <Link
          href="/user/outline-lsp/asesor-kompetensi"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Asesor
        </Link>
      </div>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {renderContent()}
        </div>
      </section>
    </>
  );
}