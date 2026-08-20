import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req) {
  try {
    const { id_pendaftaran } = await req.json();
    const db = getDb();

    const deleteAndUnassign = db.transaction(() => {
      db.prepare("DELETE FROM hasil_sertifikasi WHERE id_pendaftaran = @id")
        .run({ id: id_pendaftaran });
      db.prepare("UPDATE pendaftaran_sertifikasi SET id_jadwal = NULL WHERE id_pendaftaran = @id")
        .run({ id: id_pendaftaran });
    });

    deleteAndUnassign();

    return NextResponse.json({
      success: true,
      message: "Peserta berhasil dihapus dari jadwal dan hasil sertifikasi direset"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus peserta" },
      { status: 500 }
    );
  }
}
