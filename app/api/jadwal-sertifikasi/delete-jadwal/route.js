import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { id_jadwal } = await req.json();
    const pool = await connectDB();

    await pool.request()
      .input("id_jadwal", id_jadwal)
      .query(`
        UPDATE pendaftaran_sertifikasi
        SET id_jadwal = NULL
        WHERE id_jadwal = @id_jadwal
      `);

    await pool.request()
      .input("id_jadwal", id_jadwal)
      .query(`
        DELETE FROM jadwal_sertifikasi
        WHERE id_jadwal = @id_jadwal
      `);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus jadwal" },
      { status: 500 }
    );
  }
}
