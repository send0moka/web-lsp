import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const pool = await connectDB();

    // ========================
    // GRID MODE
    // ========================
    if (type === "grid") {
      const result = await pool.request().query(`
        SELECT 
          s.id_skema,
          s.nama_skema,
          s.jenis_skema AS jenis,
          a.id_asesor,
          a.nama_asesor,
          a.foto_url
        FROM skema_sertifikasi s
        LEFT JOIN asesor_skema ask 
          ON s.id_skema = ask.id_skema
        LEFT JOIN asesor_kompetensi a 
          ON ask.id_asesor = a.id_asesor
        ORDER BY s.nama_skema, a.nama_asesor
      `);

      const grouped = {};

      result.recordset.forEach((row) => {
        if (!grouped[row.id_skema]) {
          grouped[row.id_skema] = {
            schemeId: row.id_skema,
            nama_skema: row.nama_skema,
            jenis: row.jenis,
            asesor: [],
          };
        }

        if (row.id_asesor) {
          grouped[row.id_skema].asesor.push({
            id: row.id_asesor,
            nama: row.nama_asesor,
            foto_url: row.foto_url,
          });
        }
      });

      return Response.json(Object.values(grouped));
    }

    // ========================
    // DEFAULT MODE (TABLE)
    // ========================
    const result = await pool.request().query(`
      SELECT 
        a.id_asesor,
        a.nama_asesor,
        a.no_registrasi,
        COUNT(ask.id_skema) AS jumlah_skema
      FROM asesor_kompetensi a
      LEFT JOIN asesor_skema ask 
        ON a.id_asesor = ask.id_asesor
      GROUP BY 
        a.id_asesor,
        a.nama_asesor,
        a.no_registrasi
      ORDER BY a.nama_asesor
    `);

    return Response.json(result.recordset);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
