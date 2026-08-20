import { connectDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const { id_tuk, kode_tuk, nama_tuk, jenis_tuk, foto_tuk, skema_ids } = await req.json();

    if (!id_tuk || !kode_tuk || !nama_tuk || !jenis_tuk) {
      return Response.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // Check if kode_tuk already exists for other TUK
    const checkResult = await pool.request()
      .input("kode_tuk", kode_tuk)
      .input("id_tuk", id_tuk)
      .query(`
        SELECT id_tuk 
        FROM tempat_uji_kompetensi 
        WHERE kode_tuk = @kode_tuk 
        AND id_tuk != @id_tuk
      `);

    if (checkResult.recordset.length > 0) {
      return Response.json(
        { error: "Kode TUK sudah terdaftar untuk TUK lain" },
        { status: 400 }
      );
    }

    // Update TUK
    await pool.request()
      .input("id_tuk", id_tuk)
      .input("kode_tuk", kode_tuk)
      .input("nama_tuk", nama_tuk)
      .input("jenis_tuk", jenis_tuk)
      .input("foto_tuk", foto_tuk || null)
      .query(`
        UPDATE tempat_uji_kompetensi 
        SET kode_tuk = @kode_tuk, 
            nama_tuk = @nama_tuk, 
            jenis_tuk = @jenis_tuk, 
            foto_tuk = @foto_tuk
        WHERE id_tuk = @id_tuk
      `);

    // Delete existing relations
    await pool.request()
      .input("id_tuk", id_tuk)
      .query("DELETE FROM tuk_skema WHERE id_tuk = @id_tuk");

    // Insert new relations
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
      message: "Tempat Uji Kompetensi berhasil diupdate"
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal mengupdate TUK: " + error.message },
      { status: 500 }
    );
  }
}