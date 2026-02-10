import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.container}>
      
      {/* 1. NAVIGATION BAR */}
      <nav className={styles.navbar}>
        {/* LOGO + TEXT COMBO */}
        <div className={styles.logoBrand}>
          <Image 
            src="/logo.png" 
            alt="Noor Academy Logo" 
            width={0} 
            height={0} 
            sizes="100vw"
            className={styles.logoImage} // Uses the CSS height: 50px
          />
          <span className={styles.logoText}>Noor Academy</span>
        </div>

        <div className={styles.navLinks}>
          <Link href="/dashboard" className={styles.link}>Dashboard</Link>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Learning Without <span className={styles.highlight}>Limits</span>
        </h1>
          <p className={styles.subtitle}>
            Empower your child with world-class education from the comfort of home. 
            Expert teachers, interactive Zoom classes, and a curriculum that matters.
          </p>
          <Link href="/register" className={styles.ctaBtn}>
            Start Learning Today →
          </Link>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className={styles.features}>
        
        <div className={styles.featureCard}>
          <span className={styles.icon}>👩‍🏫</span>
          <h3>Expert Teachers</h3>
          <p>Qualified instructors dedicated to your child's success in A-Levels, Languages, and more.</p>
        </div>

        <div className={styles.featureCard}>
          <span className={styles.icon}>💻</span>
          <h3>Interactive Zoom</h3>
          <p>Live, engaging classrooms where students can ask questions and interact in real-time.</p>
        </div>

        <div className={styles.featureCard}>
          <span className={styles.icon}>🛡️</span>
          <h3>Safe Environment</h3>
          <p>Secure, monitored learning spaces with age-appropriate content for every keystage.</p>
        </div>

      </section>

      {/* 4. FOOTER */}
      <footer className={styles.footer}>
        <p>© 2026 Noor Academy. All rights reserved.</p>
      </footer>

    </div>
  );
}