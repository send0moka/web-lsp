import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT
        j.id_jadwal,
        s.nama_skema,
        FORMAT(j.tanggal_mulai, 'yyyy-MM-dd') AS tanggal_mulai,
        FORMAT(j.tanggal_selesai, 'yyyy-MM-dd') AS tanggal_selesai,
        t.nama_tuk,
        a.nama_asesor AS nama_asesor,
        tr.nama_asesor AS nama_trainer
      FROM jadwal_sertifikasi j
      JOIN skema_sertifikasi s ON j.id_skema = s.id_skema
      JOIN tempat_uji_kompetensi t ON j.id_tuk = t.id_tuk
      JOIN asesor_kompetensi a ON j.id_asesor = a.id_asesor
      JOIN asesor_kompetensi tr ON j.id_trainer = tr.id_asesor
      ORDER BY j.tanggal_mulai DESC
    `);

    // Transform data agar sesuai dengan frontend
    const transformedData = result.recordset.map(item => ({
      id_jadwal: item.id_jadwal,
      nama_skema: item.nama_skema,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      nama_tuk: item.nama_tuk,
      asesor: item.nama_asesor,
      trainer: item.nama_trainer
    }));

    return Response.json(transformedData);

  } catch (error) {
    console.error("Error fetching jadwal:", error);
    return Response.json(
      { error: "Gagal mengambil data jadwal" },
      { status: 500 }
    );
  }
}