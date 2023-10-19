import React, { useContext, useEffect, useMemo, useState } from 'react';
import ElectionList from '../../components/elections/ElectionList';
import SatisfactionHistogram from '../../components/charts/SatisfactionHistogram';
import RulePropertyRadarChart from '../../components/charts/RulePropertyRadarChart';
import CategoryProportion from '../../components/charts/CategoryProportions';
import ElectionProjectsInfo from '../../components/elections/ElectionProjectsInfo';
import ElectionData from '../../components/elections/ElectionData';
import Collapsable from '../../components/reusables/Collapsable';
import NetworkError from '../../components/reusables/NetworkError';
import { get_elections, get_rule_properties } from '../../utils/database_api';
import {useLocation, useOutletContext} from 'react-router-dom';
import { clone, useEffectSkipInitialExecution } from '../../utils/utils';
import { radar_chart_single_election_property_short_names } from '../../constants/constants';
import { UrlStateContext } from '../../UrlParamsContextProvider';
import styles from './CompareElectionResults.module.css'


const election_sections = [
  { 
    name: "Rule properties", 
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <RulePropertyRadarChart
        rules={rules}
        rule_properties={rule_properties}
        election_filters={election_filters}
        rule_visibility={rule_visibility}
        hide_num_elections={true}
      />
    )
  },
  { 
    name: "Satisfaction histogram",
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <SatisfactionHistogram
        rules={rules}
        election_filters={election_filters}
        rule_visibility={rule_visibility}
        hide_num_elections={true}
      />
    )
  },
  { 
    name: "Categories",
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <CategoryProportion
        election_name={election.name}
        rules={rules}
        rule_visibility={rule_visibility}
      />
    )
  },
  { 
    name: "Projects",
    width: "100%",
    height: "fit content",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      only_one_selected ? 
        <div className={styles.graphs_wrapper}>
          <ElectionProjectsInfo
            election={election}
            rules={rules}
            visibility={rule_visibility}
            top={"60px"}
          />
        </div> :
        <div className={styles.graphs_wrapper}>
          {"Please select only one election to view this section"}
        </div>
    )
  },
  { 
    name: "Election details",
    width: "70%",
    height: "fit content",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <div className={styles.election_data_container}>
        <ElectionData election={election}/>
      </div>
    )
  },
]


function ElectionGraphs(props) {
  const { elections_selected_data, rules, rule_visibility, rule_properties } = props;
  
  const [section_visibility, set_section_visibility] = useState(
    election_sections.map((section) => section.default_visibility) 
  );

  const toggle_section_visibility = (index) => {
    set_section_visibility(old_visibility => {
      const new_visibility = clone(old_visibility);
      new_visibility[index] = !new_visibility[index];
      return new_visibility;
    })
  }

  const only_one_selected = elections_selected_data.size === 1;

  const election_filters = useMemo(() => (
    Array.from(elections_selected_data).map(([name, election]) => ({name: {equals: name}}))
  ), [elections_selected_data] )


  return Array.from(elections_selected_data).map(([name, election], election_index) => (
    election && (
      <div className={styles.election_container} key={name}>
        <div className={styles.election_title}>
          <p>
            {election.unit + (election.subunit ? ", " + election.subunit : "") + ". " + new Date(election.date_begin).getFullYear()}
          </p>
        </div>
        <div className={styles.election_body}>
          {election_sections.map((section, section_index) => (
            <div key={section.name} className={styles.section_container}>
              <div
                className={styles.section_title}
                style={{}}
                onClick={() => toggle_section_visibility(section_index)}
              >
                {election_index === 0 ? 
                  <>
                    <div className={styles.indicator} style={{rotate: !section_visibility[section_index] ? "-90deg" : "0deg"}}>
                      {'▾'}
                    </div>
                    <div className={styles.section_title_text}>
                      {section.name}
                    </div>
                  </> :
                  <></>                
                }
              </div>  
              <Collapsable
                collapsed={!section_visibility[section_index]}
                animation_duration={400}
                initial_height={section.height}
              >
                <div className={styles.section_content_wrapper}>
                  <div
                    key={section.name}
                    className={styles.section_content_container}
                    style={{
                      width: only_one_selected ? section.width : "100%",
                      height: section.height
                    }}>
                    {section.render(election, rules, rule_visibility, rule_properties, election_filters[election_index], only_one_selected)}
                  </div>
                </div>
              </Collapsable>
            </div>
        ))}
        </div>
      </div>
    )
  ))
}

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
