import { connectDB } from "@/lib/db";

export async function DELETE(req) {
  try {
    const { id_tuk } = await req.json();

    if (!id_tuk) {
      return Response.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // Delete relations first
    await pool.request()
      .input("id_tuk", id_tuk)
      .query("DELETE FROM tuk_skema WHERE id_tuk = @id_tuk");

    // Delete TUK
    await pool.request()
      .input("id_tuk", id_tuk)
      .query("DELETE FROM tempat_uji_kompetensi WHERE id_tuk = @id_tuk");

    return Response.json({ 
      message: "Tempat Uji Kompetensi berhasil dihapus" 
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal menghapus TUK: " + error.message },
      { status: 500 }
    );
  }
}