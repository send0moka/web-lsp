'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './user.module.css';

export default function UserHome() {
  const [isVisible, setIsVisible] = useState({});
  const [statsData, setStatsData] = useState({
    totalSkema: 0,
    totalAsesor: 0,
    totalTUK: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/dashboard-stats', {
          signal: controller.signal,
          next: { revalidate: 3600 }
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        setStatsData({
          totalSkema: data.totalSkema || 0,
          totalAsesor: data.totalAsesor || 0,
          totalTUK: data.totalTUK || 0
        });
      } catch (error) {
        console.error('Gagal mengambil data statistik:', error);
        const cached = localStorage.getItem('dashboardStats');
        if (cached) {
          setStatsData(JSON.parse(cached));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  const checkSectionVisibility = (section) => {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      const isSectionVisible = rect.top < window.innerHeight - 100;
      setIsVisible(prev => ({ ...prev, [section]: isSectionVisible }));
    }
  };

  const checkAllSectionsVisibility = () => {
    const sections = ['about', 'features', 'statistics', 'services'];
    sections.forEach(checkSectionVisibility);
  };

  useEffect(() => {
    window.addEventListener('scroll', checkAllSectionsVisibility);
    checkAllSectionsVisibility();
    
    return () => window.removeEventListener('scroll', checkAllSectionsVisibility);
  }, []);

  // ✅ Tambah field id sebagai key yang stabil dan unik
  const stats = [
    { id: 'skema-sertifikasi', number: statsData.totalSkema.toString(), label: 'Skema Sertifikasi', icon: '📋' },
    { id: 'asesor-kompeten', number: statsData.totalAsesor.toString(), label: 'Asesor Kompeten', icon: '👨‍🏫' },
    { id: 'tempat-uji-kompetensi', number: statsData.totalTUK.toString(), label: 'Tempat Uji Kompetensi (TUK)', icon: '🏫' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badge}>Terakreditasi BNSP</span>
          </div>
          <h1 className={styles.heroTitle}>
            Selamat Datang di <span className={styles.titleHighlight}>LSP Denso Indonesia</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Platform manajemen sertifikasi kompetensi yang aman, transparan, 
            dan terakreditasi nasional
          </p>
          <div className={styles.heroButtons}>
            <Link href="/login" className={styles.btnPrimary}>
              <span>Login</span>
              <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="/outline-lsp/daftar-mitra" className={styles.btnSecondary}>
              Lihat Mitra Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className={`${styles.statistics} ${isVisible.statistics ? styles.fadeIn : ''}`}>
        <div className={styles.container}>
          {loading ? (
            <div className={styles.loadingStats}>
              <div className={styles.spinner}></div>
              <p>Memuat data statistik...</p>
            </div>
          ) : (
            <div className={styles.statsGrid}>
              {/* ✅ Ganti key={idx} → key={stat.id} */}
              {stats.map((stat) => (
                <div key={stat.id} className={styles.statCard}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`${styles.about} ${isVisible.about ? styles.fadeIn : ''}`}>
        <div className={styles.container}>
          <div className={styles.aboutWrapper}>
            <div className={styles.aboutContent}>
              <span className={styles.sectionTag}>Tentang Kami</span>
              <h2 className={styles.sectionTitle}>
                Tentang LSP Denso Indonesia
              </h2>
              <div className={styles.aboutText}>
                <p>
                  <strong>LSP Denso Indonesia (LSPDI)</strong> adalah LSP Pihak Kedua yang berada di bawah{" "}
                  <strong>PT Denso Indonesia</strong> dengan tujuan pendirian untuk memastikan kompetensi
                  karyawan beserta jejaringnya.
                </p>
                <p>
                  Saat ini LSPDI memiliki{" "}
                  <strong>{statsData.totalSkema} skema sertifikasi</strong> dengan{" "}
                  <strong>{statsData.totalAsesor} asesor</strong> dan{" "}
                  <strong>{statsData.totalTUK}</strong>
                </p>
              </div>
              <div className={styles.aboutStats}>
                <div className={styles.aboutStat}>
                  <div className={styles.aboutStatNumber}>2023</div>
                  <div className={styles.aboutStatLabel}>Tahun Berdiri</div>
                </div>
                <div className={styles.aboutStat}>
                  <div className={styles.aboutStatNumber}>100%</div>
                  <div className={styles.aboutStatLabel}>Terakreditasi</div>
                </div>
              </div>
            </div>
            <div className={styles.aboutImage}>
              <div className={styles.imageWrapper}>
                <div className={styles.imagePlaceholder}>
                  <span>🏭</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaIcon}>📞</div>
          <h2>Siap Meningkatkan Kompetensi Karyawan Anda?</h2>
          <p>Hubungi admin LSP Denso Indonesia untuk informasi lebih lanjut</p>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <a href="mailto:lsp.denso@gmail.com" className={styles.contactLink}>
                lsp.denso@gmail.com
              </a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📷</span>
              <a 
                href="https://instagram.com/lspdensoindonesia" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                @lspdensoindonesia
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}