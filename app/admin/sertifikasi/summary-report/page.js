"use client";

import Link from "next/link";
import styles from "./summary-report.module.css";
import { useEffect, useState, useMemo } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SummaryReport() {

  const [history, setHistory] = useState([]);
  const [setReportData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterTahun, setFilterTahun] = useState("");
  const [skemaList, setSkemaList] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);

  // ======================
  // FETCH DATA
  // ======================
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history-sertifikasi");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSkema = async () => {
    try {
      const res = await fetch("/api/skema-sertifikasi");
      const data = await res.json();
      setSkemaList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJadwal = async () => {
    try {
      const res = await fetch("/api/jadwal-sertifikasi/daftar-jadwal");
      const data = await res.json();
      setJadwal(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await fetch("/api/summary-report"); 
      const data = await res.json();
      setReportData(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendaftaran = async () => {
    try {
      const res = await fetch("/api/pendaftaran-sertifikasi/daftar-pendaftaran");
      const data = await res.json();
      setPendaftaran(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchHistory(),
        fetchSkema(),
        fetchReport(),
        fetchJadwal(),
        fetchPendaftaran()
      ]);
      setLoading(false);
    };

    init();
  }, []);

  // ======================
  // LIST TAHUN
  // ======================
  const uniqueTahun = [
    ...new Set(
      history
        .map(item => item.tanggal_selesai?.slice(0,4))
        .filter(Boolean)
    )
  ].sort((a, b) => a - b);

  // ======================
  // FILTER DATA (MENGGUNAKAN useMemo)
  // ======================
  
  // Filter history berdasarkan tahun
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (!filterTahun) return true;
      return item.tanggal_selesai?.slice(0,4) === filterTahun;
    });
  }, [history, filterTahun]);

  // Filter jadwal berdasarkan tahun
  const filteredJadwal = useMemo(() => {
    return jadwal.filter(item => {
      if (!filterTahun) return true;
      return item.tanggal_selesai?.slice(0,4) === filterTahun;
    });
  }, [jadwal, filterTahun]);

  // History selesai berdasarkan tahun (untuk actual peserta)
  const historySelesai = useMemo(() => {
    return history.filter(item => {
      if (!filterTahun) return true;
      return item.tanggal_selesai?.slice(0,4) === filterTahun;
    });
  }, [history, filterTahun]);

  // Filter pendaftaran berdasarkan tahun jadwalnya
  const filteredPendaftaran = useMemo(() => {
    if (!filterTahun) return pendaftaran;
    
    return pendaftaran.filter(item => {
      if (!item.id_jadwal) return false;
      const jadwalItem = jadwal.find(j => j.id_jadwal === item.id_jadwal);
      return jadwalItem && jadwalItem.tanggal_selesai?.slice(0,4) === filterTahun;
    });
  }, [pendaftaran, jadwal, filterTahun]);

  // ======================
  // TOTAL PESERTA
  // ======================
  const totalPeserta = filteredHistory.length;

  // ======================
  // DATA PER BULAN
  // ======================
  const bulan = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Agu","Sep","Okt","Nov","Des"
  ];

  const actualPerBulan = new Array(12).fill(0);
  const planPerBulan = new Array(12).fill(0);

  // ACTUAL → dari history (MENGGUNAKAN LOGIKA UNIQUE EVENT)
  const jadwalUnik = new Set();

  filteredHistory.forEach((item) => {
    if (item.tanggal_selesai && item.nama_skema) {
      const key = item.nama_skema + "_" + item.tanggal_selesai;
      if (!jadwalUnik.has(key)) {
        jadwalUnik.add(key);
        const month = new Date(item.tanggal_selesai).getMonth();
        actualPerBulan[month]++;
      }
    }
  });

  // PLAN → dari jadwal
  filteredJadwal.forEach((item) => {
    if (item.tanggal_selesai) {
      const month = new Date(item.tanggal_selesai).getMonth();
      planPerBulan[month]++;
    }
  });

  const chartBulanan = {
    labels: bulan,
    datasets: [
      {
        label: "Actual",
        data: actualPerBulan,
        backgroundColor: "#3b82f6"  
      },
      {
        label: "Plan",
        data: planPerBulan,
        backgroundColor: "#f59e0b"  
      }
    ]
  };

  // ======================
  // DATA PER SKEMA (SEMUA SKEMA TETAP MUNCUL)
  // ======================
  
  // Inisialisasi map dengan semua skema dari skemaList (nilai awal 0)
  const skemaActualMap = {};
  const skemaPlanMap = {};

  skemaList.forEach((skema) => {
    skemaActualMap[skema.nama_skema] = 0;
    skemaPlanMap[skema.nama_skema] = 0;
  });

  // PLAN = peserta yang sudah masuk jadwal (menggunakan filteredPendaftaran)
  filteredPendaftaran.forEach((item) => {
    if (item.id_jadwal && item.nama_skema && skemaPlanMap[item.nama_skema] !== undefined) {
      skemaPlanMap[item.nama_skema]++;
    }
  });

  // ACTUAL = yang sudah selesai (menggunakan historySelesai)
  historySelesai.forEach((item) => {
    if (item.nama_skema && skemaActualMap[item.nama_skema] !== undefined) {
      skemaActualMap[item.nama_skema]++;
    }
  });

  const formatLabel = (label) => {
    const words = label.split(" ");
    if (words.length <= 3) return label;
    const lastWord = words[words.length - 1]; 
    const short = words.slice(0, 2).join(" "); 
    return `${short}... ${lastWord}`;
  };

  const chartSkema = {
    labels: Object.keys(skemaActualMap).map(label => formatLabel(label)),
    datasets: [
      {
        label: "Actual",
        data: Object.values(skemaActualMap),
        backgroundColor: "#10b981"  
      },
      {
        label: "Plan",
        data: Object.values(skemaPlanMap),
        backgroundColor: "#8b5cf6"  
      }
    ]
  };

  // ======================
  // PERHITUNGAN UNTUK PIE CHART (PER EVENT)
  // ======================
  const calculateActualEvents = useMemo(() => {
    const eventSet = new Set();
    filteredHistory.forEach((item) => {
      if (item.tanggal_selesai && item.nama_skema) {
        const key = `${item.nama_skema}_${item.tanggal_selesai}`;
        eventSet.add(key);
      }
    });
    return eventSet.size;
  }, [filteredHistory]);

  const calculatePlanEvents = useMemo(() => {
    if (filterTahun) {
      return filteredJadwal.length;
    }
    return jadwal.length;
  }, [filterTahun, filteredJadwal, jadwal]);

  const totalActualEvents = calculateActualEvents;
  const totalPlanEvents = calculatePlanEvents;

  const pieChartEventData = {
    labels: ['Actual (Event Selesai)', 'Plan (Event Direncanakan)'],
    datasets: [
      {
        data: [totalActualEvents, totalPlanEvents],
        backgroundColor: ['#3b82f6', '#f59e0b'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // ======================
  // PERHITUNGAN UNTUK PIE CHART (PER JUMLAH PESERTA)
  // ======================
  const totalActualParticipants = filteredHistory.length;
  const totalPlanParticipants = filteredPendaftaran.length;

  const pieChartParticipantData = {
    labels: ['Actual (Peserta Selesai)', 'Plan (Peserta Terdaftar)'],
    datasets: [
      {
        data: [totalActualParticipants, totalPlanParticipants],
        backgroundColor: ['#10b981', '#8b5cf6'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // ======================
  // OPTIONS CHART
  // ======================
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const optionsSkema = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false, // biar semua label tetap muncul
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(context) {
            return Object.keys(skemaActualMap)[context[0].dataIndex];
          }
        }
      },
      legend: {
        position: 'top',
      }
    }
  };

  const optionsDefault = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Summary Report</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Summary Report Sertifikasi</h1>
          <p className={styles.heroSubtitle}>
            Ringkasan data sertifikasi peserta dalam bentuk statistik dan grafik.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>
          {loading ? (
            <div className={styles.loadingMessage}>Memuat data laporan...</div>
          ) : (
            <div className={styles.reportContainer}>
              {/* FILTER */}
              <div className={styles.filterContainer}>
                <label htmlFor="filter-tahun">Pilih Tahun:</label>

                <select
                  id="filter-tahun"
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className={styles.yearSelect}
                >
                  <option value="">Semua Tahun</option>
                  {uniqueTahun.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>

              {/* TOTAL */}
              <div className={styles.summaryCard}>
                <h3>Total Peserta Sertifikasi</h3>
                <p>{totalPeserta}</p>
              </div>

              {/* CHART BULAN */}
              <div className={styles.chartCard}>
                <h3>Jumlah Sertifikasi per Bulan</h3>
                <div style={{ height: "500px" }}>
                  <Bar data={chartBulanan} options={optionsDefault} />
                </div>
              </div>

              {/* CHART SKEMA */}
              <div className={styles.chartCard}>
                <h3>Jumlah Peserta Berdasarkan Skema</h3>
                <div style={{ height: "500px", overflowX: "auto" }}>
                  <Bar data={chartSkema} options={optionsSkema} />
                </div>
              </div>

              {/* PIE CHARTS SECTION */}
              <div className={styles.pieChartsContainer}>
                {/* Pie Chart 1: Perbandingan Event */}
                <div className={styles.pieChartCard}>
                  <h3>Perbandingan Plan vs Actual (Event)</h3>
                  <div className={styles.pieChartWrapper}>
                    <div style={{ height: "400px", position: "relative" }}>
                      <Pie data={pieChartEventData} options={pieOptions} />
                    </div>
                  </div>
                  <div className={styles.pieChartSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgeActual}></span>
                      <span>Event Selesai: <strong>{totalActualEvents}</strong></span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgePlan}></span>
                      <span>Event Direncanakan: <strong>{totalPlanEvents}</strong></span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgeDifference}></span>
                      <span>
                        Selisih: <strong>{Math.abs(totalPlanEvents - totalActualEvents)}</strong> event
                        {totalPlanEvents > 0 && (
                          <span> ({totalActualEvents > totalPlanEvents ? '+' : '-'}
                          {(((totalActualEvents - totalPlanEvents) / totalPlanEvents) * 100).toFixed(1)}%)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie Chart 2: Perbandingan Peserta */}
                <div className={styles.pieChartCard}>
                  <h3>Perbandingan Plan vs Actual (Peserta)</h3>
                  <div className={styles.pieChartWrapper}>
                    <div style={{ height: "400px", position: "relative" }}>
                      <Pie data={pieChartParticipantData} options={pieOptions} />
                    </div>
                  </div>
                  <div className={styles.pieChartSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgeActualParticipant}></span>
                      <span>Peserta Selesai: <strong>{totalActualParticipants}</strong></span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgePlanParticipant}></span>
                      <span>Peserta Terdaftar: <strong>{totalPlanParticipants}</strong></span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.badgeDifference}></span>
                      <span>
                        Selisih: <strong>{Math.abs(totalPlanParticipants - totalActualParticipants)}</strong> peserta
                        {totalPlanParticipants > 0 && (
                          <span> ({totalActualParticipants > totalPlanParticipants ? '+' : '-'}
                          {(((totalActualParticipants - totalPlanParticipants) / totalPlanParticipants) * 100).toFixed(1)}%)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}