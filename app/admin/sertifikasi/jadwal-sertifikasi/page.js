"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Select from "react-select";
import styles from "./jadwal-sertifikasi.module.css";

export default function JadwalSertifikasi() {

  const [formData, setFormData] = useState({
    skema: null,
    tanggal_mulai: "",  
    tanggal_selesai: "", 
    tuk: null,
    asesor: null,
    trainer: null,
  });

  const [skemaList, setSkemaList] = useState([]);
  const [tukList, setTukList] = useState([]);
  const [asesorList, setAsesorList] = useState([]);

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skemaRes, tukRes, asesorRes] = await Promise.all([
          fetch("/api/skema-sertifikasi"),
          fetch("/api/tempat-uji-kompetensi"),
          fetch("/api/asesor-kompetensi")
        ]);

        setSkemaList(await skemaRes.json() || []);
        setTukList(await tukRes.json() || []);
        setAsesorList(await asesorRes.json() || []);

      } catch (err) {
        console.error("Gagal ambil data", err);
      }
    };

    fetchData();
  }, []);

  // ======================
  // HANDLE CHANGE
  // ======================
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Field ini wajib diisi";
      }
    });

    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_mulai) > new Date(formData.tanggal_selesai)) {
        newErrors.tanggal_selesai = "Tanggal selesai harus setelah tanggal mulai";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("/api/jadwal-sertifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSubmitted(true);
      handleClear();

      setTimeout(() => setSubmitted(false), 2000);

    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  };

  // ======================
  // CLEAR
  // ======================
  const handleClear = () => {
    setFormData({
      skema: null,
      tanggal_mulai: "",
      tanggal_selesai: "",
      tuk: null,
      asesor: null,
      trainer: null,
    });
    setErrors({});
    setSubmitted(false);
  };

  // ======================
  // OPTIONS
  // ======================
  const skemaOptions = skemaList.map(item => ({
    value: item.id_skema,
    label: item.nama_skema
  }));

  const tukOptions = tukList.map(item => ({
    value: item.id_tuk,
    label: item.nama_tuk
  }));

  const asesorOptions = asesorList.map(item => ({
    value: item.id_asesor,
    label: item.nama_asesor
  }));

  const trainerOptions = asesorOptions;

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Jadwal Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Jadwal Sertifikasi LSP Denso Indonesia</h1>
          <p className={styles.heroSubtitle}>Pengaturan Jadwal Pelaksanaan Sertifikasi.</p>
        </div>
      </section>

      {/* TAB */}
      <div className={styles.tabContainer}>
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Buat Jadwal Training & Sertifikasi
        </Link>
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-jadwal"
          className={styles.tabItem}
        >
          Daftar Jadwal Training & Sertifikasi
        </Link>
        <Link
          href="/admin/sertifikasi/jadwal-sertifikasi/daftar-peserta"
          className={styles.tabItem}
        >
          Daftar Peserta
        </Link>
      </div>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>

          {submitted && (
            <div className={styles.successMessage}>✓ Jadwal berhasil disimpan!</div>
          )}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>

            {/* SKEMA */}
            <fieldset className={styles.formGroup}>
              <legend className={styles.formLabel}>Skema Sertifikasi *</legend>
              <Select
                classNamePrefix="react-select"
                options={skemaOptions}
                value={skemaOptions.find(opt => opt.value === formData.skema) || null}
                onChange={(val) => handleChange("skema", val?.value)}
                placeholder="Pilih Skema"
                isClearable
              />
              {errors.skema && <p className={styles.errorText}>{errors.skema}</p>}
            </fieldset>

            {/* TANGGAL MULAI */}
            <div className={styles.formGroup}>
              <label htmlFor="tanggal_mulai" className={styles.formLabel}>Tanggal Mulai *</label>
              <input
                type="date"
                id="tanggal_mulai"
                className={styles.formInput}
                value={formData.tanggal_mulai}
                onChange={(e) => handleChange("tanggal_mulai", e.target.value)}
              />
              {errors.tanggal_mulai && <p className={styles.errorText}>{errors.tanggal_mulai}</p>}
            </div>

            {/* TANGGAL SELESAI */}
            <div className={styles.formGroup}>
              <label htmlFor="tanggal_selesai" className={styles.formLabel}>Tanggal Selesai *</label>
              <input
                type="date"
                id="tanggal_selesai"
                className={styles.formInput}
                value={formData.tanggal_selesai}
                onChange={(e) => handleChange("tanggal_selesai", e.target.value)}
                min={formData.tanggal_mulai}
              />
              {errors.tanggal_selesai && <p className={styles.errorText}>{errors.tanggal_selesai}</p>}
            </div>

            {/* TUK */}
            <fieldset className={styles.formGroup}>
              <legend className={styles.formLabel}>Tempat Uji Kompetensi *</legend>
              <Select
                classNamePrefix="react-select"
                options={tukOptions}
                value={tukOptions.find(opt => opt.value === formData.tuk) || null}
                onChange={(val) => handleChange("tuk", val?.value)}
                placeholder="Pilih TUK"
                isClearable
              />
              {errors.tuk && <p className={styles.errorText}>{errors.tuk}</p>}
            </fieldset>

            {/* ASESOR */}
            <fieldset className={styles.formGroup}>
              <legend className={styles.formLabel}>Asesor *</legend>
              <Select
                classNamePrefix="react-select"
                options={asesorOptions}
                value={asesorOptions.find(opt => opt.value === formData.asesor) || null}
                onChange={(val) => handleChange("asesor", val?.value)}
                placeholder="Pilih Asesor"
                isClearable
              />
              {errors.asesor && <p className={styles.errorText}>{errors.asesor}</p>}
            </fieldset>

            {/* TRAINER */}
            <fieldset className={styles.formGroup}>
              <legend className={styles.formLabel}>Trainer *</legend>
              <Select
                classNamePrefix="react-select"
                options={trainerOptions}
                value={trainerOptions.find(opt => opt.value === formData.trainer) || null}
                onChange={(val) => handleChange("trainer", val?.value)}
                placeholder="Pilih Trainer"
                isClearable
              />
              {errors.trainer && <p className={styles.errorText}>{errors.trainer}</p>}
            </fieldset>

            {/* BUTTON */}
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleClear} className={styles.clearButton}>
                Reset
              </button>
              <button type="submit" className={styles.submitButton}>
                Simpan Jadwal
              </button>
            </div>

          </form>
        </div>
      </section>
    </>
  );
}