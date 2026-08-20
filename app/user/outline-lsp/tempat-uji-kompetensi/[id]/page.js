"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./tuk-detail.module.css";

export default function TukDetail() {
  const params = useParams();
  const id = params?.id;

  const [tuk, setTuk] = useState(null);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTuk = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/tempat-uji-kompetensi/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Fetch gagal");
        }

        setTuk(data.tuk || null);
        setSkemaList(data.skema || []);

      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail TUK");
      } finally {
        setLoading(false);
      }
    };

    fetchTuk();
  }, [id]);

  return (
    <main className={styles.container}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <Link href="/user/outline-lsp/tempat-uji-kompetensi">Tempat Uji Kompetensi</Link>
        <span>/</span>
        <span>
          {loading ? "Loading..." : tuk?.nama_tuk || "Detail"}
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

          {!loading && !tuk && (
            <div>Data tidak ditemukan</div>
          )}

          {!loading && tuk && (
            <div className={styles.detailContainer}>

              {/* DETAIL TUK */}
              <div className={styles.headerGrid}>

                {/* INFO */}
                <div className={styles.detailGrid}>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Kode TUK</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {tuk.kode_tuk}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nama</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {tuk.nama_tuk}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Jenis</span>
                    <span className={styles.detailColon}>:</span>
                    <span className={styles.detailValue}>
                      {tuk.jenis_tuk}
                    </span>
                  </div>

                </div>

                {/* FOTO */}
                <div className={styles.photoWrapper}>
                  <img
                    src={tuk.foto_tuk || "/no-image.png"}
                    alt={tuk.nama_tuk}
                    className={styles.photo}
                  />
                </div>

              </div>

              {/* SKEMA DI TUK */}
              <div className={styles.unitsSection}>
                <h2 className={styles.sectionTitle}>
                  Skema Sertifikasi di TUK
                </h2>

                {skemaList.length > 0 ? (
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
                        {skemaList.map((item, index) => (
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