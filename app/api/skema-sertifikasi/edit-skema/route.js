import { connectDB } from "@/lib/db";

export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      id_skema,
      kode_skema,
      nama_skema,
      jenis_skema,
      deskripsi,
      foto_url,
      units_existing = [],
      units_new = []
    } = body;

    const pool = await connectDB();

    // =====================
    // UPDATE SKEMA
    // =====================
    await pool.request()
      .input("id", id_skema)
      .input("kode", kode_skema)
      .input("nama", nama_skema)
      .input("jenis", jenis_skema)
      .input("deskripsi", deskripsi)
      .input("foto", foto_url)
      .query(`
        UPDATE skema_sertifikasi
        SET kode_skema=@kode,
            nama_skema=@nama,
            jenis_skema=@jenis,
            deskripsi=@deskripsi,
            foto_url=@foto
        WHERE id_skema=@id
      `);

    // =====================
    // HAPUS RELASI LAMA
    // =====================
    await pool.request()
      .input("id", id_skema)
      .query(`DELETE FROM skema_unit WHERE id_skema=@id`);

    // =====================
    // INSERT UNIT BARU
    // =====================
    const newUnitIds = [];

    for (let unit of units_new) {
      const insert = await pool.request()
        .input("kode", unit.kode_unit)
        .input("nama", unit.nama_unit)
        .query(`
          INSERT INTO unit_kompetensi (kode_unit, nama_unit)
          OUTPUT INSERTED.id_unit
          VALUES (@kode, @nama)
        `);

      newUnitIds.push(insert.recordset[0].id_unit);
    }

    const allUnits = [...units_existing, ...newUnitIds];

    // =====================
    // INSERT RELASI BARU
    // =====================
    for (let i = 0; i < allUnits.length; i++) {
      await pool.request()
        .input("id_skema", id_skema)
        .input("id_unit", allUnits[i])
        .input("urutan", i + 1)
        .query(`
          INSERT INTO skema_unit (id_skema, id_unit, urutan)
          VALUES (@id_skema, @id_unit, @urutan)
        `);
    }

    return Response.json({ message: "Skema berhasil diupdate" });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal update skema" },
      { status: 500 }
    );
  }
}