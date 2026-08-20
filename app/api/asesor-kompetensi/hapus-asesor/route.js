// app/api/asesor-kompetensi/hapus-asesor/route.js
import { connectDB } from "@/lib/db";

export async function DELETE(req) {
  try {
    const { id_asesor } = await req.json();

    if (!id_asesor) {
      return Response.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const pool = await connectDB();

    await pool.request()
      .input("id_asesor", id_asesor)
      .query("DELETE FROM asesor_skema WHERE id_asesor = @id_asesor");

    await pool.request()
      .input("id_asesor", id_asesor)
      .query("DELETE FROM asesor_kompetensi WHERE id_asesor = @id_asesor");

    return Response.json({ message: "Asesor berhasil dihapus" });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal menghapus asesor" }, { status: 500 });
  }
}