"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Select from "react-select";
import styles from "./pendaftaran-sertifikasi.module.css";

export default function PendaftaranSertifikasi() {

  const [formData, setFormData] = useState({
    nama: "",
    npk: "",
    seksi: "",
    company: "",
    plant: "",
    pic: "",
    skema: "",
    standard: "",
    lembaga: "",
  });

  const [skemaList, setSkemaList] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [isOtherStandard, setIsOtherStandard] = useState(false);
  const [isOtherLembaga, setIsOtherLembaga] = useState(false);

  const companyOptions = [
    { value: "PT Denso Indonesia", label: "PT Denso Indonesia" },
    { value: "PT Denso Sales Indonesia", label: "PT Denso Sales Indonesia" },
    { value: "PT Denso Manufacturing Indonesia", label: "PT Denso Manufacturing Indonesia" },
    { value: "PT Hamanoko Denso Indonesia", label: "PT Hamanoko Denso Indonesia" },
    { value: "PT Toyota Denso Automotive Compressor Indonesia", label: "PT Toyota Denso Automotive Compressor Indonesia" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const standardOptions = [
    { value: "BNSP", label: "BNSP" },
    { value: "IMDIA", label: "IMDIA" },
    { value: "SESPP", label: "SESPP" },
    { value: "Kemnaker", label: "Kemnaker" },
    { value: "Internal", label: "Internal" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const lembagaOptions = [
    { value: "BNSP", label: "BNSP" },
    { value: "INNAS", label: "INNAS" },
    { value: "IMDIA", label: "IMDIA" },
    { value: "Kemnaker", label: "Kemnaker" },
    { value: "LSP Logam Mesin", label: "LSP Logam Mesin" },
    { value: "LSP Denso Indonesia", label: "LSP Denso Indonesia" },
    { value: "LSP Lingkungan Hidup Envirotama", label: "LSP Lingkungan Hidup Envirotama" },
    { value: "LSP Telekomunikasi Digital Indonesia", label: "LSP Telekomunikasi Digital Indonesia" },
    { value: "LSP Daimaru", label: "LSP Daimaru" },
    { value: "LSP Elektronika Indonesia", label: "LSP Elektronika Indonesia" },
    { value: "LSP Pengendalian Pencemaran Lingkungan", label: "LSP Pengendalian Pencemaran Lingkungan" },
    { value: "LSP LIK", label: "LSP LIK" },
    { value: "LSP HAKE", label: "LSP HAKE" },
    { value: "PT Denso Indonesia", label: "PT Denso Indonesia" },
    { value: "lainnya", label: "Lainnya" },
  ];

  // ======================
  // Fungsi untuk capitalize each word
  // ======================
  const capitalizeEachWord = (str) => {
    if (!str || typeof str !== "string") return str;
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (word === "pt") return "PT";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  // ======================
  // Ambil skema dari database
  // ======================
  useEffect(() => {
    const fetchSkema = async () => {
      try {
        const res = await fetch("/api/skema-sertifikasi");
        const data = await res.json();
        setSkemaList(data || []);
      } catch (err) {
        console.error("Gagal ambil skema", err);
      }
    };
    fetchSkema();
  }, []);

  // ======================
  // Handle perubahan input
  // ======================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "npk") {
      if (/^[\d-]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    } else if (["nama", "plant", "pic"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: capitalizeEachWord(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ======================
  // Validasi form
  // ======================
  const validateForm = () => {
    let newErrors = {};

    if (!formData.nama) newErrors.nama = "Field ini wajib diisi";
    if (!formData.npk) newErrors.npk = "Field ini wajib diisi";
    if (!formData.seksi) newErrors.seksi = "Field ini wajib diisi";
    if (!formData.company) newErrors.company = "Field ini wajib diisi";
    if (!formData.plant) newErrors.plant = "Field ini wajib diisi";
    if (!formData.pic) newErrors.pic = "Field ini wajib diisi";
    if (!formData.skema) newErrors.skema = "Field ini wajib diisi";
    if (!formData.standard) newErrors.standard = "Field ini wajib diisi";
    if (!formData.lembaga) newErrors.lembaga = "Field ini wajib diisi";

    return newErrors;
  };

  // ======================
  // Submit ke SQL
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      ...formData,
      nama: capitalizeEachWord(formData.nama),
      plant: capitalizeEachWord(formData.plant),
      pic: capitalizeEachWord(formData.pic),
    };

    try {
      const res = await fetch("/api/pendaftaran-sertifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSubmitted(true);

      setTimeout(() => {
        handleClear();
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  };

  // ======================
  // Clear form
  // ======================
  const handleClear = () => {
    setFormData({
      nama: "", npk: "", seksi: "", company: "",
      plant: "", pic: "", skema: "", standard: "", lembaga: "",
    });
    setErrors({});
    setSubmitted(false);
    setIsOtherCompany(false);
    setIsOtherStandard(false);
    setIsOtherLembaga(false);
  };

  // ======================
  // Shared Select styles
  // ======================
  const selectStyles = {
    control: (base) => ({ ...base, minHeight: "46px", height: "46px" }),
    valueContainer: (base) => ({ ...base, height: "44px", padding: "0 1rem" }),
    input: (base) => ({ ...base, height: "44px", margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "44px" }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/sertifikasi">Sertifikasi</Link>
        <span>/</span>
        <span>Pendaftaran Sertifikasi</span>
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Pendaftaran Sertifikasi LSP Denso Indonesia
          </h1>
          <p className={styles.heroSubtitle}>
            Daftar sebagai peserta sertifikasi dan mulai perjalanan menuju kompetensi profesional.
          </p>
        </div>
      </section>

      {/* TAB */}
      <div className={styles.tabContainer}>
        <Link
          href="/admin/sertifikasi/pendaftaran-sertifikasi"
          className={`${styles.tabItem} ${styles.activeTab}`}
        >
          Form Pendaftaran
        </Link>
        <Link
          href="/admin/sertifikasi/pendaftaran-sertifikasi/daftar-pendaftaran"
          className={styles.tabItem}
        >
          Daftar Pendaftaran
        </Link>
      </div>

      {/* Content */}
      <section className={styles.contentSection}>
        <div className={styles.container_inner}>

          {submitted && (
            <div className={styles.successMessage}>
              ✓ Pendaftaran Anda berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>

            {/* NAMA */}
            <div className={styles.formGroup}>
              <label htmlFor="nama" className={styles.formLabel}>Nama Lengkap *</label>
              <input
                type="text" id="nama" name="nama"
                value={formData.nama} onChange={handleChange}
                className={styles.formInput}
                placeholder="Masukkan nama lengkap"
                aria-label="Nama lengkap peserta"
              />
              {errors.nama && <p className={styles.errorText}>{errors.nama}</p>}
            </div>

            {/* NPK */}
            <div className={styles.formGroup}>
              <label htmlFor="npk" className={styles.formLabel}>NPK *</label>
              <input
                type="text" id="npk" name="npk"
                value={formData.npk} onChange={handleChange}
                className={styles.formInput}
                placeholder="Masukkan NPK"
                aria-label="Nomor Pokok Karyawan"
              />
              {errors.npk && <p className={styles.errorText}>{errors.npk}</p>}
            </div>

            {/* SEKSI */}
            <div className={styles.formGroup}>
              <label htmlFor="seksi" className={styles.formLabel}>Seksi *</label>
              <input
                type="text" id="seksi" name="seksi"
                value={formData.seksi} onChange={handleChange}
                className={styles.formInput}
                placeholder="Masukkan nama seksi"
                aria-label="Seksi atau bagian kerja"
              />
              {errors.seksi && <p className={styles.errorText}>{errors.seksi}</p>}
            </div>

            {/* PERUSAHAAN */}
            <div className={styles.formGroup}>
              <fieldset className={styles.formFieldset}>
                <legend className={styles.formLabel}>Perusahaan *</legend>
                <Select
                  classNamePrefix="react-select"
                  options={companyOptions}
                  value={
                    isOtherCompany
                      ? { value: "lainnya", label: "Lainnya" }
                      : companyOptions.find((opt) => opt.value === formData.company) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherCompany(true);
                      setFormData((prev) => ({ ...prev, company: "" }));
                    } else {
                      setIsOtherCompany(false);
                      setFormData((prev) => ({ ...prev, company: selected?.value || "" }));
                    }
                    setErrors((prev) => ({ ...prev, company: "" }));
                  }}
                  placeholder="Pilih perusahaan..."
                  isClearable
                  styles={selectStyles}
                  aria-label="Pilih perusahaan"
                />
                {isOtherCompany && (
                  <input
                    type="text" name="company"
                    value={formData.company} onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Masukkan nama perusahaan lainnya"
                    style={{ marginTop: "10px" }}
                    aria-label="Nama perusahaan lainnya"
                  />
                )}
              </fieldset>
              {errors.company && <p className={styles.errorText}>{errors.company}</p>}
            </div>

            {/* PLANT */}
            <div className={styles.formGroup}>
              <label htmlFor="plant" className={styles.formLabel}>Plant *</label>
              <input
                type="text" id="plant" name="plant"
                value={formData.plant} onChange={handleChange}
                className={styles.formInput}
                placeholder="Masukkan nama plant"
                aria-label="Plant atau lokasi kerja"
              />
              {errors.plant && <p className={styles.errorText}>{errors.plant}</p>}
            </div>

            {/* PIC */}
            <div className={styles.formGroup}>
              <label htmlFor="pic" className={styles.formLabel}>PIC *</label>
              <input
                type="text" id="pic" name="pic"
                value={formData.pic} onChange={handleChange}
                className={styles.formInput}
                placeholder="Masukkan nama PIC"
                aria-label="Person In Charge"
              />
              {errors.pic && <p className={styles.errorText}>{errors.pic}</p>}
            </div>

            {/* SKEMA */}
            <div className={styles.formGroup}>
              <fieldset className={styles.formFieldset}>
                <legend className={styles.formLabel}>Skema Sertifikasi *</legend>
                <Select
                  classNamePrefix="react-select"
                  options={skemaList.map((item) => ({
                    value: item.id_skema,
                    label: item.nama_skema,
                  }))}
                  value={
                    skemaList
                      .map((item) => ({ value: item.id_skema, label: item.nama_skema }))
                      .find((opt) => opt.value === formData.skema) || null
                  }
                  onChange={(selected) => {
                    setFormData((prev) => ({ ...prev, skema: selected ? selected.value : "" }));
                    setErrors((prev) => ({ ...prev, skema: "" }));
                  }}
                  placeholder="Cari atau pilih skema sertifikasi..."
                  isClearable
                  styles={selectStyles}
                  aria-label="Pilih skema sertifikasi"
                />
              </fieldset>
              {errors.skema && <p className={styles.errorText}>{errors.skema}</p>}
            </div>

            {/* STANDARD */}
            <div className={styles.formGroup}>
              <fieldset className={styles.formFieldset}>
                <legend className={styles.formLabel}>Standard *</legend>
                <Select
                  classNamePrefix="react-select"
                  options={standardOptions}
                  value={
                    isOtherStandard
                      ? { value: "lainnya", label: "Lainnya" }
                      : standardOptions.find((opt) => opt.value === formData.standard) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherStandard(true);
                      setFormData((prev) => ({ ...prev, standard: "" }));
                    } else {
                      setIsOtherStandard(false);
                      setFormData((prev) => ({ ...prev, standard: selected?.value || "" }));
                    }
                    setErrors((prev) => ({ ...prev, standard: "" }));
                  }}
                  placeholder="Pilih standard..."
                  isClearable
                  styles={selectStyles}
                  aria-label="Pilih standard sertifikasi"
                />
                {isOtherStandard && (
                  <input
                    type="text" name="standard"
                    value={formData.standard} onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Masukkan nama standard lainnya"
                    style={{ marginTop: "10px" }}
                    aria-label="Standard lainnya"
                  />
                )}
              </fieldset>
              {errors.standard && <p className={styles.errorText}>{errors.standard}</p>}
            </div>

            {/* LEMBAGA */}
            <div className={styles.formGroup}>
              <fieldset className={styles.formFieldset}>
                <legend className={styles.formLabel}>Lembaga *</legend>
                <Select
                  classNamePrefix="react-select"
                  options={lembagaOptions}
                  value={
                    isOtherLembaga
                      ? { value: "lainnya", label: "Lainnya" }
                      : lembagaOptions.find((opt) => opt.value === formData.lembaga) || null
                  }
                  onChange={(selected) => {
                    if (selected?.value === "lainnya") {
                      setIsOtherLembaga(true);
                      setFormData((prev) => ({ ...prev, lembaga: "" }));
                    } else {
                      setIsOtherLembaga(false);
                      setFormData((prev) => ({ ...prev, lembaga: selected?.value || "" }));
                    }
                    setErrors((prev) => ({ ...prev, lembaga: "" }));
                  }}
                  placeholder="Pilih lembaga..."
                  isClearable
                  styles={selectStyles}
                  aria-label="Pilih lembaga sertifikasi"
                />
                {isOtherLembaga && (
                  <input
                    type="text" name="lembaga"
                    value={formData.lembaga} onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Masukkan nama lembaga lainnya"
                    style={{ marginTop: "10px" }}
                    aria-label="Lembaga lainnya"
                  />
                )}
              </fieldset>
              {errors.lembaga && <p className={styles.errorText}>{errors.lembaga}</p>}
            </div>

            {/* BUTTONS */}
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleClear} className={styles.clearButton}>
                Clear
              </button>
              <button type="submit" className={styles.submitButton}>
                Daftar Sekarang
              </button>
            </div>

          </form>
        </div>
      </section>
    </>
  );
}