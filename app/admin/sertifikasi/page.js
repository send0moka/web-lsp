'use client';

import Link from 'next/link';
import styles from './sertifikasi.module.css';

export default function Sertifikasi() {
  const outlineItems = [
    {
      id: 'pendaftaran',
      icon: '📝',
      title: 'Pendaftaran Sertifikasi',
      description: 'Daftar dan ajukan sertifikasi kompetensi untuk berbagai skema yang tersedia',
      href: '/admin/sertifikasi/pendaftaran-sertifikasi'
    },
    {
      id: 'jadwal',
      icon: '📅',
      title: 'Jadwal Sertifikasi',
      description: 'Lihat jadwal pelaksanaan ujian sertifikasi untuk setiap skema kompetensi',
      href: '/admin/sertifikasi/jadwal-sertifikasi'
    },
    {
      id: 'hasil',
      icon: '📊',
      title: 'Hasil Sertifikasi',
      description: 'Informasi kelulusan dan hasil ujian sertifikasi kompetensi',
      href: '/admin/sertifikasi/hasil-sertifikasi'
    },
    {
      id: 'history',
      icon: '🗂️',
      title: 'History Sertifikasi',
      description: 'Riwayat sertifikasi yang pernah diikuti beserta detailnya',
      href: '/admin/sertifikasi/history-sertifikasi'
    },
    {
      id: 'summary',
      icon: '📈',
      title: 'Summary Report',
      description: 'Ringkasan laporan statistik dan rekapitulasi data sertifikasi',
      href: '/admin/sertifikasi/summary-report'
    }
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Sertifikasi</span>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sertifikasi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>
            Pelajari lebih lanjut tentang pendaftaran, jadwal, hasil, history, dan summary report sertifikasi di LSP Denso Indonesia
          </p>
        </div>
      </section>

      {/* Outline Items Section */}
      <section className={styles.outlineSection}>
        <div className={styles.container_inner}>
          {/* <h2 className={styles.sectionTitle}>Menu Sertifikasi</h2> */}
          <div className={styles.outlineGrid}>
            {outlineItems.map((item) => (
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