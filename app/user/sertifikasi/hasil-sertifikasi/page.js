"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import styles from "./hasil-sertifikasi.module.css";

export default function HasilSertifikasi() {
  const [hasil, setHasil] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [filterSkema, setFilterSkema] = useState([]);
  const [filterPlant, setFilterPlant] = useState([]);
  const [filterSeksi, setFilterSeksi] = useState([]);
  const [filterPerusahaan, setFilterPerusahaan] = useState([]);
  const [filterHasil, setFilterHasil] = useState("");

  // Dropdown visibility states
  const [showSkemaFilter, setShowSkemaFilter] = useState(false);
  const [showPlantFilter, setShowPlantFilter] = useState(false);
  const [showSeksiFilter, setShowSeksiFilter] = useState(false);
  const [showPerusahaanFilter, setShowPerusahaanFilter] = useState(false);

  // Refs for click outside
  const skemaRef = useRef(null);
  const plantRef = useRef(null);
  const seksiRef = useRef(null);
  const perusahaanRef = useRef(null);

  // Unique values for filters
  const normalizeOptions = (data, key) => {
    const map = new Map();

    data.forEach((item) => {
      const value = item[key];

      if (!value) return;

      const normalized = value.trim().toLowerCase();

      // simpan hanya sekali
      if (!map.has(normalized)) {
        map.set(normalized, value.trim());
      }
    });

    return Array.from(map.values());
  };

  const uniqueSkema = normalizeOptions(hasil, "nama_skema");
  const uniquePlant = normalizeOptions(hasil, "plant");
  const uniqueSeksi = normalizeOptions(hasil, "seksi");
  const uniquePerusahaan = normalizeOptions(hasil, "company");

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hasil-sertifikasi");
        if (!res.ok) throw new Error("Fetch gagal");
        const result = await res.json();
        setHasil(result || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data hasil sertifikasi");
      } finally {
        setLoading(false);
      }
    };

    fetchHasil();
  }, []);

  // Handle click outside
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
      if (perusahaanRef.current && !perusahaanRef.current.contains(event.target)) {
        setShowPerusahaanFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle filter functions
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

  const togglePerusahaan = (perusahaan) => {
    if (filterPerusahaan.includes(perusahaan)) {
      setFilterPerusahaan(filterPerusahaan.filter(p => p !== perusahaan));
    } else {
      setFilterPerusahaan([...filterPerusahaan, perusahaan]);
    }
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterSkema([]);
    setFilterPlant([]);
    setFilterSeksi([]);
    setFilterPerusahaan([]);
    setFilterHasil("");
    setCurrentPage(1);
  };

  // 🔎 Search Filter
  const filteredHasil = hasil.filter((item) => {
    const matchSearch =
      item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.npk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_skema?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_tuk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_asesor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hasil?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSkema = filterSkema.length > 0
      ? filterSkema.some(
          s => s.toLowerCase() === item.nama_skema?.toLowerCase()
        )
      : true;

    const matchPlant = filterPlant.length > 0
      ? filterPlant.some(
          p => p.toLowerCase() === item.plant?.toLowerCase()
        )
      : true;

    const matchSeksi = filterSeksi.length > 0
      ? filterSeksi.some(
          s => s.toLowerCase() === item.seksi?.toLowerCase()
        )
      : true;

    const matchPerusahaan = filterPerusahaan.length > 0
      ? filterPerusahaan.some(
          p => p.toLowerCase() === item.company?.toLowerCase()
        )
      : true;

    const matchHasil = filterHasil
      ? item.hasil === filterHasil
      : true;

    return matchSearch && matchSkema && matchPlant && matchSeksi && matchPerusahaan && matchHasil;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredHasil.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedHasil = filteredHasil.slice(startIndex, endIndex);

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

  // Fungsi untuk render hasil (menghilangkan nested ternary)
  const renderHasil = (hasilValue) => {
    if (!hasilValue) {
      return <span className={styles.hasilKosong}>-</span>;
    }
    
    if (hasilValue === "kompeten") {
      return <span className={styles.hasilKompeten}>Kompeten</span>;
    }
    
    if (hasilValue === "belum_kompeten") {
      return <span className={styles.hasilBelum}>Belum Kompeten</span>;
    }
    
    return <span className={styles.hasilText}>{hasilValue}</span>;
  };

  // Fungsi untuk render filter menu
  const renderFilterMenu = (items, filterState, toggleFunction, getDisplayValue = (item) => item) => {
    return items.map((item) => (
      <label key={item} className={styles.checkboxItem}>
        <input
          type="checkbox"
          checked={filterState.includes(item)}
          onChange={() => toggleFunction(item)}
        />
        {getDisplayValue(item) || "-"}
      </label>
    ));
  };

  // Fungsi untuk render konten utama (menghilangkan nested ternary)
  const renderMainContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }
    
    if (hasil.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Belum ada data hasil sertifikasi.
        </div>
      );
    }
    
    return (
      <div className={styles.detailContainer}>
        {/* Search and Filter Controls */}
        <div className={styles.controlsContainer}>
          {/* FILTER ROW (BARIS ATAS) */}
          <div className={styles.filterRow}>
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
                className={styles.filterSmall}
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
                className={styles.filterSmall}
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

            {/* PERUSAHAAN FILTER */}
            <div className={styles.filterDropdown} ref={perusahaanRef}>
              <button
                onClick={() => setShowPerusahaanFilter(!showPerusahaanFilter)}
                className={styles.filterSmall}
              >
                Perusahaan {filterPerusahaan.length > 0 && `(${filterPerusahaan.length})`}
                <span>▾</span>
              </button>
              {showPerusahaanFilter && (
                <div className={styles.filterMenu}>
                  {renderFilterMenu(uniquePerusahaan, filterPerusahaan, togglePerusahaan)}
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
              onClick={resetFilters}
              className={styles.resetButton}
            >
              Reset
            </button>
          </div>

          {/* BARIS BAWAH (ROWS + SEARCH) */}
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
                placeholder="Cari nama, NPK, skema, TUK, asesor, atau hasil..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Results info */}
        <div className={styles.resultsInfo}>
          Menampilkan {filteredHasil.length > 0 ? startIndex + 1 : 0} hingga{' '}
          {Math.min(endIndex, filteredHasil.length)} dari {filteredHasil.length} data
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

  // Fungsi untuk render tabel (menghilangkan nested ternary)
  const renderTableContent = () => {
    if (filteredHasil.length === 0) {
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
              <th>Tanggal Selesai</th>
              <th>TUK</th>
              <th>Asesor</th>
              <th>Hasil</th>
            </tr>
          </thead>
          <tbody>
            {displayedHasil.map((item, index) => (
              <tr key={item.id_pendaftaran}>
                <td>{startIndex + index + 1}</td>
                <td className={styles.namaCell}>{item.nama}</td>
                <td>{item.npk}</td>
                <td>{item.seksi || "-"}</td>
                <td>{item.company || "-"}</td>
                <td>{item.plant || "-"}</td>
                <td>{item.nama_skema}</td>
                <td>{formatDate(item.tanggal_selesai)}</td>
                <td>{item.nama_tuk}</td>
                <td>{item.nama_asesor}</td>
                <td className={styles.hasilCell}>
                  {renderHasil(item.hasil)}
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
        <span>Hasil Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Hasil Sertifikasi
          </h1>
          <p className={styles.heroSubtitle}>
            Lihat hasil kompetensi peserta sertifikasi.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {renderMainContent()}
        </div>
      </section>
    </>
  );
}