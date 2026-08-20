import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {

    const { username, password } = await req.json();

    const pool = await connectDB();

    const result = await pool
      .request()
      .input("username", username)
      .query("SELECT * FROM users WHERE username=@username");

    const user = result.recordset[0];

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 401 }
      );
    }

    // sementara tanpa bcrypt
    if (password !== user.password) {
      return NextResponse.json(
        { message: "Password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login berhasil"
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );

  }

}