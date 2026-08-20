import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const { nama_asesor, no_registrasi, foto_url, skema_ids } = await req.json();

    if (!nama_asesor || !no_registrasi) {
      return Response.json(
        { error: "Nama asesor dan no registrasi harus diisi" },
        { status: 400 }
      );
    }

    const pool = await connectDB();

    // Check if no_registrasi already exists
    const checkResult = await pool.request()
      .input("no_registrasi", no_registrasi)
      .query("SELECT id_asesor FROM asesor_kompetensi WHERE no_registrasi = @no_registrasi");

    if (checkResult.recordset.length > 0) {
      return Response.json(
        { error: "No registrasi sudah terdaftar" },
        { status: 400 }
      );
    }

    // Insert asesor
    const result = await pool.request()
      .input("nama_asesor", nama_asesor)
      .input("no_registrasi", no_registrasi)
      .input("foto_url", foto_url || null)
      .query(`
        INSERT INTO asesor_kompetensi (nama_asesor, no_registrasi, foto_url)
        OUTPUT INSERTED.id_asesor
        VALUES (@nama_asesor, @no_registrasi, @foto_url)
      `);

    const id_asesor = result.recordset[0].id_asesor;

    // Insert asesor_skema relations
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
      message: "Asesor berhasil ditambahkan",
      id_asesor 
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal menambahkan asesor" },
      { status: 500 }
    );
  }
}