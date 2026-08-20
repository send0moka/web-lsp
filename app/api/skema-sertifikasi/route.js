import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
    SELECT 
      s.id_skema,
      s.kode_skema,
      s.nama_skema,
      s.jenis_skema AS jenis,
      COUNT(su.id_unit) AS jumlah_unit
    FROM skema_sertifikasi s
    LEFT JOIN skema_unit su 
      ON s.id_skema = su.id_skema
    GROUP BY 
      s.id_skema,
      s.kode_skema,
      s.nama_skema, 
      s.jenis_skema
    ORDER BY s.nama_skema
  `);

    return Response.json(result.recordset);
  } catch (error) {
    console.error("SQL ERROR:", error); // 🔥 PENTING
    return Response.json(
      { error: "Gagal mengambil data skema", detail: error.message },
      { status: 500 }
    );
  }
}
