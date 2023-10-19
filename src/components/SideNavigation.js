import { search_param_states_options } from '../UrlParamsContextProvider';
import styles from './SideNavigation.module.css'
import {
  NavLink, createSearchParams, useLocation, useSearchParams
} from "react-router-dom";


export default function SideNavigation(props) { 

  const [search_params, set_search_params] = useSearchParams();

  const get_new_search_params_string = (old_search_params) => {
    search_param_states_options.forEach((options, key) => {
      if (!options.global){
        old_search_params.delete(key);
      }
    });
    return "?" + createSearchParams(old_search_params);
  }


  return (
    <>
      <div className={styles.nav_logo_container}>
        <p className={styles.nav_title_text}>PB-viz</p>
      </div>
      <nav>
        <ul className={styles.nav_list}>
          <li>
            <NavLink
              to={`/${get_new_search_params_string(search_params)}`}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Main"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/compare_elections${get_new_search_params_string(search_params)}`}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Compare Elections"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/rules${get_new_search_params_string(search_params)}`}
              className={({isActive}) => isActive ? styles.nav_link_active : styles.nav_link}
            >
              <p className={styles.nav_link_text}>
                {"Compare Rules"}
              </p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/upload_election${get_new_search_params_string(search_params)}`}
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




