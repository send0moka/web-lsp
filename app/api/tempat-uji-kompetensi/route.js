import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
    SELECT 
      t.id_tuk,
      t.kode_tuk,
      t.nama_tuk,
      t.jenis_tuk AS jenis,
      COUNT(ts.id_skema) AS jumlah_skema
    FROM tempat_uji_kompetensi t
    LEFT JOIN tuk_skema ts 
      ON t.id_tuk = ts.id_tuk
    GROUP BY 
      t.id_tuk,
      t.kode_tuk, 
      t.nama_tuk, 
      t.jenis_tuk
    ORDER BY t.id_tuk
  `);

    return Response.json(result.recordset);
  } catch (error) {
    console.error("SQL ERROR:", error); // 🔥 PENTING
    return Response.json(
      { error: "Gagal mengambil data tempat uji kompetensi", detail: error.message },
      { status: 500 }
    );
  }
}
