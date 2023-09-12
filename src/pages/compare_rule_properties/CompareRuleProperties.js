import React, { useEffect, useMemo, useState } from 'react';
import styles from './CompareRuleProperties.module.css'
import ActivityIndicator from '../../components/reusables/ActivityIndicator'
import RulePropertyRadarChart from '../../components/charts/RulePropertyRadarChart'
import SatisfactionHistogram from '../../components/charts/SatisfactionHistogram';
import { get_rule_properties, get_election_properties } from '../../utils/database_api';
import ElectionFilterMinMax from '../../components/elections/ElectionFilterMinMax';
import NetworkError from '../../components/reusables/NetworkError';
import { useOutletContext } from 'react-router-dom';
import ElectionFilterList from '../../components/elections/ElectionFilterList';


const rule_properties_short_names = [
  "avg_norm_card_satisfaction",
  "avg_norm_cost_satisfaction",
  "avg_rel_card_satisfaction",
  "avg_rel_cost_satisfaction",
  "category_proportionality",
  "equality",
  // "fairness",
  "happiness",
]


const election_filter_properties_short_names = [
  'num_projects',
  'num_votes',
  'avg_ballot_length',
  // 'has_categories'
]


const election_filters_defaults = {
  num_projects: {min: 20}
}


export default function CompareRuleProperties(props) { 
  const {ballot_type_selected, rule_list, rule_visibility} = useOutletContext();

  const [rule_properties, set_rule_properties] =  useState(undefined);
  const [election_filter_properties, set_election_filter_properties] =  useState(undefined);
  const [election_filters, set_election_filters] = useState(election_filters_defaults);
  const [error, set_error] = useState(false);

  const fetch_initial_data = () => {
    
    let [rule_properties_promise, rule_properties_abort_controller]
      = get_rule_properties(rule_properties_short_names);
    let [election_filter_properties_promise, election_filter_properties_abort_controller]
      = get_election_properties(election_filter_properties_short_names, ballot_type_selected);
    
    return [
      [rule_properties_promise, election_filter_properties_promise],
      [rule_properties_abort_controller, election_filter_properties_abort_controller]
    ];
  }

  useEffect(() => {
    if (ballot_type_selected){
      let [initial_data_promises, abort_controllers] = fetch_initial_data()
      Promise.all(initial_data_promises).then(set_initial_data).catch(() => {set_error(true)});

      return () => {
        abort_controllers.forEach((abort_controller) => {
          abort_controller.abort();
        })
      }
    }
  }, [ballot_type_selected]);

  
  const set_initial_data = (api_responses) => {
    if (api_responses){
      let [rule_properties_response, election_filter_properties_response] = api_responses;
      if (rule_properties_response && election_filter_properties_response){
                  
        set_rule_properties(rule_properties_response.data);
        set_election_filter_properties(election_filter_properties_response.data);
       
        // setTimeout(()=>set_rule_visibility(rules_response.data.map((r, i) => i == 0 || i == 4 ? true : false)), 2000)
      }
    }
  }

  
  const render_filters = () => {
    let filters = election_filter_properties.map((election_property, index) => {
      return (
        <ElectionFilterMinMax
          key={election_property.short_name}
          election_property={election_property}
          initial_values={election_filters_defaults[election_property.short_name]}
          set_election_filters={set_election_filters}
        />
      )
    })

    return (
      <div className={styles.filters_container}>
          {filters}
      </div>
    )
  }

  
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
