'use client';

import Link from "next/link";
import styles from "../dashboard.module.css";
import PropTypes from "prop-types";

export default function UserLayout({ children }) {
  return (
    <>
      {/* NAVBAR USER */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>

          {/* LOGO */}
          <Link href="/user" className={styles.logo}>
            <img
              src="/image/logo_lsp_denso.png"
              className={styles.logoImg}
              alt="Logo"
            />
          </Link>

          {/* MENU */}
          <div className={styles.navLinks}>

            <Link href="/user">
              Home
            </Link>

            <Link href="/user/outline-lsp">
              Outline LSP
            </Link>

            <Link href="/user/sertifikasi">
              Sertifikasi
            </Link>

            <Link href="/login">
              <button className={styles.btnPrimary}>
                Login
              </button>
            </Link>

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

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};