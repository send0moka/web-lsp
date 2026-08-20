"use client";

import Link from "next/link";
import { useId } from "react";
import styles from "./daftar-mitra.module.css";

export default function DaftarMitra() {
  const id = useId();
  
  const mitra = [
    "PT Denso Indonesia",
    "PT Denso Sales Indonesia",
    "PT Denso Manufacture Indonesia",
    "PT Hamanoko Denso Indonesia",
    "PT Toyota Denso Automotive Compressor Indonesia",
    "Denso Suppliers",
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
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
                {mitra.map((name, idx) => (
                  <tr key={`${id}-${name}`}>
                    <td>{idx + 1}.</td>
                    <td>{name}</td>
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