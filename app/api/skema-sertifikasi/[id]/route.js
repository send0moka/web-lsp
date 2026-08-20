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
    // Ambil data skema
    // ======================
    const skemaResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT *
        FROM skema_sertifikasi
        WHERE id_skema = @id
      `);

    const skema = skemaResult.recordset[0];

    if (!skema) {
      return Response.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // ======================
    // Ambil unit kompetensi
    // ======================
    const unitResult = await pool.request()
      .input("id", id)
      .query(`
        SELECT 
          u.id_unit,
          u.kode_unit,
          u.nama_unit
        FROM skema_unit su
        JOIN unit_kompetensi u 
          ON su.id_unit = u.id_unit
        WHERE su.id_skema = @id
        ORDER BY u.kode_unit
      `);

    const units = unitResult.recordset;

    return Response.json({
      skema,
      units
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  }
}
