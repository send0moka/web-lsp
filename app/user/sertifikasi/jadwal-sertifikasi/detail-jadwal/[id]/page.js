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

  return (
    <main className={styles.container}>
      {/* ================= BREADCRUMB ================= */}
      <div className={styles.breadcrumb}>
        <Link href="/user/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <Link href="/user/sertifikasi/jadwal-sertifikasi/daftar-jadwal">
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
    </main>
  );
}