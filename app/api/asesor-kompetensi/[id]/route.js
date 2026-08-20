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
    // Ambil data asesor
    // ======================
    const asesorResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          id_asesor,
          nama_asesor,
          no_registrasi,
          foto_url
        FROM asesor_kompetensi
        WHERE id_asesor = @id
      `);

    const asesor = asesorResult.recordset[0];

    if (!asesor) {
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
        FROM asesor_skema ask
        JOIN skema_sertifikasi s 
          ON ask.id_skema = s.id_skema
        WHERE ask.id_asesor = @id
        ORDER BY s.nama_skema
      `);

    const skema = skemaResult.recordset;

    return Response.json({
      asesor,
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