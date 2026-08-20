import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const id = Number.parseInt(params.id);

    if (!id) {
      return Response.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // ==========================
    // DETAIL JADWAL
    // ==========================
    const jadwalResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          j.id_jadwal,
          j.tanggal_mulai,
          j.tanggal_selesai,
          s.nama_skema,
          t.nama_tuk,
          a1.nama_asesor AS asesor,
          a2.nama_asesor AS trainer
        FROM jadwal_sertifikasi j
        LEFT JOIN skema_sertifikasi s 
          ON j.id_skema = s.id_skema
        LEFT JOIN tempat_uji_kompetensi t 
          ON j.id_tuk = t.id_tuk
        LEFT JOIN asesor_kompetensi a1 
          ON j.id_asesor = a1.id_asesor
        LEFT JOIN asesor_kompetensi a2 
          ON j.id_trainer = a2.id_asesor
        WHERE j.id_jadwal = @id
      `);

    const jadwal = jadwalResult.recordset[0];

    if (!jadwal) {
      return Response.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // ==========================
    // PESERTA
    // ==========================
    const pesertaResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          id_pendaftaran,
          nama,
          npk,
          seksi,
          company,
          plant
        FROM pendaftaran_sertifikasi
        WHERE id_jadwal = @id
        ORDER BY nama
      `);

    const peserta = pesertaResult.recordset;

    return Response.json({
      jadwal,
      peserta
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  }
}