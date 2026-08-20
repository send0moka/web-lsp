import { writeFile, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = join(process.cwd(), "public", "image", "struktur-organisasi");
const DEFAULT_IMAGE = "/image/struktur-organisasi/Struktur-Organisasi.png";

// GET: Mendapatkan path gambar terbaru
export async function GET() {
  try {
    const files = await readdir(UPLOAD_DIR).catch(() => []);
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) &&
      file.includes("Struktur-Organisasi")
    );
    
    if (imageFiles.length > 0) {

      imageFiles.sort((a, b) => {
        const timeA = Number.parseInt(a.match(/\d+/)?.[0] || "0");
        const timeB = Number.parseInt(b.match(/\d+/)?.[0] || "0");
        return timeB - timeA;
      });

      const latestImage = `/image/struktur-organisasi/${imageFiles[0]}`;

      return NextResponse.json({
        success: true,
        path: latestImage
      });
    }
    
    return NextResponse.json({ success: true, path: DEFAULT_IMAGE });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: true, path: DEFAULT_IMAGE });
  }
}

// POST: Upload gambar baru
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus JPG, PNG, atau WEBP" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const filename = `Struktur-Organisasi-${timestamp}.${extension}`;
    
    const filePath = join(UPLOAD_DIR, filename);
    const relativePath = `/image/struktur-organisasi/${filename}`;

    // Buat folder jika belum ada
    const { mkdir } = await import("node:fs/promises");
    await mkdir(UPLOAD_DIR, { recursive: true });

    await writeFile(filePath, buffer);

    // Hapus file lama
    try {
      const files = await readdir(UPLOAD_DIR);
      const oldFiles = files.filter(file => 
        file.includes("Struktur-Organisasi") && file !== filename
      );
      
      for (const oldFile of oldFiles) {
        const oldFilePath = join(UPLOAD_DIR, oldFile);
        await unlink(oldFilePath).catch(() => {});
      }
    } catch (cleanupError) {
      console.error("Error cleaning old files:", cleanupError);
    }

    return NextResponse.json({ 
      success: true, 
      path: relativePath,
      message: "Gambar berhasil diupdate"
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload gambar" },
      { status: 500 }
    );
  }
}