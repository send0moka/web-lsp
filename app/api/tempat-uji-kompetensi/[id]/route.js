import { connectDB } from "@/lib/db";

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

    // ======================
    // Ambil data tuk
    // ======================
    const tukResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          id_tuk,
          kode_tuk,
          nama_tuk,
          jenis_tuk,
          foto_tuk
        FROM tempat_uji_kompetensi
        WHERE id_tuk = @id
      `);

    const tuk = tukResult.recordset[0];

    if (!tuk) {
      return Response.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // ======================
    // Ambil skema yang diampu
    // ======================
    const skemaResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          s.id_skema,
          s.kode_skema,
          s.nama_skema,
          s.jenis_skema
        FROM tuk_skema tsk
        JOIN skema_sertifikasi s 
          ON tsk.id_skema = s.id_skema
        WHERE tsk.id_tuk = @id
        ORDER BY s.nama_skema
      `);

    const skema = skemaResult.recordset;

    return Response.json({
      tuk: tuk,
      skema
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  }
}