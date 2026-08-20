import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT 
        hs.id_hasil,
        hs.id_pendaftaran,
        hs.hasil,
        ps.nama,
        ps.npk,
        ps.seksi,
        ps.company,
        ps.plant,
        ps.standard,
        ps.lembaga,
        ss.nama_skema,
        ss.id_skema,
        j.tanggal_mulai,
        j.tanggal_selesai,
        t.nama_tuk,
        a.nama_asesor,
        s.no_sertifikat,
        s.no_blanko,
        s.no_registrasi,
        s.file_sertifikat
      FROM hasil_sertifikasi hs
      JOIN pendaftaran_sertifikasi ps ON hs.id_pendaftaran = ps.id_pendaftaran
      JOIN jadwal_sertifikasi j ON ps.id_jadwal = j.id_jadwal
      JOIN skema_sertifikasi ss ON j.id_skema = ss.id_skema
      JOIN tempat_uji_kompetensi t ON j.id_tuk = t.id_tuk
      JOIN asesor_kompetensi a ON j.id_asesor = a.id_asesor
      LEFT JOIN sertifikat s ON hs.id_hasil = s.id_hasil
      ORDER BY j.tanggal_selesai DESC, ps.nama ASC
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