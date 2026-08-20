import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT id_unit, kode_unit, nama_unit
      FROM unit_kompetensi
      ORDER BY kode_unit
    `);

    return Response.json(result.recordset);

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal ambil unit" },
      { status: 500 }
    );
  }
}