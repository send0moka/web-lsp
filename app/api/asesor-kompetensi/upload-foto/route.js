import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return Response.json(
        { error: "Format file harus JPG, JPEG, atau PNG" },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return Response.json(
        { error: "Ukuran file maksimal 2MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `asesor_${timestamp}.${ext}`;
    
    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public/uploads/asesor");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/asesor/${filename}`;

    return Response.json({ url });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}