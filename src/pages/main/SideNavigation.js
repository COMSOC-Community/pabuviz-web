import React, { useContext } from 'react';
import { NavLink } from "react-router-dom";
import { UrlStateContext } from '../../UrlParamsContextProvider';
import styles from './SideNavigation.module.css'

/**
 * React Component for displaying the navigation menu
 * @returns {React.JSX.Element}
 */
export default function SideNavigation() { 

  const {get_url_navigation_string} = useContext(UrlStateContext);

  return (
    <>
      <div className={styles.nav_logo_container}>
        <p className={styles.nav_title_text}>pabuviz</p>
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
                {"Compare Elections"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={get_url_navigation_string("rules")}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Compare Rules"}
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
        </ul>
      </nav>
    </>
  )
}




