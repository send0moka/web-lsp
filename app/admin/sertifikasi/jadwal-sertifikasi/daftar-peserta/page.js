"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./daftar-peserta.module.css";

export default function DaftarPeserta() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data peserta (termasuk yang belum dapat jadwal)
  const fetchPeserta = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jadwal-sertifikasi/daftar-peserta", {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Fetch gagal");
      const result = await res.json();
      setPeserta(result || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data peserta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  // Filter peserta berdasarkan search query
  const filteredPeserta = peserta.filter((item) =>
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.npk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.seksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.plant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_skema?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPeserta.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedPeserta = filteredPeserta.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return null;
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

  // Render tanggal dengan status jika belum dapat jadwal
  const renderTanggal = (item) => {
    if (!item.id_jadwal) {
      return <span className={styles.noJadwalText}>Peserta belum mendapatkan jadwal</span>;
    }
    if (item.tanggal_mulai && item.tanggal_selesai) {
      return `${formatDate(item.tanggal_mulai)} - ${formatDate(item.tanggal_selesai)}`;
    }
    return "-";
  };

  // Fungsi untuk render konten utama (menghilangkan nested ternary)
  const renderMainContent = () => {
    // Jika loading
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }
    
    // Jika tidak ada data peserta
    if (peserta.length === 0) {
      return <div className={styles.emptyMessage}>Belum ada data peserta pendaftaran.</div>;
    }
    
    // Jika ada data peserta
    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama, NPK, seksi, perusahaan, plant, atau skema..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Cari peserta"
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
              aria-label="Jumlah baris per halaman"
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
          Menampilkan {filteredPeserta.length > 0 ? startIndex + 1 : 0} hingga{' '}
          {Math.min(endIndex, filteredPeserta.length)} dari {filteredPeserta.length} data
        </div>

        {/* Table - nested ternary kedua juga diekstrak */}
        {renderTableContent()}

        {/* Pagination */}
        {filteredPeserta.length > 0 && totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
              aria-label="Halaman sebelumnya"
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
              aria-label="Halaman berikutnya"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    );
  };

  // Fungsi untuk render konten tabel (menghilangkan nested ternary kedua)
  const renderTableContent = () => {
    // Jika tidak ada hasil pencarian
    if (filteredPeserta.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Tidak ada hasil pencarian untuk "{searchQuery}"
        </div>
      );
    }
    
    // Jika ada hasil pencarian
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Peserta</th>
              <th>NPK</th>
              <th>Seksi</th>
              <th>Perusahaan</th>
              <th>Plant</th>
              <th>Skema Sertifikasi</th>
              <th>TUK</th>
              <th>Asesor</th>
              <th>Trainer</th>
              <th>Status Jadwal</th>
            </tr>
          </thead>
          <tbody>
            {displayedPeserta.map((item, index) => (
              <tr 
                key={item.id_pendaftaran} 
                className={item.id_jadwal ? "" : styles.noJadwalRow}
              >
                <td>{startIndex + index + 1}</td>
                <td className={styles.namaCell}>{item.nama}</td>
                <td>{item.npk}</td>
                <td>{item.seksi || "-"}</td>
                <td>{item.company || "-"}</td>
                <td>{item.plant || "-"}</td>
                <td className={styles.skemaCell}>{item.nama_skema}</td>
                <td>{item.nama_tuk}</td>
                <td>{item.asesor}</td>
                <td>{item.trainer}</td>
                <td className={styles.tanggalCell}>
                  {renderTanggal(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Daftar Peserta</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Daftar Peserta Sertifikasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Daftar lengkap peserta pendaftaran sertifikasi beserta jadwal pelaksanaannya.
          </p>
        </div>
      </section>

      {/* TAB */}
      <div className={styles.tabContainer}>
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi"
          className={styles.tabItem}
        >
          Buat Jadwal Training & Sertifikasi   
        </Link>
        
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-jadwal"
          className={styles.tabItem}
        >
          Daftar Jadwal Training & Sertifikasi
        </Link>

        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-peserta"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Peserta
        </Link>
      </div>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {renderMainContent()}
        </div>
      </section>
    </>
  );
}