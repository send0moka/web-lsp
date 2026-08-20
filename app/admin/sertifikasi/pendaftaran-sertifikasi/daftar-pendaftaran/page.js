"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import styles from "./daftar-pendaftaran.module.css";
import Select from "react-select";

export default function DaftarPendaftaran() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [skemaOptions, setSkemaOptions] = useState([]);
  const [isSkemaLoading, setIsSkemaLoading] = useState(true);

  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [isOtherStandard, setIsOtherStandard] = useState(false);
  const [isOtherLembaga, setIsOtherLembaga] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    npk: "",
    seksi: "",
    company: "",
    plant: "",
    pic: "",
    skema: "",
    standard: "",
    lembaga: "",
  });

  const dialogRef = useRef(null);

  const companyOptions = [
    { value: "PT Denso Indonesia", label: "PT Denso Indonesia" },
    { value: "PT Denso Sales Indonesia", label: "PT Denso Sales Indonesia" },
    { value: "PT Denso Manufacturing Indonesia", label: "PT Denso Manufacturing Indonesia" },
    { value: "PT Hamanoko Denso Indonesia", label: "PT Hamanoko Denso Indonesia" },
    { value: "PT Toyota Denso Automotive Compressor Indonesia", label: "PT Toyota Denso Automotive Compressor Indonesia" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const standardOptions = [
    { value: "BNSP", label: "BNSP" },
    { value: "IMDIA", label: "IMDIA" },
    { value: "SESPP", label: "SESPP" },
    { value: "Kemnaker", label: "Kemnaker" },
    { value: "Internal", label: "Internal" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const lembagaOptions = [
    { value: "BNSP", label: "BNSP" },
    { value: "INNAS", label: "INNAS" },
    { value: "IMDIA", label: "IMDIA" },
    { value: "Kemnaker", label: "Kemnaker" },
    { value: "LSP Logam Mesin", label: "LSP Logam Mesin" },
    { value: "LSP Denso Indonesia", label: "LSP Denso Indonesia" },
    { value: "LSP Lingkungan Hidup Envirotama", label: "LSP Lingkungan Hidup Envirotama" },
    { value: "LSP Telekomunikasi Digital Indonesia", label: "LSP Telekomunikasi Digital Indonesia" },
    { value: "LSP Daimaru", label: "LSP Daimaru" },
    { value: "LSP Elektronika Indonesia", label: "LSP Elektronika Indonesia" },
    { value: "LSP Pengendalian Pencemaran Lingkungan", label: "LSP Pengendalian Pencemaran Lingkungan" },
    { value: "LSP LIK", label: "LSP LIK" },
    { value: "LSP HAKE", label: "LSP HAKE" },
    { value: "PT Denso Indonesia", label: "PT Denso Indonesia" },
    { value: "lainnya", label: "Lainnya" },
  ];

  // Shared Select styles
  const selectStyles = {
    control: (base) => ({ ...base, minHeight: "46px" }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  // ======================
  // Fetch skema options
  // ======================
  useEffect(() => {
    const fetchSkema = async () => {
      try {
        setIsSkemaLoading(true);
        const res = await fetch("/api/skema-sertifikasi");
        const data = await res.json();
        setSkemaOptions(
          (data || []).map((item) => ({
            value: item.id_skema,
            label: item.nama_skema,
          }))
        );
      } catch (err) {
        console.error("Error fetching skema:", err);
      } finally {
        setIsSkemaLoading(false);
      }
    };
    fetchSkema();
  }, []);

  // ======================
  // Fetch data pendaftaran
  // ======================
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

  // ======================
  // Dialog control
  // ======================
  useEffect(() => {
    if (showModal && dialogRef.current) {
      if (!dialogRef.current.open) dialogRef.current.showModal();
    } else if (!showModal && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [showModal]);

  // Reset form saat modal ditutup
  useEffect(() => {
    if (!showModal) {
      setFormData({
        nama: "", npk: "", seksi: "", company: "",
        plant: "", pic: "", skema: "", standard: "", lembaga: "",
      });
      setSelectedId(null);
      setIsOtherCompany(false);
      setIsOtherStandard(false);
      setIsOtherLembaga(false);
    }
  }, [showModal]);

  // ======================
  // Handle Edit — deteksi apakah nilai ada di options atau "lainnya"
  // ======================
  const handleEdit = (item) => {
    const companyIsOther = item.company
      ? !companyOptions.some((opt) => opt.value === item.company)
      : false;
    const standardIsOther = item.standard
      ? !standardOptions.some((opt) => opt.value === item.standard)
      : false;
    const lembagaIsOther = item.lembaga
      ? !lembagaOptions.some((opt) => opt.value === item.lembaga)
      : false;

    setIsOtherCompany(companyIsOther);
    setIsOtherStandard(standardIsOther);
    setIsOtherLembaga(lembagaIsOther);

    setFormData({
      nama: item.nama || "",
      npk: item.npk || "",
      seksi: item.seksi || "",
      company: item.company || "",
      plant: item.plant || "",
      pic: item.pic || "",
      skema: item.id_skema || "",
      standard: item.standard || "",
      lembaga: item.lembaga || "",
    });

    setSelectedId(item.id_pendaftaran);
    setShowModal(true);
  };

  // ======================
  // Handle Delete
  // ======================
  const handleDeletePendaftaran = async (id_pendaftaran, nama) => {
    const confirmDelete = confirm(`Yakin ingin menghapus pendaftaran atas nama "${nama}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/pendaftaran-sertifikasi/delete-pendaftaran", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pendaftaran }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal hapus");
      }

      await fetchPendaftaran();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus pendaftaran");
    }
  };

  // ======================
  // Handle Update
  // ======================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.npk || !formData.skema || !formData.standard || !formData.lembaga) {
      alert("Nama, NPK, Skema, Standard, dan Lembaga wajib diisi!");
      return;
    }

    const payload = {
      id_pendaftaran: selectedId,
      nama: formData.nama,
      npk: formData.npk,
      seksi: formData.seksi || "",
      company: formData.company || "",
      plant: formData.plant || "",
      pic: formData.pic || "",
      skema: formData.skema,
      standard: formData.standard,
      lembaga: formData.lembaga,
    };

    try {
      const res = await fetch("/api/pendaftaran-sertifikasi/update-pendaftaran", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update");

      setShowModal(false);
      await fetchPendaftaran();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Error detail:", err);
      alert(err.message || "Gagal update data");
    }
  };

  // ======================
  // Close Modal
  // ======================
  const closeModal = () => setShowModal(false);

  // ======================
  // Filter & Pagination
  // ======================
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

  // ======================
  // Render Tabel
  // ======================
  const renderTableContent = () => {
    if (filteredPendaftaran.length === 0) {
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
              <th>PIC</th>
              <th>Skema Sertifikasi</th>
              <th>Standard</th>
              <th>Lembaga</th>
              <th>Aksi</th>
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
                <td className={styles.actionButtons}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={`${styles.btnAction} ${styles.btnEdit}`}
                    title="Edit"
                    aria-label={`Edit ${item.nama}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePendaftaran(item.id_pendaftaran, item.nama)}
                    className={`${styles.btnAction} ${styles.btnDelete}`}
                    title="Hapus"
                    aria-label={`Hapus ${item.nama}`}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ======================
  // Render Main Content
  // ======================
  const renderMainContent = () => {
    if (loading) return <div className={styles.loadingMessage}>Memuat data...</div>;
    if (pendaftaran.length === 0) return <div className={styles.emptyMessage}>Tidak ada data pendaftaran sertifikasi.</div>;

    return (
      <div className={styles.detailContainer}>
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari nama, NPK, seksi, perusahaan, plant, PIC, skema, standard, atau lembaga..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Cari pendaftaran"
            />
          </div>
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

        <div className={styles.resultsInfo}>
          Menampilkan {filteredPendaftaran.length > 0 ? startIndex + 1 : 0} hingga{" "}
          {Math.min(endIndex, filteredPendaftaran.length)} dari {filteredPendaftaran.length} data
        </div>

        {renderTableContent()}

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
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Daftar Pendaftaran Sertifikasi</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Pendaftaran Sertifikasi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Daftar lengkap peserta pendaftaran sertifikasi.</p>
        </div>
      </section>

      <div className={styles.tabContainer}>
        <Link href="/admin/sertifikasi/pendaftaran-sertifikasi" className={styles.tabItem}>
          Form Pendaftaran
        </Link>
        <Link
          href="/admin/sertifikasi/pendaftaran-sertifikasi/daftar-pendaftaran"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Daftar Pendaftaran
        </Link>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {submitted && (
            <div className={styles.successMessage}>✓ Data berhasil diupdate!</div>
          )}
          {renderMainContent()}
        </div>
      </section>

      {/* Modal Edit */}
      <dialog ref={dialogRef} className={styles.modalOverlay} aria-labelledby="modal-title">
        <div className={styles.modalContent}>
          <button className={styles.closeIcon} onClick={closeModal} aria-label="Tutup modal">
            ×
          </button>

          <h3 id="modal-title">Edit Pendaftaran</h3>

          <form onSubmit={handleUpdate} className={styles.modalForm}>

            {/* NAMA */}
            <div className={styles.formGroup}>
              <label htmlFor="edit-nama" className={styles.formLabel}>Nama *</label>
              <input
                type="text" id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>

            {/* NPK */}
            <div className={styles.formGroup}>
              <label htmlFor="edit-npk" className={styles.formLabel}>NPK *</label>
              <input
                type="text" id="edit-npk"
                value={formData.npk}
                onChange={(e) => setFormData({ ...formData, npk: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>

            {/* SEKSI */}
            <div className={styles.formGroup}>
              <label htmlFor="edit-seksi" className={styles.formLabel}>Seksi</label>
              <input
                type="text" id="edit-seksi"
                value={formData.seksi}
                onChange={(e) => setFormData({ ...formData, seksi: e.target.value })}
                className={styles.formInput}
              />
            </div>

            {/* PERUSAHAAN */}
            <div className={styles.formGroup}>
              <fieldset className={styles.unitFieldset}>
                <legend className={styles.formLabel}>Perusahaan</legend>
                <Select
                  options={companyOptions}
                  value={
                    isOtherCompany
                      ? { value: "lainnya", label: "Lainnya" }
                      : companyOptions.find((opt) => opt.value === formData.company) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherCompany(true);
                      setFormData((prev) => ({ ...prev, company: "" }));
                    } else {
                      setIsOtherCompany(false);
                      setFormData((prev) => ({ ...prev, company: selected?.value || "" }));
                    }
                  }}
                  placeholder="Pilih perusahaan..."
                  isClearable
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
                {isOtherCompany && (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={styles.formInput}
                    placeholder="Masukkan nama perusahaan lainnya"
                    style={{ marginTop: "10px" }}
                  />
                )}
              </fieldset>
            </div>

            {/* PLANT */}
            <div className={styles.formGroup}>
              <label htmlFor="edit-plant" className={styles.formLabel}>Plant</label>
              <input
                type="text" id="edit-plant"
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                className={styles.formInput}
              />
            </div>

            {/* PIC */}
            <div className={styles.formGroup}>
              <label htmlFor="edit-pic" className={styles.formLabel}>PIC</label>
              <input
                type="text" id="edit-pic"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className={styles.formInput}
              />
            </div>

            {/* SKEMA */}
            <div className={styles.formGroup}>
              <fieldset className={styles.unitFieldset}>
                <legend className={styles.formLabel}>
                  Skema Sertifikasi <span className={styles.required}>*</span>
                </legend>
                {isSkemaLoading ? (
                  <div className={styles.loadingSelect} role="status" aria-live="polite">
                    Memuat skema...
                  </div>
                ) : (
                  <Select
                    options={skemaOptions}
                    value={skemaOptions.find((opt) => Number(opt.value) === Number(formData.skema)) || null}
                    onChange={(selected) =>
                      setFormData((prev) => ({ ...prev, skema: selected ? selected.value : "" }))
                    }
                    placeholder="Pilih skema..."
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                )}
              </fieldset>
            </div>

            {/* STANDARD */}
            <div className={styles.formGroup}>
              <fieldset className={styles.unitFieldset}>
                <legend className={styles.formLabel}>
                  Standard <span className={styles.required}>*</span>
                </legend>
                <Select
                  options={standardOptions}
                  value={
                    isOtherStandard
                      ? { value: "lainnya", label: "Lainnya" }
                      : standardOptions.find((opt) => opt.value === formData.standard) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherStandard(true);
                      setFormData((prev) => ({ ...prev, standard: "" }));
                    } else {
                      setIsOtherStandard(false);
                      setFormData((prev) => ({ ...prev, standard: selected?.value || "" }));
                    }
                  }}
                  placeholder="Pilih standard..."
                  isClearable
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
                {isOtherStandard && (
                  <input
                    type="text"
                    value={formData.standard}
                    onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                    className={styles.formInput}
                    placeholder="Masukkan nama standard lainnya"
                    style={{ marginTop: "10px" }}
                  />
                )}
              </fieldset>
            </div>

            {/* LEMBAGA */}
            <div className={styles.formGroup}>
              <fieldset className={styles.unitFieldset}>
                <legend className={styles.formLabel}>
                  Lembaga <span className={styles.required}>*</span>
                </legend>
                <Select
                  options={lembagaOptions}
                  value={
                    isOtherLembaga
                      ? { value: "lainnya", label: "Lainnya" }
                      : lembagaOptions.find((opt) => opt.value === formData.lembaga) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherLembaga(true);
                      setFormData((prev) => ({ ...prev, lembaga: "" }));
                    } else {
                      setIsOtherLembaga(false);
                      setFormData((prev) => ({ ...prev, lembaga: selected?.value || "" }));
                    }
                  }}
                  placeholder="Pilih lembaga..."
                  isClearable
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
                {isOtherLembaga && (
                  <input
                    type="text"
                    value={formData.lembaga}
                    onChange={(e) => setFormData({ ...formData, lembaga: e.target.value })}
                    className={styles.formInput}
                    placeholder="Masukkan nama lembaga lainnya"
                    style={{ marginTop: "10px" }}
                  />
                )}
              </fieldset>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={closeModal}>
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