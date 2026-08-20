import { connectDB } from "@/lib/db";

export async function DELETE(req) {
  try {
    const { id_skema } = await req.json();
    const id = Number.parseInt(id_skema);

    if (!id) {
      return Response.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const pool = await connectDB();

    // hapus relasi dulu
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM skema_unit WHERE id_skema=@id`);

    // hapus skema
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM skema_sertifikasi WHERE id_skema=@id`);

    return Response.json({ message: "Skema berhasil dihapus" });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal hapus skema" },
      { status: 500 }
    );
  }
}