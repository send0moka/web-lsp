"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./jadwal-detail.module.css";

export default function JadwalDetail() {
  const params = useParams();
  const id = params?.id;

  const [jadwal, setJadwal] = useState(null);
  const [peserta, setPeserta] = useState([]);
  const [calonPeserta, setCalonPeserta] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH DETAIL =================
  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/jadwal-sertifikasi/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fetch gagal");
      }

      setJadwal(data.jadwal);
      setPeserta(data.peserta || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat detail jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
  };

  // ================= BUKA MODAL =================
  const handleTambahPeserta = async () => {
    try {
      const res = await fetch(
        `/api/jadwal-sertifikasi/${id}/calon-peserta`
      );
      const data = await res.json();

      setCalonPeserta(data.peserta || []);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data peserta");
    }
  };

  // ================= ASSIGN PESERTA =================
  const handleAssign = async (id_pendaftaran) => {
    try {
      await fetch("/api/jadwal-sertifikasi/assign-peserta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_pendaftaran,
          id_jadwal: id,
        }),
      });

      setShowModal(false);
      fetchDetail(); // refresh data tanpa reload page
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan peserta");
    }
  };

  // ================= REMOVE PESERTA =================
  const handleRemove = async (id_pendaftaran) => {
    const confirmDelete = confirm("Yakin ingin menghapus peserta dari jadwal?");
    if (!confirmDelete) return;

    try {
      await fetch("/api/jadwal-sertifikasi/remove-peserta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_pendaftaran }),
      });

      fetchDetail(); // refresh data
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus peserta");
    }
  };

  return (
    <main className={styles.container}>
      {/* ================= BREADCRUMB ================= */}
      <div className={styles.breadcrumb}>
        <Link href="/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <Link href="/sertifikasi/jadwal-sertifikasi/daftar-jadwal">
          Daftar Jadwal
        </Link>
        <span>/</span>
        <span>Detail Jadwal</span>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {loading && <div className={styles.loading}>Memuat...</div>}

          {!loading && jadwal && (
            <div className={styles.detailContainer}>
              {/* ================= DETAIL JADWAL ================= */}
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Nama Skema</span>
                  <span>:</span>
                  <span>{jadwal.nama_skema}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tanggal</span>
                  <span>:</span>
                  <span>
                    {formatDate(jadwal.tanggal_mulai)} -{" "}
                    {formatDate(jadwal.tanggal_selesai)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>TUK</span>
                  <span>:</span>
                  <span>{jadwal.nama_tuk}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Asesor</span>
                  <span>:</span>
                  <span>{jadwal.asesor}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Trainer</span>
                  <span>:</span>
                  <span>{jadwal.trainer}</span>
                </div>
              </div>

              {/* ================= PESERTA ================= */}
              <div className={styles.unitsSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Daftar Peserta
                  </h2>

                  <button
                    className={styles.btnPrimary}
                    onClick={handleTambahPeserta}
                  >
                    + Tambah Peserta
                  </button>
                </div>

                {peserta.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama</th>
                          <th>NPK</th>
                          <th>Seksi</th>
                          <th>Company</th>
                          <th>Plant</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {peserta.map((p, index) => (
                          <tr key={p.id_pendaftaran}>
                            <td>{index + 1}</td>
                            <td>{p.nama}</td>
                            <td>{p.npk}</td>
                            <td>{p.seksi}</td>
                            <td>{p.company}</td>
                            <td>{p.plant}</td>
                            <td>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleRemove(p.id_pendaftaran)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Belum ada peserta</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>

            {/* Tombol Close (X) */}
            <button
              className={styles.closeIcon}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h3>Pilih Peserta</h3>

            {calonPeserta.length > 0 ? (
              calonPeserta.map((p) => (
                <div key={p.id_pendaftaran} className={styles.modalItem}>
                  <span>
                    {p.nama} ({p.npk})
                  </span>
                  <button
                    className={styles.btnPrimary}
                    onClick={() =>
                      handleAssign(p.id_pendaftaran)
                    }
                  >
                    Pilih
                  </button>
                </div>
              ))
            ) : (
              <p>Tidak ada peserta tersedia</p>
            )}

          </div>
        </div>
      )}
    </main>
  );
}