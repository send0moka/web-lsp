import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const {
      id_jadwal,
      skema,
      tanggal_mulai,
      tanggal_selesai,
      tuk,
      asesor,
      trainer
    } = await req.json();

    if (!id_jadwal) {
      return NextResponse.json(
        { error: "ID jadwal tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!skema || !tanggal_mulai || !tanggal_selesai || !tuk || !asesor || !trainer) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    const checkResult = await pool.request()
      .input("id_jadwal", id_jadwal)
      .query(`
        SELECT id_jadwal FROM jadwal_sertifikasi 
        WHERE id_jadwal = @id_jadwal
      `);

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Jadwal tidak ditemukan" },
        { status: 404 }
      );
    }

    await pool.request()
      .input("id_jadwal", id_jadwal)
      .input("skema", skema)
      .input("tanggal_mulai", tanggal_mulai)
      .input("tanggal_selesai", tanggal_selesai)
      .input("tuk", tuk)
      .input("asesor", asesor)
      .input("trainer", trainer)
      .query(`
        UPDATE jadwal_sertifikasi
        SET 
          id_skema = @skema,
          tanggal_mulai = @tanggal_mulai,
          tanggal_selesai = @tanggal_selesai,
          id_tuk = @tuk,
          id_asesor = @asesor,
          id_trainer = @trainer
        WHERE id_jadwal = @id_jadwal
      `);

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil diupdate"
    });

  } catch (error) {
    console.error("Error detail:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate jadwal", details: error.message },
      { status: 500 }
    );
  }
}
