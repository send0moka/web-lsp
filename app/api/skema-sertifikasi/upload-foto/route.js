import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Format tidak didukung" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "Max 2MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const filePath = path.join(
      process.cwd(),
      "public/image/skema_sertifikasi",
      fileName
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return Response.json({
      url: `/image/skema_sertifikasi/${fileName}`,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Upload gagal" }, { status: 500 });
  }
}