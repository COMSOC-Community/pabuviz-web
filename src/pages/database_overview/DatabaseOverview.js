import React, { useEffect, useState } from 'react';
import styles from './DatabaseOverview.module.css'
import ActivityIndicator from '../../components/reusables/ActivityIndicator'
import ElectionSizePlot from '../../components/charts/ElectionSizePlot'
import { get_elections } from '../../utils/database_api';
import ElectionPropertyHistogram from '../../components/charts/ElectionPropertyHistogram';
import NetworkError from '../../components/reusables/NetworkError';
import ToggleLegend from '../../components/reusables/ToggleLegend';


const election_property_short_names = [
  "budget",
  "avg_ballot_length",
  "num_votes",
  "num_projects",
	"funding_scarcity",
  "avg_project_cost",
  "avg_ballot_cost"
]


export default function DatabaseOverview(props) { 

  const [initial_loading, set_initial_loading] = useState(true)
  const [elections, set_elections] =  useState([])
  const [ballot_types, set_ballot_types] =  useState([])
  const [ballot_type_visibility, set_ballot_type_visibility] = useState([])
  const [error, set_error] = useState(false);


  useEffect(() => {
    let [initial_data_promise, abort_controller] = get_elections();
    initial_data_promise.then(set_initial_data).catch((error) => {set_error(true)});

    return () => {
      abort_controller.abort();
    }
  }, []);

  
  const set_initial_data = (elections_response) => {
    if (elections_response){
      set_elections(elections_response.data);
      set_ballot_types(elections_response.metadata.ballot_types)
      set_ballot_type_visibility(elections_response.metadata.ballot_types.map(() => true))
      set_initial_loading(false);
    }
  }


  const render_election_property_histogram = (election_property_short_name, index) => {
    return (
      <div key={election_property_short_name}>
        {index === 0 || <div className={styles.horizontal_separator}/>}
        <div className={styles.histogram_container} >
          <ElectionPropertyHistogram 
            election_property_short_name={election_property_short_name} 
            ballot_type_visibility={ballot_type_visibility}
            ballot_types={ballot_types}
            render_delay={(index+1)*400}
          />
        </div>
      </div>
    )
  }

  
  // const on_debug_button_click = () => {
  //   // console.log(dict_data_for_graph)
  // }

  const render_title = () => {

    return (
      <>
        <div className={styles.title_text}>
          This is a welcoming text
        </div>
        <div className={styles.info_text}>
          This is a text giving some explanations of the web page. This text is very long, potentially even a lot longer than this.
        </div>
      </>
    )
  }



  

  return (
    <div className={styles.content_container}>
      <div className={styles.title_container}>
        {render_title()}
      </div>
      <div className={styles.graphs_box}>
        { error ? 
          <NetworkError/> :
          ( initial_loading ?
            <ActivityIndicator/> : 
            <>
              <ToggleLegend
                items={ballot_types}
                visibility={ballot_type_visibility}
                set_visibility={set_ballot_type_visibility}
                horizontal={true}
              />
              <div className={styles.graphs_container}>
                <div className={styles.graph_container}>
                  <ElectionSizePlot 
                    elections={elections} 
                    ballot_type_visibility={ballot_type_visibility}
                    ballot_types={ballot_types}
                  />
                </div>
                <div className={styles.histograms_container}>
                  {election_property_short_names.map(render_election_property_histogram)}
                </div>
              </div>
            </>
          )
        }
      </div>
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
