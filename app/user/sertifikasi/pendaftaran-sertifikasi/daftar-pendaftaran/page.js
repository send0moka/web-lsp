"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./daftar-pendaftaran.module.css";

export default function DaftarPendaftaran() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPendaftaran = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pendaftaran-sertifikasi/daftar-pendaftaran");
      if (!res.ok) throw new Error("Fetch gagal");
      const result = await res.json();
      setPendaftaran(result || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pendaftaran sertifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendaftaran();
  }, []);

  const filteredPendaftaran = pendaftaran.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.npk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.seksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.plant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.pic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_skema?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.standard?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.lembaga?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPendaftaran.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedPendaftaran = filteredPendaftaran.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }

    if (pendaftaran.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data pendaftaran sertifikasi.</div>;
    }

    return (
      <div className={styles.detailContainer}>

        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama, NPK, seksi, perusahaan, plant, PIC, skema, standard, atau lembaga..."
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
          Menampilkan {filteredPendaftaran.length > 0 ? startIndex + 1 : 0} hingga{" "}
          {Math.min(endIndex, filteredPendaftaran.length)} dari {filteredPendaftaran.length} data
        </div>

        {/* Table */}
        {filteredPendaftaran.length === 0 ? (
          <div className={styles.emptyMessage}>
            Tidak ada hasil pencarian untuk "{searchQuery}"
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>NPK</th>
                  <th>Seksi</th>
                  <th>Perusahaan</th>
                  <th>Plant</th>
                  <th>PIC</th>
                  <th>Skema Sertifikasi</th>
                  <th>Standard</th>
                  <th>Lembaga</th>
                </tr>
              </thead>
              <tbody>
                {displayedPendaftaran.map((item, index) => (
                  <tr key={item.id_pendaftaran}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.npk}</td>
                    <td>{item.seksi || "-"}</td>
                    <td>{item.company || "-"}</td>
                    <td>{item.plant || "-"}</td>
                    <td>{item.pic || "-"}</td>
                    <td>{item.nama_skema}</td>
                    <td>{item.standard || "-"}</td>
                    <td>{item.lembaga || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPendaftaran.length > 0 && totalPages > 1 && (
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
        <span>Daftar Pendaftaran Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Pendaftaran Sertifikasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Daftar lengkap peserta pendaftaran sertifikasi.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {renderContent()}
        </div>
      </section>
    </>
  );
}