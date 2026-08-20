"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./asesor-detail.module.css";

export default function AsesorDetail() {
  const params = useParams();
  const id = params?.id;

  const [asesor, setAsesor] = useState(null);
  const [skema, setSkema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/asesor-kompetensi/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error("Fetch gagal");

        setAsesor(data.asesor);
        setSkema(data.skema || []);

      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail asesor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className={styles.container}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <Link href="/admin/outline-lsp/asesor-kompetensi">Asesor Kompetensi</Link>
        <span>/</span>
        <span>{asesor?.nama_asesor || "Detail"}</span>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading && (
            <div className={styles.loading}>
              Memuat...
            </div>
          )}

          {!loading && asesor && (
            <div className={styles.detailContainer}>

              {/* GRID FOTO + DETAIL */}
              <div className={styles.profileGrid}>

                {/* FOTO */}
                <div className={styles.photoWrapper}>
                  <img
                    src={asesor.foto_url || "/image/default-user.png"}
                    alt={asesor.nama_asesor}
                    className={styles.photo}
                  />
                </div>

                {/* INFO */}
                <div className={styles.infoGrid}>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nama</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {asesor.nama_asesor}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>No Registrasi</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {asesor.no_registrasi}
                    </span>
                  </div>

                </div>

              </div>

              {/* TABEL SKEMA */}
              <div className={styles.unitsSection}>
                <h2 className={styles.sectionTitle}>
                  Skema Sertifikasi
                </h2>

                {skema.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Kode Skema</th>
                          <th>Nama Skema</th>
                          <th>Jenis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skema.map((item, index) => (
                          <tr key={item.id_skema}>
                            <td>{index + 1}</td>
                            <td>{item.kode_skema}</td>
                            <td>{item.nama_skema}</td>
                            <td>{item.jenis_skema}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Belum ada skema</p>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}