import React, { useContext, useEffect, useState } from 'react';
import ElectionFilterList from '../../components/elections/ElectionFilterList';
import RulePropertyRadarChart from '../../components/charts/RulePropertyRadarChart'
import SatisfactionHistogram from '../../components/charts/SatisfactionHistogram';
import NetworkError from '../../components/reusables/NetworkError';
import { useOutletContext } from 'react-router-dom';
import { UrlStateContext } from '../../UrlParamsContextProvider';
import { get_rule_properties, get_election_properties } from '../../utils/database_api';
import { radar_chart_multiple_elections_property_short_names } from '../../constants/constants';
import styles from './CompareRuleProperties.module.css'


const election_filter_properties_short_names = [
  'num_projects',
  'num_votes',
  'avg_ballot_len',
  // 'has_categories'
]


const election_filters_defaults = {
  num_projects: {min: 20}
}


export default function CompareRuleProperties(props) { 
  const {ballot_type_selected, rule_visibility} = useContext(UrlStateContext);
  const {rule_list} = useOutletContext();

  const [rule_properties, set_rule_properties] =  useState(undefined);
  const [election_filter_properties, set_election_filter_properties] =  useState(undefined);
  const [election_filters, set_election_filters] = useState(election_filters_defaults);
  const [error, set_error] = useState(false);


  useEffect(() => {
    if (ballot_type_selected){
      let [rule_properties_promise, rule_properties_abort_controller]
        = get_rule_properties(radar_chart_multiple_elections_property_short_names[ballot_type_selected]);
      let [election_filter_properties_promise, election_filter_properties_abort_controller]
        = get_election_properties(election_filter_properties_short_names, ballot_type_selected);
      
        rule_properties_promise.then(response => {
          if (response){
            set_rule_properties(response.data);
          }
        }).catch(() => {set_error(true)});

        election_filter_properties_promise.then(response => {
          if (response){
            set_election_filter_properties(response.data);
          }
        }).catch(() => {set_error(true)});

      return () => {
        rule_properties_abort_controller.abort();
        election_filter_properties_abort_controller.abort();
      }
    }
  }, [ballot_type_selected]);

  
  return (
    <div className={styles.content_container}>
      <div className={styles.options_container}>
        { error ? 
          <NetworkError/> :
          <ElectionFilterList 
            election_filter_properties={election_filter_properties}
            election_filters={election_filters}
            set_election_filters={set_election_filters}
          />
        }
      </div>
      <div className={styles.graphs_container}>
        <div className={styles.graph_container}>
          <RulePropertyRadarChart
            key={ballot_type_selected}
            rules={rule_list}
            rule_properties={rule_properties}
            election_filters={election_filters}
            rule_visibility={rule_visibility}
            />
        </div>
        <div className={styles.graph_container}>
          <SatisfactionHistogram
            key={ballot_type_selected}
            rules={rule_list}
            election_filters={election_filters}
            rule_visibility={rule_visibility}
            />
        </div>
      </div>
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
