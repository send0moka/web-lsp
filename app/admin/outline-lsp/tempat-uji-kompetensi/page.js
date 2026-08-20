"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./tempat-uji-kompetensi.module.css";

export default function TempatUjiKompetensi() {
  const [tuks, setTuks] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk modal CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, delete
  const [formData, setFormData] = useState({
    kode_tuk: "",
    nama_tuk: "",
    jenis_tuk: "",
    foto_tuk: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSkema, setSelectedSkema] = useState([]);

  // Function to fetch TUK data (reusable)
  const fetchTuksData = async () => {
    try {
      const res = await fetch("/api/tempat-uji-kompetensi");
      if (!res.ok) throw new Error("Fetch gagal");
      const data = await res.json();
      setTuks(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data tempat uji kompetensi");
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await fetchTuksData();
        
        const resSchemes = await fetch("/api/skema-sertifikasi");
        const dataSchemes = await resSchemes.json();
        setSchemes(dataSchemes);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter
  const filteredTuks = tuks.filter((tuk) =>
    tuk.nama_tuk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tuk.kode_tuk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
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

  // CRUD Handlers
  const handleAdd = () => {
    setModalMode("add");
    setFormData({
      kode_tuk: "",
      nama_tuk: "",
      jenis_tuk: "",
      foto_tuk: ""
    });
    setSelectedSkema([]);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleEdit = async (tuk) => {
    setModalMode("edit");
    
    // Fetch detail TUK termasuk skema yang terkait
    try {
      const res = await fetch(`/api/tempat-uji-kompetensi/${tuk.id_tuk}`);
      const data = await res.json();
      
      setFormData({
        id_tuk: tuk.id_tuk,
        kode_tuk: data.tuk.kode_tuk,
        nama_tuk: data.tuk.nama_tuk,
        jenis_tuk: data.tuk.jenis_tuk,
        foto_tuk: data.tuk.foto_tuk || ""
      });
      
      setSelectedSkema(data.skema.map(s => s.id_skema));
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail TUK");
    }
    
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (tuk) => {
    const confirmDelete = globalThis.confirm(
      `Apakah Anda yakin ingin menghapus TUK:\n\n${tuk.nama_tuk} (Kode: ${tuk.kode_tuk})?\n\nTindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/tempat-uji-kompetensi/hapus-tuk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tuk: tuk.id_tuk }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      
      // Refresh data menggunakan fungsi reusable
      await fetchTuksData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkemaChange = (idSkema) => {
    setSelectedSkema(prev =>
      prev.includes(idSkema)
        ? prev.filter(id => id !== idSkema)
        : [...prev, idSkema]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.foto_tuk;

      // Upload image if new file selected
      if (selectedFile) {
        const formUpload = new FormData();
        formUpload.append("file", selectedFile);

        const uploadRes = await fetch("/api/tempat-uji-kompetensi/upload-foto", {
          method: "POST",
          body: formUpload,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error);
        }

        imageUrl = uploadData.url;
      }

      let url = "";
      let method = "";
      let bodyData = {};

      if (modalMode === "add") {
        url = "/api/tempat-uji-kompetensi/tambah-tuk";
        method = "POST";
        bodyData = {
          kode_tuk: formData.kode_tuk,
          nama_tuk: formData.nama_tuk,
          jenis_tuk: formData.jenis_tuk,
          foto_tuk: imageUrl,
          skema_ids: selectedSkema
        };
      } else if (modalMode === "edit") {
        url = "/api/tempat-uji-kompetensi/edit-tuk";
        method = "PUT";
        bodyData = {
          id_tuk: formData.id_tuk,
          kode_tuk: formData.kode_tuk,
          nama_tuk: formData.nama_tuk,
          jenis_tuk: formData.jenis_tuk,
          foto_tuk: imageUrl,
          skema_ids: selectedSkema
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setShowModal(false);
      
      // Refresh data menggunakan fungsi reusable
      await fetchTuksData();
      
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function untuk button text
  const getButtonText = () => {
    if (submitting) return "Memproses...";
    if (modalMode === "add") return "Tambah";
    return "Simpan";
  };

  const handleCloseModal = () => {
    if (!submitting) setShowModal(false);
  };

  // DIPERBAIKI: Event listener keyboard dipindahkan ke window level
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !submitting) {
        setShowModal(false);
      }
    };

    if (showModal) {
      globalThis.addEventListener("keydown", handleKeyDown);
      // Mencegah scroll di background saat modal terbuka
      document.body.style.overflow = "hidden";
    }

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showModal, submitting]);

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
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

          {loading ? (
            <div className={styles.loadingMessage}>Memuat data...</div>
          ) : (
            <div className={styles.detailContainer}>

              <div className={styles.addButtonWrapper}>
                <button onClick={handleAdd} className={styles.addButton}>
                  + Tambah TUK
                </button>
              </div>

              {/* Controls */}
              <div className={styles.controlsContainer}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Cari nama atau kode TUK"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.rightControls}>
                  <div className={styles.rowsPerPageContainer}>
                    <label htmlFor="rowsPerPage" className={styles.rowsLabel}>Tampilkan:</label>
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
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTuks.map((tuk, index) => (
                        <tr key={tuk.id_tuk}>
                          <td>{startIndex + index + 1}</td>
                          <td>{tuk.kode_tuk}</td>
                          <td>
                            <Link
                              href={`/admin/outline-lsp/tempat-uji-kompetensi/${tuk.id_tuk}`}
                              className={styles.schemeLink}
                            >
                              {tuk.nama_tuk}
                            </Link>
                          </td>
                          <td>{tuk.jenis}</td>
                          <td>{tuk.jumlah_skema}</td>
                          <td className={styles.actionButtons}>
                            <button 
                              onClick={() => handleEdit(tuk)}
                              className={styles.editButton}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(tuk)}
                              className={styles.deleteButton}
                            >
                              Hapus
                            </button>
                          </td>
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
                    onClick={() =>
                      setCurrentPage(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={styles.paginationBtn}
                  >
                    Sebelumnya
                  </button>

                  <div className={styles.pageInfo}>
                    Halaman {currentPage} dari {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={styles.paginationBtn}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal CRUD - DIPERBAIKI */}
      {showModal && (
        <>
          <button
            type="button"
            className={styles.modalOverlay}
            aria-label="Tutup modal"
            tabIndex={-1}
            onClick={() => { if (!submitting) setShowModal(false); }}
          />

          {/* Dialog aksesibel - tanpa event listener keyboard langsung */}
          <dialog
            open
            className={styles.modal}
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2 id="modal-title">
                {modalMode === "add" && "Tambah Tempat Uji Kompetensi"}
                {modalMode === "edit" && "Edit Tempat Uji Kompetensi"}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleCloseModal}
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="kode_tuk">Kode TUK *</label>
                <input
                  type="text"
                  id="kode_tuk"
                  name="kode_tuk"
                  value={formData.kode_tuk}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nama_tuk">Nama TUK *</label>
                <input
                  type="text"
                  id="nama_tuk"
                  name="nama_tuk"
                  value={formData.nama_tuk}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jenis_tuk">Jenis TUK *</label>
                <select
                  id="jenis_tuk"
                  name="jenis_tuk"
                  value={formData.jenis_tuk}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Pilih Jenis TUK</option>
                  <option value="Sewaktu">Sewaktu</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="Tempat Kerja">Tempat Kerja</option>
                </select>
              </div>

              <fieldset className={styles.skemaFieldset}>
                <legend id="skema-label" className={styles.formLabel}>
                  Skema Sertifikasi yang Tersedia
                </legend>
                <div className={styles.skemaList}>
                  {schemes.map(skema => (
                    <label key={skema.id_skema} className={styles.skemaItem}>
                      <input
                        type="checkbox"
                        checked={selectedSkema.includes(skema.id_skema)}
                        onChange={() => handleSkemaChange(skema.id_skema)}
                      />
                      <span>
                        {skema.kode_skema} - {skema.nama_skema}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={styles.formGroup}>
                <label htmlFor="foto_tuk" className={styles.formLabel}>
                  Upload Foto TUK
                </label>
                <input
                  type="file"
                  id="foto_tuk"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.formInput}
                  aria-label="Upload foto TUK"
                />
                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview foto TUK yang dipilih"
                    className={styles.imagePreview}
                  />
                )}
                {formData.foto_tuk && !selectedFile && (
                  <img
                    src={formData.foto_tuk}
                    alt="Foto TUK saat ini"
                    className={styles.imagePreview}
                  />
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className={styles.modalCancelBtn}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.modalSubmitBtn}
                >
                  {getButtonText()}
                </button>
              </div>
            </form>
          </dialog>
        </>
      )}
    </>
  );
}