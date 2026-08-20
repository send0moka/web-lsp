import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export async function POST(req) {

  try {

    const formData = await req.formData();

    const id_hasil = formData.get("id_hasil");
    const no_blanko = formData.get("no_blanko");
    const no_registrasi = formData.get("no_registrasi");
    const no_sertifikat = formData.get("no_sertifikat");
    const file = formData.get("file_sertifikat");

    let filePath = null;

    if (file) {

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = Date.now() + "_" + file.name;

      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fullPath = path.join(uploadDir, fileName);

      fs.writeFileSync(fullPath, buffer);

      filePath = "/uploads/" + fileName;
    }

    const pool = await connectDB();

    const check = await pool.request()
      .input("id_hasil", id_hasil)
      .query(`
        SELECT * 
        FROM sertifikat
        WHERE id_hasil = @id_hasil
      `);

    if (check.recordset.length > 0) {

      await pool.request()
        .input("id_hasil", id_hasil)
        .input("no_blanko", no_blanko)
        .input("no_registrasi", no_registrasi)
        .input("no_sertifikat", no_sertifikat)
        .input("file_sertifikat", filePath)
        .query(`
          UPDATE sertifikat
          SET
            no_blanko = @no_blanko,
            no_registrasi = @no_registrasi,
            no_sertifikat = @no_sertifikat,
            file_sertifikat = @file_sertifikat
          WHERE id_hasil = @id_hasil
        `);

    } else {

      await pool.request()
        .input("id_hasil", id_hasil)
        .input("no_blanko", no_blanko)
        .input("no_registrasi", no_registrasi)
        .input("no_sertifikat", no_sertifikat)
        .input("file_sertifikat", filePath)
        .query(`
          INSERT INTO sertifikat
          (
            id_hasil,
            no_blanko,
            no_registrasi,
            no_sertifikat,
            file_sertifikat
          )
          VALUES
          (
            @id_hasil,
            @no_blanko,
            @no_registrasi,
            @no_sertifikat,
            @file_sertifikat
          )
        `);

    }

    return NextResponse.json({
      message: "Sertifikat berhasil disimpan"
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Gagal menyimpan sertifikat" },
      { status: 500 }
    );

  }

}
