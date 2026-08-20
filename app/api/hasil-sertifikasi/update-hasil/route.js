import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const { id_pendaftaran, hasil } = await req.json();

    const pool = await connectDB();

    const check = await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .query(`
        SELECT id_hasil 
        FROM hasil_sertifikasi 
        WHERE id_pendaftaran = @id_pendaftaran
      `);

    if (check.recordset.length > 0) {
      await pool.request()
        .input("id_pendaftaran", id_pendaftaran)
        .input("hasil", hasil)
        .query(`
          UPDATE hasil_sertifikasi
          SET hasil = @hasil,
              updated_at = datetime('now')
          WHERE id_pendaftaran = @id_pendaftaran
        `);
    } else {
      await pool.request()
        .input("id_pendaftaran", id_pendaftaran)
        .input("hasil", hasil)
        .query(`
          INSERT INTO hasil_sertifikasi 
          (id_pendaftaran, hasil)
          VALUES (@id_pendaftaran, @hasil)
        `);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal update hasil" },
      { status: 500 }
    );
  }
}
