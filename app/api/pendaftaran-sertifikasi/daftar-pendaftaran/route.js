import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        p.id_pendaftaran,
        p.nama,
        p.npk,
        p.seksi,
        p.company,
        p.plant,
        p.pic,
        s.nama_skema,
        p.id_skema,
        p.id_jadwal,
        p.standard,
        p.lembaga,
        p.created_at
      FROM pendaftaran_sertifikasi p
      JOIN skema_sertifikasi s ON p.id_skema = s.id_skema
      ORDER BY p.created_at DESC
    `);

    return Response.json(result.recordset);
  } catch (error) {
    console.error("Error fetching pendaftaran:", error);
    return Response.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}