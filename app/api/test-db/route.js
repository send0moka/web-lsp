import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ message: "KONEKSI SQL SERVER BERHASIL 🎉" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
