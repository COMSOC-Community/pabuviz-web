import styles from './SideNavigation.module.css'
import {
  NavLink
} from "react-router-dom";


export default function SideNavigation(props) { 

  return (
    <>
      <div className={styles.nav_logo_container}>
        <p className={styles.nav_title_text}>PBV Logo</p>
      </div>
      <nav>
        <ul className={styles.nav_list}>
          <li>
            <NavLink to={""} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Main"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={"compare_elections"} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Compare Elections"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={"rules"} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Compare Rules"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={"upload_election"} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Upload Election"}
              </p>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  )
}




