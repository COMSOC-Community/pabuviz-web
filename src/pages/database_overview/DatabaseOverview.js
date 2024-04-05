import React, { useEffect, useState } from 'react';
import ToggleLegend from '../../components/reusables/ToggleLegend';
import ElectionSizePlot from '../../components/charts/ElectionSizePlot'
import ElectionPropertyHistogram from '../../components/charts/ElectionPropertyHistogram';
import ActivityIndicator from '../../components/reusables/ActivityIndicator'
import Logo from '../../components/reusables/Logo'
import NetworkError from '../../components/reusables/NetworkError';
import { get_elections } from '../../utils/database_api';
import styles from './DatabaseOverview.module.css'

// short names of the election properties to be shown as a histogram
const election_property_short_names = [
  "budget",
  "avg_ballot_len",
  "num_votes",
  "num_projects",
	"fund_scarc",
  "avg_proj_cost",
  "avg_ballot_cost"
]

/**
 * this is the (sub-)page giving an overview over the elections saved in the database
 * @returns {React.JSX.Element}
 */
export default function DatabaseOverview(props) { 

  const [initial_loading, set_initial_loading] = useState(true)
  const [elections, set_elections] =  useState([])
  const [ballot_types, set_ballot_types] =  useState([])
  const [ballot_type_visibility, set_ballot_type_visibility] = useState([])
  const [error, set_error] = useState(false);

  // load election and ballot type data on initial load
  useEffect(() => {
    let [initial_data_promise, abort_controller] = get_elections();
    initial_data_promise.then(response => {
      if (response){
        set_elections(response.data);
        set_ballot_types(response.metadata.ballot_types)
        set_ballot_type_visibility(response.metadata.ballot_types.map(() => true))
        set_initial_loading(false);
      }
    }).catch((error) => {console.error(error); set_error(true)});

    return () => {
      abort_controller.abort();
    }
  }, []);

  
  // method for rendering one of the election property histograms
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


  // method for rendering the title and explanation of the page
  const render_title = () => {
    return (
      <>
        <h1 className={styles.title_text}>
          Welcome to <Logo/>
        </h1>
        <div className={styles.info_text}>
          <p><Logo/> (read pabuviz and pronounced pabooviz) is an interactive computation and visualization tool for participatory budgeting. It provides intuitive and visually appealing comparison tools based on real life data.</p>
          <p>If you don't know what participatory budgeting (PB or pabu) is, the <a href="https://en.wikipedia.org/wiki/Participatory_budgeting">Wikipedia page</a> provides extensive details, but in short, PB is a democratic tool through which ordinary citizens decide how to allocate a given amount of money across several projects.</p>
          <p>Many PB are based on a voting process in which citizens <em>vote</em> to decide the final allocation of the budget. In these cases, choosing the voting rule&mdash;the rule (or procedure) through which the final budget allocation is decided based on the ballots that have been cast&mdash;can be difficult since there are numerous possibilities.</p>
          <p>With <Logo/> you can, in a blink of an eye, compare different voting rules for PB based on many criteria and discover the most suitable one for your needs!</p>
        </div>
      </>
    )
  }


  return (
    <div className={styles.page_container}>
      <div className={styles.content_container}>
        <div className={styles.title_container}>
          {render_title()}
        </div>
        <div className={styles.graphs_box}>
          { error ? 
            <NetworkError/> :
            ( initial_loading ?
              <ActivityIndicator/> :
              <div className={styles.graphs_and_legend_container}>
                <h2 className={styles.graph_title}>Overview of the Elections in the Database</h2>
                <ToggleLegend
                  items={ballot_types}
                  visibility={ballot_type_visibility}
                  set_visibility={set_ballot_type_visibility}
                  horizontal={true}
                  tooltip_id="main_tooltip"
                  name_suffix={"ballots"}
                />
                <div className={styles.graphs_container}>
                  <div className={styles.overview_graph_container}>
                    <ElectionSizePlot 
                      elections={elections} 
                      ballot_type_visibility={ballot_type_visibility}
                      ballot_types={ballot_types}
                    />
                    <p className={styles.graph_info_text}>
                      Click on a dot to be explore the details of the corresponding election.
                      The election data is taken from <a href="https://pabulib.org/">pabulib.org</a>,
                      the reference platform for participatory budgeting data.
                    </p>
                  </div>
                  <div className={styles.histograms_container}>
                    {election_property_short_names.map(render_election_property_histogram)}
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
