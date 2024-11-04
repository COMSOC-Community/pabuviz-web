import React, { useContext } from 'react';
import { NavLink } from "react-router-dom";
import styles from './SideNavigation.module.css'
import { UrlStateContext } from 'contexts';
import Logo from '../../components/reusables/Logo'

/**
 * React Component for displaying the navigation menu
 * @returns {React.JSX.Element}
 */
export default function SideNavigation() { 

  const {get_url_navigation_string} = useContext(UrlStateContext);

  return (
    <>
      <div className={styles.nav_logo_container}>
        <Logo/>
      </div>
      <nav>
        <ul className={styles.nav_list}>
          <li>
            <NavLink
              to={get_url_navigation_string("")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Main"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={get_url_navigation_string("compare_elections")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Election Level"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={get_url_navigation_string("rules")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Aggregated Level"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={get_url_navigation_string("upload_election")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Upload Election"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={get_url_navigation_string("about")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"About"}
              </p>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  )
}




