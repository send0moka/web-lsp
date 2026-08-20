import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT
        p.id_pendaftaran,
        p.nama,
        p.npk,
        p.seksi,
        p.company,
        p.plant,
        -- Ambil nama skema langsung dari tabel skema_sertifikasi berdasarkan id_skema di pendaftaran
        sk.nama_skema,
        -- Data jadwal (akan NULL jika belum ada jadwal)
        j.id_jadwal,
        FORMAT(j.tanggal_mulai, 'yyyy-MM-dd') AS tanggal_mulai,
        FORMAT(j.tanggal_selesai, 'yyyy-MM-dd') AS tanggal_selesai,
        t.nama_tuk,
        a.nama_asesor AS asesor,
        tr.nama_asesor AS trainer
      FROM pendaftaran_sertifikasi p
      -- JOIN dengan skema_sertifikasi untuk ambil nama skema
      LEFT JOIN skema_sertifikasi sk ON p.id_skema = sk.id_skema
      -- LEFT JOIN dengan jadwal (bisa NULL)
      LEFT JOIN jadwal_sertifikasi j ON p.id_jadwal = j.id_jadwal
      -- LEFT JOIN dengan tabel pendukung jadwal (akan NULL jika jadwal NULL)
      LEFT JOIN tempat_uji_kompetensi t ON j.id_tuk = t.id_tuk
      LEFT JOIN asesor_kompetensi a ON j.id_asesor = a.id_asesor
      LEFT JOIN asesor_kompetensi tr ON j.id_trainer = tr.id_asesor
      ORDER BY 
        CASE WHEN p.id_jadwal IS NULL THEN 1 ELSE 0 END,
        j.tanggal_mulai DESC,
        p.nama ASC
    `);

    const transformedData = result.recordset.map(item => ({
      id_pendaftaran: item.id_pendaftaran,
      nama: item.nama,
      npk: item.npk,
      seksi: item.seksi || "",
      company: item.company || "",
      plant: item.plant || "",
      nama_skema: item.nama_skema || "-",
      id_jadwal: item.id_jadwal,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      nama_tuk: item.nama_tuk || "-",
      asesor: item.asesor || "-",
      trainer: item.trainer || "-"
    }));

    return Response.json(transformedData);

  } catch (error) {
    console.error("Error fetching peserta:", error);
    return Response.json(
      { error: "Gagal mengambil data peserta" },
      { status: 500 }
    );
  }
}