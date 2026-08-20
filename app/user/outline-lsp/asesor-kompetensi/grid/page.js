"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./asesor-kompetensi-grid.module.css";

export default function AsesorKompetensiGrid() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/asesor-kompetensi?type=grid");

        if (!res.ok) throw new Error("Fetch gagal");

        const data = await res.json();
        setSchemes(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data asesor kompetensi");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // Render content based on state
  const renderContent = () => {
    if (error) {
      return <div className={styles.errorMessage}>{error}</div>;
    }

    if (loading) {
      return <div className={styles.loadingMessage}>Memuat data...</div>;
    }

    if (schemes.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          Tidak ada data asesor kompetensi.
        </div>
      );
    }

    return (
      <div className={styles.outlineGrid}>
        {schemes.map((scheme) => (
          <div key={scheme.schemeId} className={styles.outlineCard}>
            {/* Judul Skema */}
            <div className={styles.schemeHeader}>
              <h3 className={styles.cardTitle}>
                {scheme.nama_skema}
              </h3>
            </div>

            {/* List Asesor */}
            <div className={styles.assessorsInCard}>
              {renderAssessors(scheme.asesor)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render assessors list for each scheme
  const renderAssessors = (assessors) => {
    if (!assessors || assessors.length === 0) {
      return (
        <p className={styles.emptyAssessor}>
          Tidak ada asesor
        </p>
      );
    }

    return assessors.map((assessor) => {
      const fotoPath = assessor.foto_url
        ? `${assessor.foto_url}`
        : "/image/foto_kosong.jpg";

      return (
        <div
          key={assessor.id}
          className={styles.assessorItem}
        >
          <img
            src={fotoPath}
            alt={assessor.nama}
            className={styles.assessorPhoto}
            onError={(e) => {
              e.currentTarget.src = "/image/foto_kosong.jpg";
            }}
          />
          <p className={styles.assessorName}>
            {assessor.nama}
          </p>
        </div>
      );
    });
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Asesor Kompetensi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Asesor Kompetensi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Asesor bersertifikat yang siap melakukan penilaian kompetensi.
          </p>
        </div>
      </section>

      {/* Tab */}
      <div className={styles.tabContainer}>
        <Link
          href="/user/outline-lsp/asesor-kompetensi/grid"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Asesor Kompetensi
        </Link>
        
        <Link
          href="/user/outline-lsp/asesor-kompetensi"
          className={styles.tabItem}
        >
          Daftar Asesor
        </Link>
      </div>

      {/* Content */}
      <section className={styles.outlineSection}>
        <div className={styles.container_inner}>
          {renderContent()}
        </div>
      </section>
    </>
  );
}