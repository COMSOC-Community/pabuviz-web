import React, { useContext, useEffect, useMemo, useState } from 'react';
import ElectionList from './ElectionList';
import SatisfactionHistogram from '../../components/charts/SatisfactionHistogram';
import RulePropertyRadarChart from '../../components/charts/RulePropertyRadarChart';
import CategoryProportion from '../../components/charts/CategoryProportions';
import ElectionProjectsInfo from '../../components/elections/ElectionProjectsInfo';
import ElectionData from '../../components/elections/ElectionData';
import Collapsable from '../../components/reusables/Collapsable';
import NetworkError from '../../components/reusables/NetworkError';
import { UrlStateContext } from '../../UrlParamsContextProvider';
import {useLocation, useOutletContext} from 'react-router-dom';
import { get_rule_properties } from '../../utils/database_api';
import { clone } from '../../utils/utils';
import { radar_chart_single_election_property_short_names } from '../../constants/constants';
import styles from './CompareElectionResults.module.css'
import ElectionGraphs from './ElectionGraphs';


export default function CompareElectionResults(props) { 
  
  const location = useLocation();
  const { rule_list } = useOutletContext();
  const {ballot_type_selected, rule_visibility, elections_selected, set_elections_selected} = useContext(UrlStateContext);
  const [elections_selected_data, set_elections_selected_data] = useState(new Map());
  const [rule_properties, set_rule_properties] = useState(undefined);
  
  const [error, set_error] = useState(false);


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
      <div className={styles.elections_box}>
        <ElectionList
          ballot_type={ballot_type_selected}
          elections_selected={elections_selected}
          set_elections_selected={set_elections_selected} 
          elections_selected_data={elections_selected_data}
          set_elections_selected_data={set_elections_selected_data}
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
          <pre className={styles.no_election_selected_text}>
            {"↑  Select up to two elections  ↑"}
          </pre>
        }
      </div>
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
