import styles from './Logo.module.css'

const Logo = () => {
  return <span className={styles.logo}><span className={styles.logo_pabu}>pabu</span><span className={styles.logo_checkmark}>✓</span><span className={styles.logo_iz}>iz</span></span>;
};

export default Logo;