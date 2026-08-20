import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        ps.id_pendaftaran,
        ps.nama,
        ss.nama_skema,
        j.tanggal_mulai,
        j.tanggal_selesai,
        hs.hasil,

        CASE 
          WHEN hs.id_hasil IS NULL THEN 'plan'
          ELSE 'actual'
        END AS status_data

      FROM pendaftaran_sertifikasi ps
      LEFT JOIN hasil_sertifikasi hs 
        ON ps.id_pendaftaran = hs.id_pendaftaran
      JOIN jadwal_sertifikasi j 
        ON ps.id_jadwal = j.id_jadwal
      JOIN skema_sertifikasi ss 
        ON j.id_skema = ss.id_skema

      WHERE ps.id_jadwal IS NOT NULL
      ORDER BY j.tanggal_selesai DESC
    `);

    return NextResponse.json(result.recordset);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data report" },
      { status: 500 }
    );
  }
}