"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./daftar-jadwal.module.css";

export default function ListJadwal() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/jadwal-sertifikasi/daftar-jadwal", {
          cache: "no-store"
        });
        if (!res.ok) throw new Error("Fetch gagal");
        const result = await res.json();
        setJadwal(result || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data jadwal sertifikasi");
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  const filteredJadwal = jadwal.filter((item) =>
    item.nama_skema?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_tuk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.asesor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.trainer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJadwal.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedJadwal = filteredJadwal.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // ✅ Extracted from nested ternary into independent statement
  const renderContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }

    if (jadwal.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data jadwal sertifikasi.</div>;
    }

    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari skema, TUK, asesor, atau trainer"
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
          Menampilkan {filteredJadwal.length > 0 ? startIndex + 1 : 0} hingga{" "}
          {Math.min(endIndex, filteredJadwal.length)} dari {filteredJadwal.length} data
        </div>

        {/* Table */}
        {filteredJadwal.length === 0 ? (
          <div className={styles.emptyMessage}>
            Tidak ada hasil pencarian untuk "{searchQuery}"
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Skema Sertifikasi</th>
                  <th>Tanggal</th>
                  <th>TUK</th>
                  <th>Asesor</th>
                  <th>Trainer</th>
                </tr>
              </thead>
              <tbody>
                {displayedJadwal.map((item, index) => (
                  <tr key={item.id_jadwal}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <Link
                        href={`/user/sertifikasi/jadwal-sertifikasi/detail-jadwal/${item.id_jadwal}`}
                        className={styles.schemeLink}
                      >
                        {item.nama_skema}
                      </Link>
                    </td>
                    <td>
                      {formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}
                    </td>
                    <td>{item.nama_tuk}</td>
                    <td>{item.asesor}</td>
                    <td>{item.trainer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredJadwal.length > 0 && totalPages > 1 && (
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
        <Link href="/user/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Daftar Jadwal Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Jadwal Sertifikasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Daftar lengkap jadwal pelaksanaan sertifikasi.
          </p>
        </div>
      </section>

      {/* TAB */}
      <div className={styles.tabContainer}>
        <Link
          href="/user/sertifikasi/jadwal-sertifikasi/daftar-jadwal"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Jadwal Training & Sertifikasi
        </Link>
        <Link
          href="/user/sertifikasi/jadwal-sertifikasi/daftar-peserta"
          className={styles.tabItem}
        >
          Daftar Peserta
        </Link>
      </div>

      {/* Content Section */}
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