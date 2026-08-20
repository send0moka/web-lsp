"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import styles from "./asesor-kompetensi.module.css";

export default function AsesorKompetensi() {
  const [asesor, setAsesor] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    nama_asesor: "",
    no_registrasi: "",
    foto_url: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSkema, setSelectedSkema] = useState([]);
  
  // ✅ Ref untuk dialog element
  const dialogRef = useRef(null);

  const refreshAsesorData = async () => {
    try {
      const res = await fetch("/api/asesor-kompetensi");
      const data = await res.json();
      setAsesor(data);
    } catch (err) {
      console.error("Gagal refresh data asesor:", err);
    }
  };

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

    const fetchSchemes = async () => {
      try {
        const res = await fetch("/api/skema-sertifikasi");
        const data = await res.json();
        setSchemes(data);
      } catch (err) {
        console.error("Gagal ambil skema", err);
      }
    };

    fetchAsesor();
    fetchSchemes();
  }, []);

  // ✅ Handle modal open/close dengan dialog native
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showModal) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "";
    }
  }, [showModal]);

  // ✅ Handle Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      if (submitting) {
        e.preventDefault();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [submitting]);

  const filteredAsesor = asesor.filter((asesor) =>
    asesor.nama_asesor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asesor.no_registrasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAsesor.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedAsesor = filteredAsesor.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setModalMode("add");
    setFormData({ nama_asesor: "", no_registrasi: "", foto_url: "" });
    setSelectedSkema([]);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleEdit = async (asesor) => {
    setModalMode("edit");
    try {
      const res = await fetch(`/api/asesor-kompetensi/${asesor.id_asesor}`);
      const data = await res.json();
      setFormData({
        id_asesor: asesor.id_asesor,
        nama_asesor: data.asesor.nama_asesor,
        no_registrasi: data.asesor.no_registrasi,
        foto_url: data.asesor.foto_url || ""
      });
      setSelectedSkema(data.skema.map(s => s.id_skema));
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail asesor");
    }
    setSelectedFile(null);
  };

  const handleDelete = async (asesor) => {
    const confirmDelete = globalThis.confirm(
      `Apakah Anda yakin ingin menghapus asesor:\n\n${asesor.nama_asesor} (No Reg: ${asesor.no_registrasi})?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/asesor-kompetensi/hapus-asesor`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_asesor: asesor.id_asesor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      await refreshAsesorData();
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
      let imageUrl = formData.foto_url;

      if (selectedFile) {
        const formUpload = new FormData();
        formUpload.append("file", selectedFile);
        const uploadRes = await fetch("/api/asesor-kompetensi/upload-foto", {
          method: "POST",
          body: formUpload,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error);
        imageUrl = uploadData.url;
      }

      let url = "";
      let method = "";
      let bodyData = {};

      if (modalMode === "add") {
        url = "/api/asesor-kompetensi/tambah-asesor";
        method = "POST";
        bodyData = {
          nama_asesor: formData.nama_asesor,
          no_registrasi: formData.no_registrasi,
          foto_url: imageUrl,
          skema_ids: selectedSkema
        };
      } else if (modalMode === "edit") {
        url = "/api/asesor-kompetensi/edit-asesor";
        method = "PUT";
        bodyData = {
          id_asesor: formData.id_asesor,
          nama_asesor: formData.nama_asesor,
          no_registrasi: formData.no_registrasi,
          foto_url: imageUrl,
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
      await refreshAsesorData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (submitting) return "Memproses...";
    if (modalMode === "add") return "Tambah";
    return "Simpan";
  };

  const handleCloseModal = () => {
    if (!submitting) setShowModal(false);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
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
        <Link href="/admin/outline-lsp/asesor-kompetensi/grid" className={styles.tabItem}>
          Asesor Kompetensi
        </Link>
        <Link
          href="/admin/outline-lsp/asesor-kompetensi"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Asesor
        </Link>
      </div>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingMessage}>Memuat data...</div>
          ) : (
            <div className={styles.detailContainer}>
              <div className={styles.topAction}>
                <button onClick={handleAdd} className={styles.addButton}>
                  + Tambah Asesor
                </button>
              </div>

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
                <div className={styles.rightControls}>
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
              </div>

              <div className={styles.resultsInfo}>
                Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredAsesor.length)} dari {filteredAsesor.length} data
              </div>

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
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAsesor.map((asesor, index) => (
                        <tr key={asesor.id_asesor}>
                          <td>{startIndex + index + 1}</td>
                          <td>{asesor.no_registrasi}</td>
                          <td>
                            <Link
                              href={`/admin/outline-lsp/asesor-kompetensi/${asesor.id_asesor}`}
                              className={styles.asesorLink}
                            >
                              {asesor.nama_asesor}
                            </Link>
                          </td>
                          <td>{asesor.jumlah_skema}</td>
                          <td className={styles.actionButtons}>
                            <button onClick={() => handleEdit(asesor)} className={styles.editButton}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(asesor)} className={styles.deleteButton}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
          )}
        </div>
      </section>

      {/* ✅ Modal dengan native dialog element */}
      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-title">
            {modalMode === "add" && "Tambah Asesor Kompetensi"}
            {modalMode === "edit" && "Edit Asesor Kompetensi"}
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={handleCloseModal}
            aria-label="Tutup modal"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="no_registrasi">No Registrasi *</label>
            <input
              type="text"
              id="no_registrasi"
              name="no_registrasi"
              value={formData.no_registrasi}
              onChange={handleInputChange}
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nama_asesor">Nama Asesor *</label>
            <input
              type="text"
              id="nama_asesor"
              name="nama_asesor"
              value={formData.nama_asesor}
              onChange={handleInputChange}
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <fieldset className={styles.skemaFieldset}>
              <legend className={styles.formLabel}>Skema Sertifikasi yang Diampu</legend>
              <div className={styles.skemaList}>
                {schemes.map(skema => (
                  <label key={skema.id_skema} className={styles.skemaItem}>
                    <input
                      type="checkbox"
                      checked={selectedSkema.includes(skema.id_skema)}
                      onChange={() => handleSkemaChange(skema.id_skema)}
                    />
                    <span>{skema.kode_skema} - {skema.nama_skema}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="foto_upload">Upload Foto</label>
            <input
              type="file"
              id="foto_upload"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.formInput}
            />
            {selectedFile && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview foto yang dipilih"
                className={styles.imagePreview}
              />
            )}
            {formData.foto_url && !selectedFile && (
              <img
                src={formData.foto_url}
                alt="Foto asesor saat ini"
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
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}