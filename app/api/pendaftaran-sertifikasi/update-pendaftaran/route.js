import { connectDB } from "@/lib/db";

export async function PUT(request) {
  try {
    const body = await request.json();
    const pool = await connectDB();

    const {
      id_pendaftaran,
      nama, npk, seksi, company, plant, pic, skema,
      standard, lembaga,
    } = body;

    if (!id_pendaftaran) {
      return Response.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    if (!nama || !npk || !seksi || !company || !plant || !pic || !skema || !standard || !lembaga) {
      return Response.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    await pool.request()
      .input("id_pendaftaran", id_pendaftaran)
      .input("nama", nama)
      .input("npk", npk)
      .input("seksi", seksi)
      .input("company", company)
      .input("plant", plant)
      .input("pic", pic)
      .input("id_skema", skema)
      .input("standard", standard)
      .input("lembaga", lembaga)
      .query(`
        UPDATE pendaftaran_sertifikasi
        SET 
          nama = @nama,
          npk = @npk,
          seksi = @seksi,
          company = @company,
          plant = @plant,
          pic = @pic,
          id_skema = @id_skema,
          standard = @standard,
          lembaga = @lembaga
        WHERE id_pendaftaran = @id_pendaftaran
      `);

    return Response.json({
      success: true,
      message: "Data berhasil diupdate",
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Gagal update data" }, { status: 500 });
  }
}