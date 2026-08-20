import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { id_pendaftaran, id_jadwal } = await req.json();

    const pool = await connectDB();

    const result = await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .input("id_jadwal", id_jadwal)
      .query(`
        SELECT 
          p.id_skema AS id_skema_pendaftaran,
          s1.nama_skema AS skema_pendaftaran,
          p.nama AS nama_peserta,

          j.id_skema AS id_skema_jadwal,
          s2.nama_skema AS skema_jadwal,
          j.tanggal_mulai,
          j.tanggal_selesai

        FROM pendaftaran_sertifikasi p

        JOIN jadwal_sertifikasi j 
          ON j.id_jadwal = @id_jadwal

        JOIN skema_sertifikasi s1 
          ON p.id_skema = s1.id_skema

        JOIN skema_sertifikasi s2 
          ON j.id_skema = s2.id_skema

        WHERE p.id_pendaftaran = @id_pendaftaran
      `);

    if (result.recordset.length === 0) {
      return Response.json(
        { error: "Data pendaftaran atau jadwal tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = result.recordset[0];

    const {
      id_skema_pendaftaran,
      id_skema_jadwal,
      skema_pendaftaran,
      skema_jadwal,
      nama_peserta
    } = data;

    if (id_skema_pendaftaran !== id_skema_jadwal) {
      return Response.json(
        {
          error: `Skema tidak sesuai! Peserta "${nama_peserta}" (${skema_pendaftaran}) tidak cocok dengan jadwal (${skema_jadwal}).`
        },
        { status: 400 }
      );
    }

    const cekAssign = await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .query(`
        SELECT id_jadwal 
        FROM pendaftaran_sertifikasi
        WHERE id_pendaftaran = @id_pendaftaran 
          AND id_jadwal IS NOT NULL
      `);

    if (cekAssign.recordset.length > 0) {
      return Response.json(
        {
          error: `Peserta "${nama_peserta}" sudah terdaftar di jadwal lain.`
        },
        { status: 400 }
      );
    }

    await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .input("id_jadwal", id_jadwal)
      .query(`
        UPDATE pendaftaran_sertifikasi
        SET id_jadwal = @id_jadwal
        WHERE id_pendaftaran = @id_pendaftaran
      `);

    return Response.json({
      success: true,
      message: `Peserta "${nama_peserta}" berhasil diassign ke jadwal "${skema_jadwal}"`
    });

  } catch (error) {
    console.error("ASSIGN ERROR:", error);

    return Response.json(
      { error: "Gagal assign peserta: " + error.message },
      { status: 500 }
    );
  }
}
