import styles from './SideNavigation.module.css'
import {
  NavLink, useLocation
} from "react-router-dom";


export default function SideNavigation(props) { 

  const { search } = useLocation();

  return (
    <>
      <div className={styles.nav_logo_container}>
        <p className={styles.nav_title_text}>PB-viz</p>
      </div>
      <nav>
        <ul className={styles.nav_list}>
          <li>
            <NavLink to={`/${search}`} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Main"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={`/compare_elections${search}`} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Compare Elections"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={`/rules${search}`} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
              <p className={styles.nav_link_text}>
                {"Compare Rules"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink to={`/upload_election${search}`} className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}>
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




