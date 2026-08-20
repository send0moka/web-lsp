import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      skema,
      tanggal_mulai,
      tanggal_selesai,
      tuk,
      asesor,
      trainer,
    } = body;

    const pool = await connectDB();

    await pool.request()
      .input("id_skema", skema)
      .input("tanggal_mulai", tanggal_mulai)
      .input("tanggal_selesai", tanggal_selesai)
      .input("id_tuk", tuk)
      .input("id_asesor", asesor)
      .input("id_trainer", trainer)
      .query(`
        INSERT INTO jadwal_sertifikasi
        (
          id_skema,
          tanggal_mulai,
          tanggal_selesai,
          id_tuk,
          id_asesor,
          id_trainer
        )
        VALUES
        (
          @id_skema,
          @tanggal_mulai,
          @tanggal_selesai,
          @id_tuk,
          @id_asesor,
          @id_trainer
        )
      `);

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Gagal menyimpan jadwal" },
      { status: 500 }
    );
  }
}