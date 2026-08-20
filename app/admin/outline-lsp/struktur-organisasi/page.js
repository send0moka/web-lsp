"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./struktur-organisasi.module.css";

export default function StrukturOrganisasi() {
  const [imagePath, setImagePath] = useState("/image/struktur-organisasi/Struktur-Organisasi.png");
  const [isAdmin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchImagePath();
  }, []);

  // ✅ Keyboard handler di useEffect — identik dengan pola TUK, Asesor, Skema
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen && !isUploading) {
        closeModal();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isUploading]);

  // ✅ Overflow lock — dipisah agar cleanup selalu konsisten
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const fetchImagePath = async () => {
    try {
      const response = await fetch("/api/struktur-organisasi");
      const data = await response.json();
      if (data.path) {
        setImagePath(data.path);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: "error", text: "Format file harus JPG, PNG, atau WEBP" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran file maksimal 5MB" });
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setMessage({ type: "", text: "" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Pilih file terlebih dahulu" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/struktur-organisasi", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Gambar berhasil diupdate!" });
        setImagePath(result.path + "?t=" + Date.now());
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Upload gagal" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan pada server"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setMessage({ type: "", text: "" });
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Struktur Organisasi</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Struktur Organisasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Bagan organisasi dan penanggung jawab tiap fungsi.
          </p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          <div className={styles.orgImageContainer}>
            {isAdmin && (
              <div className={styles.editButtonContainer}>
                <button onClick={openModal} className={styles.editButtonRed}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                    <path d="M4 20h16" />
                  </svg>
                  Ubah Gambar
                </button>
              </div>
            )}
            <div className={styles.orgImageWrapper}>
              <img
                src={imagePath}
                alt="Struktur Organisasi LSP Denso Indonesia"
                className={styles.orgImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <>
          <button
            type="button"
            className={styles.modalOverlay}
            aria-label="Tutup modal"
            tabIndex={-1}
            onClick={() => { if (!isUploading) closeModal(); }}
          />

          <dialog
            open
            className={styles.modalContainer}
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                Ubah Struktur Organisasi
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Tutup modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {message.text && (
                <div className={`${styles.modalMessage} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.modalPreviewArea}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview gambar baru"
                    className={styles.modalPreviewImage}
                  />
                ) : (
                  <div className={styles.modalPreviewPlaceholder}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="2.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>Preview gambar baru akan muncul di sini</p>
                    <p className={styles.modalPreviewHint}>Gambar saat ini:</p>
                    <img
                      src={imagePath}
                      alt="Struktur organisasi saat ini"
                      className={styles.modalCurrentImage}
                    />
                  </div>
                )}
              </div>

              <div className={styles.modalFileInputWrapper}>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className={styles.modalFileInput}
                />
                <label htmlFor="imageUpload" className={styles.modalFileInputLabel}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                  Pilih Gambar Baru
                </label>
              </div>

              <p className={styles.modalHint}>
                Format: JPG, PNG, WEBP (Maks. 5MB)
              </p>

              <div className={styles.modalButtonGroup}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.modalCancelButton}
                  disabled={isUploading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  className={styles.modalUploadButton}
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <span className={styles.spinner}></span>
                      {" "}Mengupload...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}