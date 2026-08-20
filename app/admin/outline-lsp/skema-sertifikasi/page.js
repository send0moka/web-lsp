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
  const [selectedFile, setSelectedFile] = useState(null);
  const [unitSearch, setUnitSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    kode_skema: "",
    nama_skema: "",
    jenis_skema: "",
    deskripsi: "",
    foto_url: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const [allUnits, setAllUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [newUnits, setNewUnits] = useState([]);
  const [newUnitForm, setNewUnitForm] = useState({
    kode_unit: "",
    nama_unit: ""
  });

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

  const fetchUnits = async () => {
    try {
      const res = await fetch("/api/skema-sertifikasi/unit-kompetensi");
      const data = await res.json();
      setAllUnits(data);
    } catch (err) {
      console.error("Gagal ambil unit", err);
    }
  };

  useEffect(() => {
    fetchSchemes();
    fetchUnits();
  }, []);

  // ✅ Keyboard handler di useEffect — identik dengan pola TUK & Asesor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showModal && !submitting) {
        setShowModal(false);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [showModal, submitting]);

  // ✅ Overflow lock — dipisah agar cleanup selalu konsisten
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (showModal) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const filteredSchemes = schemes.filter((scheme) =>
    scheme.nama_skema?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.jenis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnits = allUnits.filter(u =>
    u.kode_unit.toLowerCase().includes(unitSearch.toLowerCase()) ||
    u.nama_unit.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSchemes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedSchemes = filteredSchemes.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number.parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleRemoveNewUnit = (kodeUnit) => {
    setNewUnits(prev => prev.filter(u => u.kode_unit !== kodeUnit));
  };

  const handleAdd = () => {
    setModalMode("add");
    setFormData({
      kode_skema: "",
      nama_skema: "",
      jenis_skema: "",
      deskripsi: "",
      foto_url: ""
    });
    setSelectedUnits([]);
    setNewUnits([]);
    setShowModal(true);
  };

  const handleSelectUnit = (id) => {
    setSelectedUnits(prev =>
      prev.includes(id)
        ? prev.filter(u => u !== id)
        : [...prev, id]
    );
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddNewUnit = () => {
    if (!newUnitForm.kode_unit || !newUnitForm.nama_unit) return;
    setNewUnits(prev => [...prev, newUnitForm]);
    setNewUnitForm({ kode_unit: "", nama_unit: "" });
  };

  const handleEdit = async (scheme) => {
    setModalMode("edit");
    try {
      const res = await fetch(`/api/skema-sertifikasi/${scheme.id_skema}`);
      const data = await res.json();
      setFormData({
        id_skema: scheme.id_skema,
        kode_skema: data.skema.kode_skema,
        nama_skema: data.skema.nama_skema,
        jenis_skema: data.skema.jenis_skema,
        deskripsi: data.skema.deskripsi || "",
        foto_url: data.skema.foto_url || ""
      });
      setSelectedUnits(data.units.map(u => u.id_unit));
      setNewUnits([]);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail skema");
    }
  };

  const handleDelete = async (scheme) => {
    const confirmDelete = globalThis.confirm(
      `Apakah Anda yakin ingin menghapus skema:\n\n${scheme.nama_skema} (Kode: ${scheme.kode_skema})?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/skema-sertifikasi/hapus-skema`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_skema: scheme.id_skema }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      fetchSchemes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let url = "";
      let method = "POST";
      let bodyData = null;
      let imageUrl = formData.foto_url;

      if (modalMode !== "delete" && selectedFile) {
        const formUpload = new FormData();
        formUpload.append("file", selectedFile);
        const uploadRes = await fetch("/api/skema-sertifikasi/upload-foto", {
          method: "POST",
          body: formUpload,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error);
        imageUrl = uploadData.url;
      }

      if (modalMode === "add") {
        url = "/api/skema-sertifikasi/tambah-skema";
      } else if (modalMode === "edit") {
        url = `/api/skema-sertifikasi/edit-skema`;
        method = "PUT";
      }

      if (modalMode !== "delete") {
        bodyData = {
          ...formData,
          foto_url: imageUrl,
          units_existing: selectedUnits,
          units_new: newUnits,
        };
      }

      const res = await fetch(url, {
        method,
        headers: modalMode === "add" || modalMode === "edit"
          ? { "Content-Type": "application/json" }
          : undefined,
        body: bodyData ? JSON.stringify(bodyData) : null,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setShowModal(false);
      fetchSchemes();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getSubmitButtonText = () => {
    if (submitting) return "Memproses...";
    if (modalMode === "add") return "Tambah";
    if (modalMode === "edit") return "Simpan";
    return "Hapus";
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
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingMessage}>Memuat data...</div>
          ) : (
            <div className={styles.detailContainer}>
              <div className={styles.topAction}>
                <button onClick={handleAdd} className={styles.addButton}>
                  + Tambah Skema
                </button>
              </div>

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
                Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredSchemes.length)} dari {filteredSchemes.length} data
              </div>

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
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSchemes.map((scheme, index) => (
                        <tr key={scheme.id_skema}>
                          <td>{startIndex + index + 1}</td>
                          <td>{scheme.kode_skema}</td>
                          <td>
                            <Link
                              href={`/admin/outline-lsp/skema-sertifikasi/${scheme.id_skema}`}
                              className={styles.schemeLink}
                            >
                              {scheme.nama_skema}
                            </Link>
                          </td>
                          <td>{scheme.jenis}</td>
                          <td>{scheme.jumlah_unit}</td>
                          <td className={styles.actionButtons}>
                            <button onClick={() => handleEdit(scheme)} className={styles.editButton}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(scheme)} className={styles.deleteButton}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
          )}
        </div>
      </section>

      {/* ✅ Modal CRUD — struktur identik dengan TUK & Asesor yang lolos SonarQube */}
      {showModal && (
        <>
          <button
            type="button"
            className={styles.modalOverlay}
            aria-label="Tutup modal"
            tabIndex={-1}
            onClick={() => { if (!submitting) setShowModal(false); }}
          />

          <dialog
            open
            className={styles.modal}
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2 id="modal-title">
                {modalMode === "add" && "Tambah Skema Sertifikasi"}
                {modalMode === "edit" && "Edit Skema Sertifikasi"}
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
                <label htmlFor="kode_skema">Kode Skema *</label>
                <input
                  type="text"
                  id="kode_skema"
                  name="kode_skema"
                  value={formData.kode_skema}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nama_skema">Nama Skema *</label>
                <input
                  type="text"
                  id="nama_skema"
                  name="nama_skema"
                  value={formData.nama_skema}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jenis_skema">Jenis Skema *</label>
                <select
                  id="jenis_skema"
                  name="jenis_skema"
                  value={formData.jenis_skema}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Pilih Jenis</option>
                  <option value="KKNI">KKNI</option>
                  <option value="Klaster">Klaster</option>
                  <option value="Okupasi">Okupasi</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="deskripsi">Deskripsi</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={4}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <fieldset className={styles.unitFieldset}>
                  <legend className={styles.formLabel}>Unit Kompetensi (Pilih yang ada)</legend>
                  <input
                    type="text"
                    placeholder="Cari unit..."
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    className={styles.formInput}
                    aria-label="Cari unit kompetensi"
                  />
                  <div className={styles.unitList}>
                    {filteredUnits.map(unit => (
                      <label key={unit.id_unit} className={styles.unitItem}>
                        <input
                          type="checkbox"
                          checked={selectedUnits.includes(unit.id_unit)}
                          onChange={() => handleSelectUnit(unit.id_unit)}
                        />
                        <span>{unit.kode_unit} - {unit.nama_unit}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className={styles.formGroup}>
                <fieldset className={styles.unitFieldset}>
                  <legend className={styles.formLabel}>Tambah Unit Baru</legend>
                  <input
                    type="text"
                    placeholder="Kode Unit"
                    value={newUnitForm.kode_unit}
                    onChange={(e) => setNewUnitForm(prev => ({ ...prev, kode_unit: e.target.value }))}
                    className={styles.formInput}
                    aria-label="Kode unit baru"
                  />
                  <input
                    type="text"
                    placeholder="Nama Unit"
                    value={newUnitForm.nama_unit}
                    onChange={(e) => setNewUnitForm(prev => ({ ...prev, nama_unit: e.target.value }))}
                    className={styles.formInput}
                    aria-label="Nama unit baru"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewUnit}
                    className={styles.addButton}
                  >
                    + Tambah Unit
                  </button>
                </fieldset>
              </div>

              {newUnits.length > 0 && (
                <div className={styles.formGroup}>
                  <fieldset className={styles.unitFieldset}>
                    <legend className={styles.formLabel}>Unit Baru Ditambahkan</legend>
                    <div className={styles.newUnitsList}>
                      {newUnits.map((unit) => (
                        <div key={unit.kode_unit} className={styles.newUnitItem}>
                          <span>{unit.kode_unit} - {unit.nama_unit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewUnit(unit.kode_unit)}
                            aria-label={`Hapus unit ${unit.kode_unit}`}
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="foto_upload" className={styles.formLabel}>Upload Foto</label>
                <input
                  type="file"
                  id="foto_upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.formInput}
                  aria-label="Upload foto skema sertifikasi"
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
                    alt="Foto skema saat ini"
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
                  className={`${styles.modalSubmitBtn} ${modalMode === "delete" ? styles.deleteBtn : ""}`}
                >
                  {getSubmitButtonText()}
                </button>
              </div>
            </form>
          </dialog>
        </>
      )}
    </>
  );
}