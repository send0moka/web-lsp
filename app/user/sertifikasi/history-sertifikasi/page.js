"use client";

import Link from "next/link";
import styles from "./history-sertifikasi.module.css";
import { useEffect, useState, useRef } from "react";

export default function HistorySertifikasi() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterSkema, setFilterSkema] = useState([]);
  const [filterBulan, setFilterBulan] = useState([]);
  const [filterTahun, setFilterTahun] = useState([]);
  const [filterPlant, setFilterPlant] = useState([]);
  const [filterSeksi, setFilterSeksi] = useState([]);
  const [filterHasil, setFilterHasil] = useState("");

  const normalizeText = (text) => {
    return text?.trim().toLowerCase() || "";
  };

  const uniqueSkema = [
    ...new Map(
      history.map(item => [
        normalizeText(item.nama_skema),
        item.nama_skema
      ])
    ).values()
  ];

  const uniquePlant = [
    ...new Map(
      history.map(item => [
        normalizeText(item.plant),
        item.plant
      ])
    ).values()
  ];

  const uniqueSeksi = [
    ...new Map(
      history.map(item => [
        normalizeText(item.seksi),
        item.seksi
      ])
    ).values()
  ];

  const [showSkemaFilter, setShowSkemaFilter] = useState(false);
  const [showPlantFilter, setShowPlantFilter] = useState(false);
  const [showSeksiFilter, setShowSeksiFilter] = useState(false);
  const [showBulanFilter, setShowBulanFilter] = useState(false);
  const [showTahunFilter, setShowTahunFilter] = useState(false);

  const skemaRef = useRef(null);
  const plantRef = useRef(null);
  const seksiRef = useRef(null);
  const bulanRef = useRef(null);
  const tahunRef = useRef(null);

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const toggleSkema = (skema) => {
    if (filterSkema.includes(skema)) {
      setFilterSkema(filterSkema.filter(s => s !== skema));
    } else {
      setFilterSkema([...filterSkema, skema]);
    }
    setCurrentPage(1);
  };

  const togglePlant = (plant) => {
    if (filterPlant.includes(plant)) {
      setFilterPlant(filterPlant.filter(p => p !== plant));
    } else {
      setFilterPlant([...filterPlant, plant]);
    }
    setCurrentPage(1);
  };

  const toggleSeksi = (seksi) => {
    if (filterSeksi.includes(seksi)) {
      setFilterSeksi(filterSeksi.filter(s => s !== seksi));
    } else {
      setFilterSeksi([...filterSeksi, seksi]);
    }
    setCurrentPage(1);
  };

  const toggleBulan = (bulan) => {
    if (filterBulan.includes(bulan)) {
      setFilterBulan(filterBulan.filter(b => b !== bulan));
    } else {
      setFilterBulan([...filterBulan, bulan]);
    }
    setCurrentPage(1);
  };

  const toggleTahun = (tahun) => {
    if (filterTahun.includes(tahun)) {
      setFilterTahun(filterTahun.filter(t => t !== tahun));
    } else {
      setFilterTahun([...filterTahun, tahun]);
    }
    setCurrentPage(1);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history-sertifikasi");
      if (!res.ok) throw new Error("Fetch gagal");
      const result = await res.json();
      setHistory(result || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data history sertifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skemaRef.current && !skemaRef.current.contains(event.target)) {
        setShowSkemaFilter(false);
      }
      if (plantRef.current && !plantRef.current.contains(event.target)) {
        setShowPlantFilter(false);
      }
      if (seksiRef.current && !seksiRef.current.contains(event.target)) {
        setShowSeksiFilter(false);
      }
      if (bulanRef.current && !bulanRef.current.contains(event.target)) {
        setShowBulanFilter(false);
      }
      if (tahunRef.current && !tahunRef.current.contains(event.target)) {
        setShowTahunFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🔎 Search Filter - DITINGKATKAN untuk mencakup semua kolom yang diminta
  const filteredHistory = history.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchSearch = searchQuery === "" ||
      item.nama?.toLowerCase().includes(searchLower) ||
      item.npk?.toLowerCase().includes(searchLower) ||
      item.seksi?.toLowerCase().includes(searchLower) ||
      item.company?.toLowerCase().includes(searchLower) ||
      item.plant?.toLowerCase().includes(searchLower) ||
      item.nama_skema?.toLowerCase().includes(searchLower) ||
      item.standard?.toLowerCase().includes(searchLower) ||
      item.lembaga?.toLowerCase().includes(searchLower) ||
      item.nama_tuk?.toLowerCase().includes(searchLower) ||
      item.nama_asesor?.toLowerCase().includes(searchLower) ||
      item.hasil?.toLowerCase().includes(searchLower);

    const date = item.tanggal_selesai ? new Date(item.tanggal_selesai) : null;

    const matchBulan = filterBulan.length > 0 && date
      ? filterBulan.includes(date.getMonth() + 1)
      : filterBulan.length === 0;

    const matchTahun = filterTahun.length > 0 && date
      ? filterTahun.includes(date.getFullYear())
      : filterTahun.length === 0;

    const matchPlant = filterPlant.length > 0
      ? filterPlant.includes(item.plant)
      : true;

    const matchSeksi = filterSeksi.length > 0
      ? filterSeksi.includes(item.seksi)
      : true;

    const matchSkema = filterSkema.length > 0
      ? filterSkema.includes(item.nama_skema)
      : true;

    const matchHasil = filterHasil
      ? item.hasil?.toLowerCase() === filterHasil.toLowerCase()
      : true;

    return matchSearch && matchBulan && matchTahun && matchSkema && matchPlant && matchSeksi && matchHasil;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedHistory = filteredHistory.slice(startIndex, endIndex);

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
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fungsi untuk render hasil
  const renderHasil = (hasilValue) => {
    if (hasilValue === "kompeten") {
      return <span className={styles.historyKompeten}>Kompeten</span>;
    }
    return <span className={styles.historyBelum}>Belum Kompeten</span>;
  };

  // Fungsi untuk render sertifikat - HANYA LIHAT, TIDAK ADA INPUT
  const renderSertifikat = (item) => {
    if (item.hasil?.toLowerCase() !== "kompeten") {
      return <span className={styles.noAction}>-</span>;
    }
    
    if (item.file_sertifikat) {
      return (
        <Link
          href={item.file_sertifikat}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnSuccess}
        >
          Lihat Sertifikat
        </Link>
      );
    }
    
    return <span className={styles.noSertifikat}>-</span>;
  };

  // Fungsi untuk render filter menu
  const renderFilterMenu = (items, filterState, toggleFunction) => {
    return items.map((item) => (
      <label key={item} className={styles.checkboxItem}>
        <input
          type="checkbox"
          checked={filterState.includes(item)}
          onChange={() => toggleFunction(item)}
        />
        {item || "-"}
      </label>
    ));
  };

  // Fungsi untuk render konten utama
  const renderMainContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }
    
    if (error) {
      return <div className={styles.errorMessage}>{error}</div>;
    }
    
    if (history.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Belum ada data history sertifikasi.
        </div>
      );
    }
    
    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          {/* FILTER ROW (BARIS ATAS) */}
          <div className={styles.filterRow}>
            {/* BULAN FILTER */}
            <div className={styles.filterDropdown} ref={bulanRef}>
              <button
                onClick={() => setShowBulanFilter(!showBulanFilter)}
                className={styles.filterSmall}
              >
                Bulan {filterBulan.length > 0 && `(${filterBulan.length})`}
                <span>▾</span>
              </button>
              {showBulanFilter && (
                <div className={styles.filterMenu}>
                  {namaBulan.map((bulan, index) => (
                    <label key={bulan} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={filterBulan.includes(index + 1)}
                        onChange={() => toggleBulan(index + 1)}
                      />
                      {bulan}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* TAHUN FILTER */}
            <div className={styles.filterDropdown} ref={tahunRef}>
              <button
                onClick={() => setShowTahunFilter(!showTahunFilter)}
                className={styles.filterSmall}
              >
                Tahun {filterTahun.length > 0 && `(${filterTahun.length})`}
                <span>▾</span>
              </button>
              {showTahunFilter && (
                <div className={styles.filterMenu}>
                  {[...new Set(history.map(item =>
                    item.tanggal_selesai ? new Date(item.tanggal_selesai).getFullYear() : null
                  ).filter(year => year !== null))]
                    .sort((a, b) => b - a)
                    .map((tahun) => (
                      <label key={tahun} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={filterTahun.includes(tahun)}
                          onChange={() => toggleTahun(tahun)}
                        />
                        {tahun}
                      </label>
                    ))}
                </div>
              )}
            </div>

            {/* SKEMA FILTER */}
            <div className={styles.filterDropdown} ref={skemaRef}>
              <button
                onClick={() => setShowSkemaFilter(!showSkemaFilter)}
                className={styles.filterMedium}
              >
                Skema {filterSkema.length > 0 && `(${filterSkema.length})`}
                <span>▾</span>
              </button>
              {showSkemaFilter && (
                <div className={styles.filterMenu}>
                  {renderFilterMenu(uniqueSkema, filterSkema, toggleSkema)}
                </div>
              )}
            </div>

            {/* PLANT FILTER */}
            <div className={styles.filterDropdown} ref={plantRef}>
              <button
                onClick={() => setShowPlantFilter(!showPlantFilter)}
                className={`${styles.filterSmall} ${styles.filterPlant}`}
              >
                Plant {filterPlant.length > 0 && `(${filterPlant.length})`}
                <span>▾</span>
              </button>
              {showPlantFilter && (
                <div className={styles.filterMenu}>
                  {renderFilterMenu(uniquePlant, filterPlant, togglePlant)}
                </div>
              )}
            </div>

            {/* SEKSI FILTER */}
            <div className={styles.filterDropdown} ref={seksiRef}>
              <button
                onClick={() => setShowSeksiFilter(!showSeksiFilter)}
                className={`${styles.filterSmall} ${styles.filterSeksi}`}
              >
                Seksi {filterSeksi.length > 0 && `(${filterSeksi.length})`}
                <span>▾</span>
              </button>
              {showSeksiFilter && (
                <div className={styles.filterMenu}>
                  {renderFilterMenu(uniqueSeksi, filterSeksi, toggleSeksi)}
                </div>
              )}
            </div>

            {/* HASIL FILTER */}
            <select
              value={filterHasil}
              onChange={(e) => {
                setFilterHasil(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.filterHasil}
            >
              <option value="">Semua Hasil</option>
              <option value="kompeten">Kompeten</option>
              <option value="belum_kompeten">Belum Kompeten</option>
            </select>

            {/* RESET BUTTON */}
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterBulan([]);
                setFilterTahun([]);
                setFilterPlant([]);
                setFilterSeksi([]);
                setFilterSkema([]);
                setFilterHasil("");
                setCurrentPage(1);
              }}
              className={styles.resetButton}
            >
              Reset
            </button>
          </div>

          {/* BARIS BAWAH (ROWS + SEARCH) - DIPERBAIKI PLACEHOLDER */}
          <div className={styles.bottomControls}>
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

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Cari Nama, NPK, Seksi, Perusahaan, Plant, Skema, Standard, Lembaga TUK, Asesor..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Results info */}
        <div className={styles.resultsInfo}>
          Menampilkan {filteredHistory.length > 0 ? startIndex + 1 : 0} hingga{' '}
          {Math.min(endIndex, filteredHistory.length)} dari {filteredHistory.length} data
        </div>

        {/* Table */}
        {renderTableContent()}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <div className={styles.pageInfo}>
              Halaman {currentPage} dari {totalPages}
            </div>
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    );
  };

  // Fungsi untuk render tabel
  const renderTableContent = () => {
    if (filteredHistory.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Tidak ada hasil pencarian untuk "{searchQuery}"
        </div>
      );
    }
    
    return (
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
              <th>Skema</th>
              <th>Standard</th>
              <th>Lembaga TUK</th>
              <th>Tanggal</th>
              <th>TUK</th>
              <th>Asesor</th>
              <th>Hasil</th>
              <th>No Blanko</th>
              <th>No Sertifikat</th>
              <th>No Registrasi</th>
              <th>Sertifikat</th>
            </tr>
          </thead>
          <tbody>
            {displayedHistory.map((item, index) => (
              <tr key={item.id_hasil}>
                <td>{startIndex + index + 1}</td>
                <td>{item.nama || "-"}</td>
                <td>{item.npk || "-"}</td>
                <td>{item.seksi || "-"}</td>
                <td>{item.company || "-"}</td>
                <td>{item.plant || "-"}</td>
                <td>{item.nama_skema || "-"}</td>
                <td>{item.standard || "-"}</td>
                <td>{item.lembaga || "-"}</td>
                <td>{formatDate(item.tanggal_selesai)}</td>
                <td>{item.nama_tuk || "-"}</td>
                <td>{item.nama_asesor || "-"}</td>
                <td>{renderHasil(item.hasil)}</td>
                <td>{item.no_blanko || "-"}</td>
                <td>{item.no_sertifikat || "-"}</td>
                <td>{item.no_registrasi || "-"}</td>
                <td>{renderSertifikat(item)}</td>
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
        <Link href="/user/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>History Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>History Sertifikasi</h1>
          <p className={styles.heroSubtitle}>Lihat history sertifikasi peserta.</p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {renderMainContent()}
        </div>
      </section>
    </>
  );
}