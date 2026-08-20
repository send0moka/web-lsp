"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./skema-detail.module.css";

export default function SchemeDetail() {
  const params = useParams();
  const id = params?.id;

  const [scheme, setScheme] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchScheme = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/skema-sertifikasi/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Fetch gagal");
        }

        setScheme(data.skema || null);
        setUnits(data.units || []);

      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail skema");
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  return (
    <main className={styles.container}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <Link href="/user/outline-lsp/skema-sertifikasi">Skema Sertifikasi</Link>
        <span>/</span>
        <span>
          {loading ? "Loading..." : scheme?.nama_skema || "Detail"}
        </span>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading && (
            <div className={styles.loading}>
              Memuat...
            </div>
          )}

          {!loading && !scheme && (
            <div>Data tidak ditemukan</div>
          )}

          {!loading && scheme && (
            <div className={styles.detailContainer}>

              {/* DETAIL SKEMA */}
              <div className={styles.detailGrid}>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Kode Skema</span>
                  <span className={styles.detailColon}>:</span>
                  <span className={styles.detailValue}>
                    {scheme.kode_skema}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Nama</span>
                  <span className={styles.detailColon}>:</span>
                  <span className={styles.detailValue}>
                    {scheme.nama_skema}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Jenis</span>
                  <span className={styles.detailColon}>:</span>
                  <span className={styles.detailValue}>
                    {scheme.jenis_skema}
                  </span>
                </div>

                {scheme.deskripsi && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Deskripsi</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {scheme.deskripsi}
                    </span>
                  </div>
                )}

                {/* FOTO */}
                <div className={styles.photoWrapper}>
                  <img
                    src={scheme.foto_url || "/no-image.png"}
                    alt={scheme.nama_skema}
                    className={styles.photo}
                  />
                </div>

              </div>
              
              {/* UNIT KOMPETENSI */}
              <div className={styles.unitsSection}>
                <h2 className={styles.sectionTitle}>
                  Unit Kompetensi
                </h2>

                {units.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Kode Unit</th>
                          <th>Nama Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.map((unit, index) => (
                          <tr key={unit.id_unit}>
                            <td>{index + 1}</td>
                            <td>{unit.kode_unit}</td>
                            <td>{unit.nama_unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Belum ada unit kompetensi</p>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}
