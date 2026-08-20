"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import styles from "./asesor-kompetensi-grid.module.css";

// Komponen terpisah untuk item asesor
function AssessorItem({ assessor }) {
  const fotoPath = assessor.foto_url || "/image/foto_kosong.jpg";

  return (
    <div className={styles.assessorItem}>
      <img
        src={fotoPath}
        alt={assessor.nama}
        className={styles.assessorPhoto}
        onError={(e) => {
          e.currentTarget.src = "/image/foto_kosong.jpg";
        }}
      />
      <p className={styles.assessorName}>{assessor.nama}</p>
    </div>
  );
}

AssessorItem.propTypes = {
  assessor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nama: PropTypes.string.isRequired,
    foto_url: PropTypes.string,
  }).isRequired,
};

function AssessorsInCard({ asesor }) {
  if (!asesor || asesor.length === 0) {
    return <p className={styles.emptyAssessor}>Tidak ada asesor</p>;
  }

  return (
    <div className={styles.assessorsInCard}>
      {asesor.map((assessor) => (
        <AssessorItem key={assessor.id} assessor={assessor} />
      ))}
    </div>
  );
}

AssessorsInCard.propTypes = {
  asesor: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nama: PropTypes.string.isRequired,
      foto_url: PropTypes.string,
    })
  ),
};

AssessorsInCard.defaultProps = {
  asesor: [],
};

function SchemeCard({ scheme }) {
  return (
    <div className={styles.outlineCard}>
      <div className={styles.schemeHeader}>
        <h3 className={styles.cardTitle}>{scheme.nama_skema}</h3>
      </div>
      <AssessorsInCard asesor={scheme.asesor} />
    </div>
  );
}

SchemeCard.propTypes = {
  scheme: PropTypes.shape({
    schemeId: PropTypes.number.isRequired,
    nama_skema: PropTypes.string.isRequired,
    asesor: PropTypes.array,
  }).isRequired,
};

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

  const renderContent = () => {
    if (error) return <div className={styles.errorMessage}>{error}</div>;
    if (loading) return <div className={styles.loadingMessage}>Memuat data...</div>;
    if (schemes.length === 0) {
      return <div className={styles.emptyMessage}>Tidak ada data asesor kompetensi.</div>;
    }

    return (
      <div className={styles.outlineGrid}>
        {schemes.map((scheme) => (
          <SchemeCard key={scheme.schemeId} scheme={scheme} />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Asesor Kompetensi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Asesor Kompetensi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>
            Asesor bersertifikat yang siap melakukan penilaian kompetensi.
          </p>
        </div>
      </section>

      {/* Tab */}
      <div className={styles.tabContainer}>
        <Link
          href="/admin/outline-lsp/asesor-kompetensi/grid"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Asesor Kompetensi
        </Link>
        <Link
          href="/admin/outline-lsp/asesor-kompetensi"
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