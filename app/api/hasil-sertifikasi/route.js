import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        h.id_hasil,
        p.id_pendaftaran,
        p.nama,
        p.npk,
        p.seksi,
        p.company,
        p.plant,
        s.nama_skema,
        j.tanggal_selesai,
        t.nama_tuk,
        a.nama_asesor,
        h.hasil,
        h.keterangan
      FROM pendaftaran_sertifikasi p
      LEFT JOIN jadwal_sertifikasi j 
        ON p.id_jadwal = j.id_jadwal
      LEFT JOIN skema_sertifikasi s 
        ON j.id_skema = s.id_skema
      LEFT JOIN tempat_uji_kompetensi t 
        ON j.id_tuk = t.id_tuk
      LEFT JOIN asesor_kompetensi a 
        ON j.id_asesor = a.id_asesor
      LEFT JOIN hasil_sertifikasi h 
        ON p.id_pendaftaran = h.id_pendaftaran
      WHERE p.id_jadwal IS NOT NULL
      ORDER BY j.tanggal_selesai DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data hasil" },
      { status: 500 }
    );
  }
}