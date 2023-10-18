import React, { useContext, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { transparentize, clone, get_ballot_type_color } from '../../utils/utils';
import GeneralChart from './GeneralChart';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { UrlStateContext } from '../../UrlParamsContextProvider';


export const graph_options = {
  scales: {
    x: {
      type: 'logarithmic',
      title: {
        text: 'Number of voters' 
      },
      ticks: {
        minRotation: 0,
        maxRotation: 45,
        maxTicksLimit: 10,
      },
    },
    y: {
      type: 'logarithmic',
      title: {
        text: 'Number of projects' 
      },
    }
  },
  plugins: {
    title: {
      text: "Election sizes"
    },
    tooltip:{
      callbacks: {
        label: tooltipItem => [
          tooltipItem.raw.election.name,
          tooltipItem.raw.x.toString() + " voters",
          tooltipItem.raw.y.toString() + " projects"
        ]
      }
    }
  },
};


const compute_graph_data = (api_response, props_constant, old_graph_data, set_error) => {
  let datasets = {};
  for (const [index, ballot_type] of props_constant.ballot_types.entries()){
    datasets[ballot_type.name] = {
      label: ballot_type.name,
      data: [],
      info: [],
      hidden: false,
      pointStyle: 'circle',
      pointRadius: 2.5,
      pointHoverRadius: 5,
      borderColor: get_ballot_type_color(index),
      backgroundColor: transparentize(get_ballot_type_color(index), 0.5),
      order: 4-index
    }
  };
  
  for (let election of props_constant.elections){
    datasets[election.ballot_type].data.push({
      x: election.num_votes,
      y: election.num_projects,
      election: election
    })
  }
  
  let data = {
    labels: [],
    datasets: Object.values(datasets)
  };
    
  return data;
}


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data, set_error) => {
  let new_graph_data = clone(old_graph_data)
  for (let index = 0; index < new_graph_data.datasets.length; index++) {
    new_graph_data.datasets[index].hidden = !props_variable.ballot_type_visibility[index];
  }
  return new_graph_data;
}


const generate_export_data = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  let data = []
  for (let election of parent_props_constant.elections){
    const {num_votes, num_projects, ballot_type, name} = election;
    data.push({num_votes, num_projects, ballot_type, name});
  }
  return data;
}


export default function ElectionSizePlot(props) { 
  
  const navigate = useNavigate(); 
  const {update_search_params_state} = useContext(UrlStateContext);
  const {set_ballot_type_selected} = useOutletContext();
  const {elections, ballot_types, ballot_type_visibility} = props;


  const props_constant = useMemo(
    () => {
      return elections && ballot_types ? {elections, ballot_types} : null;
    },
    [elections, ballot_types]
  );  
    
  const props_variable = useMemo(
    () => {
      return ballot_type_visibility ? {ballot_type_visibility} : null;
    },
    [ballot_type_visibility]
  );  

  const on_click = (element, api_response, parent_props_constant, parent_props_variable, graph_data) => {
    let election = graph_data.datasets[element.datasetIndex].data[element.index].election;
    set_ballot_type_selected(election.ballot_type)
    update_search_params_state("elections", JSON.stringify([election.name]))
    navigate('compare_elections');
  }

  return (
    <GeneralChart 
      chart_id={"election_size_plot"}
      compute_graph_data={compute_graph_data}
      update_graph_data={update_graph_data}
      // generate_corner_info={generate_corner_info}
      parent_props_constant={props_constant}
      parent_props_variable={props_variable}
      get_graph_options={() => graph_options}
      generate_export_data={generate_export_data}
      on_click={on_click}
      chart_component={Scatter}
    />
  );

}
