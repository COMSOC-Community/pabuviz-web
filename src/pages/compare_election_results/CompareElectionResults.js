import React, { useContext, useEffect, useState } from 'react';
import { UrlStateContext, UserDataContext } from 'contexts';
import ElectionList from './ElectionList';
import NetworkError from '../../components/reusables/NetworkError';
import {useLocation, useOutletContext} from 'react-router-dom';
import { get_rule_properties } from '../../utils/database_api';
import { radar_chart_single_election_property_short_names } from '../../constants/constants';
import styles from './CompareElectionResults.module.css'
import ElectionGraphs from './ElectionGraphs';

/**
 * (sub-)page that shows a list of all elections, allows the user to filter and search in it and select one or two elections.
 * For the selected elections, different graphs and statistics are displayed
 * @returns {React.JSX.Element}
 */
export default function CompareElectionResults(props) { 
  
  const location = useLocation();
  const { rule_list } = useOutletContext();
  const {ballot_type_selected, rule_visibility, elections_selected, set_elections_selected} = useContext(UrlStateContext);
  const [elections_selected_data, set_elections_selected_data] = useState(new Map());
  const [rule_properties, set_rule_properties] = useState(undefined);
  const {user_elections, set_user_elections} = useContext(UserDataContext);

  const [error, set_error] = useState(false);

  // effect that requests election property information for the radar chart, depending on the ballot type selected
  useEffect(() => {
    let [rule_properties_promise, abort_controller] = get_rule_properties(
      radar_chart_single_election_property_short_names[ballot_type_selected]
    );
    rule_properties_promise.then((response) => {
      if (response){
        set_rule_properties(response.data)    
      }
    }).catch(() => set_error(true));

    return () => abort_controller.abort();
  }, [ballot_type_selected]);

  
  return (
    <div className={styles.content_container} >
      <div className={styles.header_box}>
        <h1 className={styles.title_text}>
          Compare Elections
        </h1>
      </div>

      <div className={styles.elections_box}>
        <ElectionList
          ballot_type={ballot_type_selected}
          elections_selected={elections_selected}
          set_elections_selected={set_elections_selected} 
          elections_selected_data={elections_selected_data}
          set_elections_selected_data={set_elections_selected_data}
          user_elections={user_elections}
          max_selected={2}
          initial_election_filters={location.state && location.state.election_filters ? location.state.election_filters : {}}
        /> 
      </div>
      <div key={ballot_type_selected} className={styles.graphs_box}>
        {error ? 
          <NetworkError/> :
          rule_list && elections_selected.length > 0 ?
          <div className={styles.graphs_wrapper}>
            <ElectionGraphs
              elections_selected_data={elections_selected_data}
              rules={rule_list}
              rule_properties={rule_properties}
              rule_visibility={rule_visibility}
              projects_visible={elections_selected_data.size === 1}
            />
          </div> :
          <div className={styles.no_election_selected_text}>
            {"↑  Select up to two elections  ↑"}
          </div>
        }
      </div>
    {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
