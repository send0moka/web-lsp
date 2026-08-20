import { connectDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const { id_asesor, nama_asesor, no_registrasi, foto_url, skema_ids } = await req.json();

    if (!id_asesor || !nama_asesor || !no_registrasi) {
      return Response.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // Check if no_registrasi already exists for other asesor
    const checkResult = await pool.request()
      .input("no_registrasi", no_registrasi)
      .input("id_asesor", id_asesor)
      .query(`
        SELECT id_asesor 
        FROM asesor_kompetensi 
        WHERE no_registrasi = @no_registrasi 
        AND id_asesor != @id_asesor
      `);

    if (checkResult.recordset.length > 0) {
      return Response.json(
        { error: "No registrasi sudah terdaftar untuk asesor lain" },
        { status: 400 }
      );
    }

    // Update asesor
    await pool.request()
      .input("id_asesor", id_asesor)
      .input("nama_asesor", nama_asesor)
      .input("no_registrasi", no_registrasi)
      .input("foto_url", foto_url || null)
      .query(`
        UPDATE asesor_kompetensi 
        SET nama_asesor = @nama_asesor, 
            no_registrasi = @no_registrasi, 
            foto_url = @foto_url
        WHERE id_asesor = @id_asesor
      `);

    // Delete existing relations
    await pool.request()
      .input("id_asesor", id_asesor)
      .query("DELETE FROM asesor_skema WHERE id_asesor = @id_asesor");

    // Insert new relations
    if (skema_ids && skema_ids.length > 0) {
      for (const id_skema of skema_ids) {
        await pool.request()
          .input("id_asesor", id_asesor)
          .input("id_skema", id_skema)
          .query(`
            INSERT INTO asesor_skema (id_asesor, id_skema)
            VALUES (@id_asesor, @id_skema)
          `);
      }
    }

    return Response.json({ 
      message: "Asesor berhasil diupdate"
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal mengupdate asesor" },
      { status: 500 }
    );
  }
}