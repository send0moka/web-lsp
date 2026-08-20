import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = await connectDB();
    
    // Gunakan 1 query dengan UNION untuk mengurangi round trip
    const result = await pool.request().query(`
      SELECT 
        'skema' as type,
        COUNT(*) as total 
      FROM skema_sertifikasi
      
      UNION ALL
      
      SELECT 
        'asesor' as type,
        COUNT(*) as total 
      FROM asesor_kompetensi
      
      UNION ALL
      
      SELECT 
        'tuk' as type,
        COUNT(*) as total 
      FROM tempat_uji_kompetensi
    `);
    
    let totalSkema = 0, totalAsesor = 0, totalTUK = 0;
    
    result.recordset.forEach(row => {
      if (row.type === 'skema') totalSkema = row.total;
      if (row.type === 'asesor') totalAsesor = row.total;
      if (row.type === 'tuk') totalTUK = row.total;
    });
    
    // Cache header untuk mencegah request berulang
    return new Response(
      JSON.stringify({
        totalSkema,
        totalAsesor,
        totalTUK,
        success: true
      }),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json(
      { error: "Gagal mengambil data statistik", success: false },
      { status: 500 }
    );
  }
}