"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./struktur-organisasi.module.css";

export default function StrukturOrganisasi() {
  const [imagePath, setImagePath] = useState("/image/struktur-organisasi/Struktur-Organisasi.png");

  useEffect(() => {
    fetchImagePath();
  }, []);

  const fetchImagePath = async () => {
    try {
      const response = await fetch("/api/struktur-organisasi");
      const data = await response.json();
      if (data.path) {
        setImagePath(data.path);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/user/outline-lsp">Outline LSP</Link>
        <span>/</span>
        <span>Struktur Organisasi</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Struktur Organisasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Bagan organisasi dan penanggung jawab tiap fungsi.
          </p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          <div className={styles.orgImageWrapper}>
            <img
              src={imagePath}
              alt="Struktur Organisasi LSP Denso Indonesia"
              className={styles.orgImage}
            />
          </div>
        </div>
      </section>
    </>
  );
}