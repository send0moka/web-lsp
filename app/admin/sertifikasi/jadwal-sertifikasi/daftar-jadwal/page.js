"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import styles from "./daftar-jadwal.module.css";

export default function ListJadwal() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  // State untuk dropdown options
  const [skemaOptions, setSkemaOptions] = useState([]);
  const [tukOptions, setTukOptions] = useState([]);
  const [asesorOptions, setAsesorOptions] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  
  const [setIsSkemaLoading] = useState(true);
  const [setIsTukLoading] = useState(true);
  const [setIsAsesorLoading] = useState(true);

  const [formData, setFormData] = useState({
    skema: null,
    tanggal_mulai: "",
    tanggal_selesai: "",
    tuk: null,
    asesor: null,
    trainer: null,
  });

  const dialogRef = useRef(null);

  // Fetch skema options
  useEffect(() => {
    const fetchSkema = async () => {
      try {
        setIsSkemaLoading(true);
        const res = await fetch("/api/skema-sertifikasi");
        const data = await res.json();
        
        const options = (data || []).map((item) => ({
          value: item.id_skema,
          label: item.nama_skema,
        }));
        
        setSkemaOptions(options);
      } catch (err) {
        console.error("Error fetching skema:", err);
      } finally {
        setIsSkemaLoading(false);
      }
    };

    fetchSkema();
  }, []);

  // Fetch TUK options
  useEffect(() => {
    const fetchTuk = async () => {
      try {
        setIsTukLoading(true);
        const res = await fetch("/api/tempat-uji-kompetensi");
        const data = await res.json();
        
        const options = (data || []).map((item) => ({
          value: item.id_tuk,
          label: item.nama_tuk,
        }));
        
        setTukOptions(options);
      } catch (err) {
        console.error("Error fetching TUK:", err);
      } finally {
        setIsTukLoading(false);
      }
    };

    fetchTuk();
  }, []);

  // Fetch Asesor options
  useEffect(() => {
    const fetchAsesor = async () => {
      try {
        setIsAsesorLoading(true);
        const res = await fetch("/api/asesor-kompetensi");
        const data = await res.json();
        
        const options = (data || []).map((item) => ({
          value: item.id_asesor,
          label: item.nama_asesor,
        }));
        
        setAsesorOptions(options);
        setTrainerOptions(options);
      } catch (err) {
        console.error("Error fetching asesor:", err);
      } finally {
        setIsAsesorLoading(false);
      }
    };

    fetchAsesor();
  }, []);

  // Fetch data jadwal
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

  const handleEdit = (item) => {
    const selectedSkema = skemaOptions.find(o => o.value === item.id_skema) || null;
    const selectedTuk = tukOptions.find(o => o.value === item.id_tuk) || null;
    const selectedAsesor = asesorOptions.find(o => o.value === item.id_asesor) || null;
    const selectedTrainer = trainerOptions.find(o => o.value === item.id_trainer) || null;

    setFormData({
      skema: selectedSkema,
      tanggal_mulai: formatDateForInput(item.tanggal_mulai),
      tanggal_selesai: formatDateForInput(item.tanggal_selesai),
      tuk: selectedTuk,
      asesor: selectedAsesor,
      trainer: selectedTrainer,
    });

    setSelectedId(item.id_jadwal);
    setShowModal(true);
  };

  // Effect untuk mengontrol dialog ketika showModal berubah
  useEffect(() => {
    if (showModal && dialogRef.current) {
      if (!dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    } else if (!showModal && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [showModal]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.skema || !formData.tanggal_mulai || !formData.tanggal_selesai || !formData.tuk || !formData.asesor || !formData.trainer) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (new Date(formData.tanggal_mulai) > new Date(formData.tanggal_selesai)) {
      alert("Tanggal selesai harus setelah tanggal mulai!");
      return;
    }

    const payload = {
      id_jadwal: selectedId,
      skema: formData.skema?.value,
      tuk: formData.tuk?.value,
      asesor: formData.asesor?.value,
      trainer: formData.trainer?.value,
      tanggal_mulai: formData.tanggal_mulai,
      tanggal_selesai: formData.tanggal_selesai,
    };

    try {
      const res = await fetch("/api/jadwal-sertifikasi/edit-jadwal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal update");
      }

      setShowModal(false);
      
      const fetchRes = await fetch("/api/jadwal-sertifikasi/daftar-jadwal", {
        cache: "no-store"
      });
      const fetchResult = await fetchRes.json();
      setJadwal(fetchResult || []);
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);

    } catch (err) {
      console.error("Error detail:", err);
      alert(err.message || "Gagal update data");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      skema: null,
      tanggal_mulai: "",
      tanggal_selesai: "",
      tuk: null,
      asesor: null,
      trainer: null,
    });
    setSelectedId(null);
  };

  useEffect(() => {
    if (!showModal) {
      setFormData({
        skema: null,
        tanggal_mulai: "",
        tanggal_selesai: "",
        tuk: null,
        asesor: null,
        trainer: null,
      });
      setSelectedId(null);
    }
  }, [showModal]);

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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const handleDeleteJadwal = async (id_jadwal) => {
    const confirmDelete = confirm(
      "Yakin ingin menghapus jadwal ini? Semua peserta di dalamnya juga akan terhapus."
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/jadwal-sertifikasi/delete-jadwal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_jadwal }),
      });

      if (!res.ok) throw new Error("Gagal hapus");

      setJadwal((prev) =>
        prev.filter((j) => j.id_jadwal !== id_jadwal)
      );

    } catch (error) {
      console.error(error);
      alert("Gagal menghapus jadwal");
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }
    
    if (jadwal.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data jadwal sertifikasi.</div>;
    }
    
    return (
      <div className={styles.detailContainer}>
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari skema, TUK, asesor, atau trainer"
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Cari jadwal sertifikasi"
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

        <div className={styles.resultsInfo}>
          Menampilkan {filteredJadwal.length > 0 ? startIndex + 1 : 0} hingga{' '}
          {Math.min(endIndex, filteredJadwal.length)} dari {filteredJadwal.length} data
        </div>

        {filteredJadwal.length === 0 ? (
          <div className={styles.emptyMessage}>
            Tidak ada hasil pencarian untuk "{searchQuery}"
          </div>
        ) : (
          <>
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
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedJadwal.map((item, index) => (
                    <tr key={item.id_jadwal}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <Link 
                          href={`/admin/sertifikasi/jadwal-sertifikasi/detail-jadwal/${item.id_jadwal}`} 
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
                      <td className={styles.actionButtons}>
                        <button
                          onClick={() => handleEdit(item)}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                          aria-label={`Edit jadwal ${item.nama_skema}`}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDeleteJadwal(item.id_jadwal)}
                          aria-label={`Hapus jadwal ${item.nama_skema}`}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
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
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Daftar Jadwal Sertifikasi</span>
      </div>

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

      <div className={styles.tabContainer}>
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi"
          className={styles.tabItem}
        >
          Buat Jadwal Training & Sertifikasi   
        </Link>
        
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-jadwal"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Jadwal Training & Sertifikasi
        </Link>

        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-peserta"
          className={styles.tabItem}
        >
          Daftar Peserta
        </Link>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {submitted && (
            <div className={styles.successMessage}>
              ✓ Jadwal berhasil diupdate!
            </div>
          )}
          
          {renderMainContent()}
        </div>
      </section>

      <dialog 
        ref={dialogRef}
        className={styles.modalOverlay}
        aria-labelledby="modal-title"
      >
        <div className={styles.modalContent}>
          <button
            className={styles.closeIcon}
            onClick={closeModal}
            aria-label="Tutup modal"
          >
            ×
          </button>

          <h3 id="modal-title">Edit Jadwal Sertifikasi</h3>

          <form onSubmit={handleUpdate} className={styles.modalForm}>
            <fieldset className={styles.unitFieldset}>
              <legend id="skema-label" className={styles.formLabel}>
                Skema Sertifikasi <span className={styles.required}>*</span>
              </legend>
              <Select
                options={skemaOptions}
                value={formData.skema}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    skema: selected,
                  }));
                }}
                placeholder="Pilih skema..."
                isClearable
                isSearchable
                aria-labelledby="skema-label"
              />
            </fieldset>

            <div className={styles.formGroup}>
              <label htmlFor="tanggal_mulai" className={styles.formLabel}>
                Tanggal Mulai <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="tanggal_mulai"
                className={styles.formInput}
                value={formData.tanggal_mulai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_mulai: e.target.value })
                }
                required
                aria-label="Tanggal mulai sertifikasi"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tanggal_selesai" className={styles.formLabel}>
                Tanggal Selesai <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="tanggal_selesai"
                className={styles.formInput}
                value={formData.tanggal_selesai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_selesai: e.target.value })
                }
                min={formData.tanggal_mulai}
                required
                aria-label="Tanggal selesai sertifikasi"
              />
            </div>

            <fieldset className={styles.unitFieldset}>
              <legend id="tuk-label" className={styles.formLabel}>
                Tempat Uji Kompetensi <span className={styles.required}>*</span>
              </legend>
              <Select
                options={tukOptions}
                value={formData.tuk}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    tuk: selected,
                  }));
                }}
                placeholder="Pilih TUK..."
                isClearable
                isSearchable
                aria-labelledby="tuk-label"
              />
            </fieldset>

            <fieldset className={styles.unitFieldset}>
              <legend id="asesor-label" className={styles.formLabel}>
                Asesor <span className={styles.required}>*</span>
              </legend>
              <Select
                options={asesorOptions}
                value={formData.asesor}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    asesor: selected,
                  }));
                }}
                placeholder="Pilih asesor..."
                isClearable
                isSearchable
                aria-labelledby="asesor-label"
              />
            </fieldset>

            <fieldset className={styles.unitFieldset}>
              <legend id="trainer-label" className={styles.formLabel}>
                Trainer <span className={styles.required}>*</span>
              </legend>
              <Select
                options={trainerOptions}
                value={formData.trainer}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    trainer: selected,
                  }));
                }}
                placeholder="Pilih trainer..."
                isClearable
                isSearchable
                aria-labelledby="trainer-label"
              />
            </fieldset>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={closeModal}
              >
                Batal
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Simpan
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}