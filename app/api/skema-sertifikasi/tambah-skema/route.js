import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
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
    // 1. INSERT SKEMA
    // =====================
    const result = await pool.request()
      .input("kode", kode_skema)
      .input("nama", nama_skema)
      .input("jenis", jenis_skema)
      .input("deskripsi", deskripsi)
      .input("foto", foto_url)
      .query(`
        INSERT INTO skema_sertifikasi
        (kode_skema, nama_skema, jenis_skema, deskripsi, foto_url)
        OUTPUT INSERTED.id_skema
        VALUES (@kode, @nama, @jenis, @deskripsi, @foto)
      `);

    const id_skema = result.recordset[0].id_skema;

    // =====================
    // 2. INSERT UNIT BARU
    // =====================
    const newUnitIds = [];

    for (let unit of units_new) {
      const existing = await pool.request()
        .input("kode", unit.kode_unit)
        .query(`
          SELECT id_unit FROM unit_kompetensi WHERE kode_unit = @kode
        `);

      if (existing.recordset.length > 0) {
        newUnitIds.push(existing.recordset[0].id_unit);
      } else {
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
    }

    // =====================
    // 3. GABUNG
    // =====================
    const allUnits = [...units_existing, ...newUnitIds];

    // =====================
    // 4. INSERT RELASI
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

    return Response.json({ message: "Skema berhasil ditambahkan" });

  } catch (error) {
    console.error("TAMBAH SKEMA ERROR:", error.message, error.stack);
    return Response.json(
      { error: "Gagal tambah skema" },
      { status: 500 }
    );
  }
}