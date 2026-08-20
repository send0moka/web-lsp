import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { kode_tuk, nama_tuk, jenis_tuk, foto_tuk, skema_ids } = await req.json();

    if (!kode_tuk || !nama_tuk || !jenis_tuk) {
      return Response.json(
        { error: "Kode TUK, nama TUK, dan jenis TUK harus diisi" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // Check if kode_tuk already exists
    const checkResult = await pool.request()
      .input("kode_tuk", kode_tuk)
      .query("SELECT id_tuk FROM tempat_uji_kompetensi WHERE kode_tuk = @kode_tuk");

    if (checkResult.recordset.length > 0) {
      return Response.json(
        { error: "Kode TUK sudah terdaftar" },
        { status: 400 }
      );
    }

    // Insert TUK
    const result = await pool.request()
      .input("kode_tuk", kode_tuk)
      .input("nama_tuk", nama_tuk)
      .input("jenis_tuk", jenis_tuk)
      .input("foto_tuk", foto_tuk || null)
      .query(`
        INSERT INTO tempat_uji_kompetensi (kode_tuk, nama_tuk, jenis_tuk, foto_tuk)
        OUTPUT INSERTED.id_tuk
        VALUES (@kode_tuk, @nama_tuk, @jenis_tuk, @foto_tuk)
      `);

    const id_tuk = result.recordset[0].id_tuk;

    // Insert tuk_skema relations
    if (skema_ids && skema_ids.length > 0) {
      for (const id_skema of skema_ids) {
        await pool.request()
          .input("id_tuk", id_tuk)
          .input("id_skema", id_skema)
          .query(`
            INSERT INTO tuk_skema (id_tuk, id_skema)
            VALUES (@id_tuk, @id_skema)
          `);
      }
    }

    return Response.json({ 
      message: "Tempat Uji Kompetensi berhasil ditambahkan",
      id_tuk 
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal menambahkan TUK: " + error.message },
      { status: 500 }
    );
  }
}