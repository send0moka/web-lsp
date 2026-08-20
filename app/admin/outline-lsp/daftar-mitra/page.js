"use client";

import Link from "next/link";
import styles from "./daftar-mitra.module.css";

export default function DaftarMitra() {
  const mitra = [
    { id: 1, name: "PT Denso Indonesia" },
    { id: 2, name: "PT Denso Sales Indonesia" },
    { id: 3, name: "PT Denso Manufacture Indonesia" },
    { id: 4, name: "PT Hamanoko Denso Indonesia" },
    { id: 5, name: "PT Toyota Denso Automotive Compressor Indonesia" },
    { id: 6, name: "Denso Suppliers" },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Daftar Mitra</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Daftar Mitra LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Mitra-mitra yang bekerja sama dengan LSP Denso Indonesia.</p>
        </div>
      </section>

      {/* Content: Table */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {/* <h2 className={styles.sectionTitle}>Daftar Mitra</h2> */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Mitra</th>
                </tr>
              </thead>
              <tbody>
                {mitra.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}.</td>
                    <td>{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
