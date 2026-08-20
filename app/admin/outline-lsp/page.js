'use client';

import Link from 'next/link';
import styles from './outline-lsp.module.css';

export default function OutlineLSP() {
  const outlineItems = [
  {
    id: "visi-misi",
    icon: '🎯',
    title: 'Visi dan Misi LSP',
    description: 'Visi dan misi Lembaga Sertifikasi Profesi Denso Indonesia',
    href: '/admin/outline-lsp/visi-misi'
  },
  {
    id: "struktur-organisasi",
    icon: '🏢',
    title: 'Struktur Organisasi',
    description: 'Struktur organisasi lengkap dan uraian tugas setiap departemen',
    href: '/admin/outline-lsp/struktur-organisasi'
  },
  {
    id: "daftar-mitra",
    icon: '🤝',
    title: 'Daftar Mitra',
    description: 'Mitra-mitra yang bekerja sama dengan LSP Denso Indonesia',
    href: '/admin/outline-lsp/daftar-mitra'
  },
  {
    id: "skema-sertifikasi",
    icon: '📋',
    title: 'Skema Sertifikasi',
    description: 'Berbagai skema sertifikasi yang ada di LSP Denso Indonesia',
    href: '/admin/outline-lsp/skema-sertifikasi'
  },
  {
    id: "asesor-kompetensi",
    icon: '👨‍🏫',
    title: 'Asesor Kompetensi',
    description: 'Daftar asesor bersertifikat yang siap melakukan penilaian kompetensi',
    href: '/admin/outline-lsp/asesor-kompetensi'
  },
  {
    id: "tempat-uji-kompetensi",
    icon: '🏭',
    title: 'Tempat Uji Kompetensi',
    description: 'Lokasi-lokasi tempat uji kompetensi di LSP Denso Indonesia',
    href: '/admin/outline-lsp/tempat-uji-kompetensi'
  }
];

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Outline LSP</span>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Outline LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>
            Lihat lebih lanjut tentang visi, misi, struktur organisasi, dan layanan LSP Denso Indonesia
          </p>
        </div>
      </section>

      {/* Outline Items Section */}
      <section className={styles.outlineSection}>
        <div className={styles.container_inner}>
          {/* <h2 className={styles.sectionTitle}>Menu Outline LSP</h2> */}
          <div className={styles.outlineGrid}>
            {outlineItems.map((item, index) => (
              <div key={item.id} className={styles.outlineCard}>
                <div className={styles.outlineIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={item.href} className={styles.btnSecondary}>
                  Lihat Lebih Lanjut
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
