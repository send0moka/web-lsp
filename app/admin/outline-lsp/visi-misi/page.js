"use client";

import Link from "next/link";
import styles from "./visi-misi.module.css";

export default function VisiMisi() {
  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Visi dan Misi LSP</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Visi dan Misi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Visi dan misi yang menjadi landasan operasional dan pengembangan LSP.</p>
        </div>
      </section>

      {/* Content - ISI TIDAK BERUBAH */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          <h2 className={styles.sectionTitle}>Visi</h2>
          <p>
            Menjadikan LSP Denso Indonesia sebagai lembaga sertifikasi yang independen dan profesional 
            dalam membangun sumber daya manusia (SDM) industri manufaktur komponen otomotif di Indonesia.
          </p>

          <h2 className={styles.sectionTitle}>Misi</h2>
          <ul className={styles.misiList}>
            <li>Menjamin kualitas dan kompetensi SDM industri manufaktur komponen otomotif sesuai dengan standar internasional.</li>
            <li>Memberikan jaminan bahwa produk dari perusahaan dengan tenaga kerja bersertifikat memenuhi standar kualitas yang ditetapkan.</li>
          </ul>
        </div>
      </section>
    </>
  );
}