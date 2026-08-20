import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        p.id_pendaftaran,
        p.nama,
        p.npk,
        p.seksi,
        p.company,
        p.plant,
        p.pic,
        s.nama_skema,
        p.id_skema,
        p.id_jadwal,
        p.standard,
        p.lembaga,
        p.created_at
      FROM pendaftaran_sertifikasi p
      JOIN skema_sertifikasi s ON p.id_skema = s.id_skema
      ORDER BY p.created_at DESC
    `);

    return Response.json(result.recordset);
  } catch (error) {
    console.error("Error fetching pendaftaran:", error);
    return Response.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const pool = await connectDB();

    const { nama, npk, seksi, company, plant, pic, skema, standard, lembaga } = body;

    if (!nama || !npk || !seksi || !company || !plant || !pic || !skema || !standard || !lembaga) {
      return Response.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    await pool.request()
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
        INSERT INTO pendaftaran_sertifikasi 
        (nama, npk, seksi, company, plant, pic, id_skema, standard, lembaga, created_at)
        VALUES 
        (@nama, @npk, @seksi, @company, @plant, @pic, @id_skema, @standard, @lembaga, GETDATE())
      `);

    return Response.json({
      success: true,
      message: "Pendaftaran berhasil disimpan"
    });

  } catch (error) {
    console.error("Error saving pendaftaran:", error);
    return Response.json(
      { error: "Gagal menyimpan data pendaftaran" },
      { status: 500 }
    );
  }
}