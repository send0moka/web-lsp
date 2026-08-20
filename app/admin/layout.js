'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import styles from "../dashboard.module.css";

export default function AdminLayout({ children }) {

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLogin");

    router.push("/user");
  };

  return (
    <>
      {/* NAVBAR ADMIN */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>

          {/* LOGO */}
          <Link href="/admin" className={styles.logo}>
            <img
              src="/image/logo_lsp_denso.png"
              className={styles.logoImg}
              alt="Logo"
            />
          </Link>

          {/* MENU */}
          <div className={styles.navLinks}>

            <Link href="/admin">
              Home
            </Link>

            <Link href="/admin/outline-lsp">
              Outline LSP
            </Link>

            <Link href="/admin/sertifikasi">
              Sertifikasi
            </Link>

            <button
              onClick={handleLogout}
              className={styles.btnPrimary}
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* CONTENT */}
      <main className={styles.container}>
        {children}
      </main>
    </>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};