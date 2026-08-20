import { connectDB } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("id", params.id)
      .query(`
        SELECT *
        FROM pendaftaran_sertifikasi
        WHERE id_skema = (
          SELECT id_skema
          FROM jadwal_sertifikasi
          WHERE id_jadwal = @id
        )
        AND id_jadwal IS NULL
      `);

    return Response.json({
      peserta: result.recordset
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal ambil peserta" },
      { status: 500 }
    );
  }
}
