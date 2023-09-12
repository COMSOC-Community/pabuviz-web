import React, { useEffect, useState } from 'react';
import styles from './ElectionDetails.module.css'
import ElectionList from '../../components/elections/ElectionList';
import ElectionProjectsInfo from '../../components/elections/ElectionProjectsInfo';
import {useLocation, useOutletContext} from 'react-router-dom';


export default function ElectionDetails(props) { 
  
  const location = useLocation();
  const {ballot_type_selected, rule_list, rule_visibility} = useOutletContext();

  const [elections_selected, set_elections_selected] =  useState(new Map(
    location.state && location.state.election_selected ?
      [[location.state.election_selected.name, location.state.election_selected]] :
      []
  ));



  useEffect(() => {
    set_elections_selected(new Map([]))
  }, [ballot_type_selected]);



  useEffect(() => {

    if (location.state && location.state.election_selected){
      set_elections_selected(new Map([[location.state.election_selected.name, location.state.election_selected]]));
    }

  }, [location]);



  const render_election_box = () => {
    return (
      <div className={styles.graphs_wrapper}>
        <ElectionProjectsInfo
          election={elections_selected.values().next().value}
          rules={rule_list}
          visibility={rule_visibility}
        />
      </div>
    )
  }


  return (
    <div className={styles.content_container}>
      <div className={styles.elections_box}>
        <ElectionList
          ballot_type={ballot_type_selected}
          elections_selected={elections_selected}
          set_elections_selected={set_elections_selected} 
          max_selected={1}
          initial_election_filters={location.state && location.state.election_filters ? location.state.election_filters : {}}
        /> 
      </div>
      <div className={styles.election_info_box}>
        {rule_list && elections_selected.size > 0 ?
          render_election_box() :
          <pre className={styles.no_election_selected_text}>
            {"↑  Select an election  ↑"}
          </pre>
        }
      </div>
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
