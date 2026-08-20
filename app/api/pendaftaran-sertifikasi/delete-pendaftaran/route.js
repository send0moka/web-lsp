import { connectDB } from "@/lib/db";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const pool = await connectDB();

    const { id_pendaftaran } = body;

    // VALIDASI
    if (!id_pendaftaran) {
      return Response.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    // Cek apakah data dengan ID tersebut ada
    const checkResult = await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .query(`
        SELECT id_pendaftaran FROM pendaftaran_sertifikasi 
        WHERE id_pendaftaran = @id_pendaftaran
      `);

    if (checkResult.recordset.length === 0) {
      return Response.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // Hapus data
    await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .query(`
        DELETE FROM pendaftaran_sertifikasi 
        WHERE id_pendaftaran = @id_pendaftaran
      `);

    return Response.json({
      success: true,
      message: "Data berhasil dihapus",
    });

  } catch (error) {
    console.error("Error detail:", error);
    return Response.json({ 
      error: "Gagal menghapus data", 
      details: error.message 
    }, { status: 500 });
  }
}