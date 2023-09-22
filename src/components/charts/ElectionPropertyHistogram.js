import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { get_election_property_histogram } from '../../utils/database_api';
import { capitalize_first_letter, shorten_high_magnitude_number, transparentize, clone, get_ballot_type_color } from '../../utils/utils';
import GeneralChart from './GeneralChart';
import { useNavigate, useOutletContext } from "react-router-dom";


export const get_graph_options = (api_response) => {
  return {
    scales: {
      x: {
        type: 'logarithmic',
        stacked: true,
        title: {
          display: false 
        },
        min: api_response ? api_response.data.bins[0] : null,
        max: api_response ? api_response.data.bins[api_response.data.bins.length-1] : null,
        grid: {
          offset: false
        },
        ticks: {
          format: {notation: 'compact'},
          autoSkip: true,
        }
      },
      y: {
        type: 'linear',
        stacked: true,
        beginAtZero: true,
        title: {
          text: 'Number of elections' 
        },
        afterFit(scale) {
          scale.width = 60;
        },
      }
    },
    plugins: {
      title: {
        text: api_response ? capitalize_first_letter(api_response.meta_data.election_property.name) : "",
        font: {
          weight: 'normal'
        }
      },
      tooltip:{
        mode: 'index',
        backgroundColor: '#00000077',
        callbacks: {
          // label: (tooltipItem, data) => {
          //   return api_response.data.[tooltipItem.dataIndex].toFixed(3);
          // },
          title: (tooltipItems, data) => {
            if (api_response){
              return shorten_high_magnitude_number(api_response.data.bins[tooltipItems[0].dataIndex], 1)
                     + " - " 
                     + shorten_high_magnitude_number(api_response.data.bins[tooltipItems[0].dataIndex+1], 1);
            }
            return "";
          },
        }
      },
    },
  }
};


const compute_graph_data = (api_response, props_constant, old_graph_data, set_error) => {
  let datasets = []
  let labels = []

  for (let i = 0; i < api_response.data.bin_midpoints.length; i += 1) {
    labels.push(api_response.data.bin_midpoints[i]);
  }

  props_constant.ballot_types.forEach((ballot_type, index) => {
    let data = []
    for (let i = 0; i < api_response.data.bin_midpoints.length; i += 1) {
      data.push(api_response.data.values[ballot_type.name][i]);
    }

    datasets.push({
      label: ballot_type.name,
      data: data,
      backgroundColor: transparentize(get_ballot_type_color(index), .8),
      categoryPercentage: 1,
      barPercentage: 1,
      // minBarLength: 0,
      barThickness: 'flex',
      inflateAmount: 0,
      hidden: false
    })
  });
  
  let graph_data = {
    labels: labels,
    datasets: datasets
  };
  return graph_data; 
}


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data, set_error) => {
  let new_graph_data = clone(old_graph_data)
  for (let index = 0; index < new_graph_data.datasets.length; index++) {
    new_graph_data.datasets[index].hidden = !props_variable.ballot_type_visibility[index];
  }
  return new_graph_data;
}


const api_request = (props_constant) => {
  let [election_property_histogram_promise, abort_controller] = get_election_property_histogram(
    props_constant.election_property_short_name,
    30,
    true,
    true
  );
  return {
    promise: election_property_histogram_promise,
    abort_func: () => {abort_controller.abort()}
  }
}


const generate_export_data = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  const bins = []
  const num_elections = []
  for (let i = 0; i < api_response.data.bins.length-1; i++) {
    bins.push([[api_response.data.bins[i], api_response.data.bins[i+1]]])
    const bin_num_elections = {}
    parent_props_constant.ballot_types.forEach((ballot_type) => {
      bin_num_elections[ballot_type.name] = api_response.data.values[ballot_type.name][i];
    });
    num_elections.push(bin_num_elections)
  }

  return {
    property: api_response.meta_data.election_property.name,
    bins: bins,
    num_elections: num_elections
  }
}


const generate_tooltip_info = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  if (api_response){
    const property = api_response.meta_data.election_property;
    let info_text = "Histogram showing the number of elections in the database with respect to the " + property.name;
                   
    return (
      <div>
        {info_text}
        {property.description &&
          <>
            <br/><br/>
            <span style={{fontWeight: "bold"}}>{capitalize_first_letter(property.name) + ": "}</span>
            {property.description}
          </>
        }
      </div>
    );
  }
  return null;
}



export default function ElectionPropertyHistogram(props) { 
  const navigate = useNavigate(); 
  const {set_ballot_type_selected} = useOutletContext();

  const {election_property_short_name, ballot_types, ballot_type_visibility, render_delay} = props;
  
  const props_constant = useMemo(
    () => {
      return election_property_short_name && ballot_types ? {election_property_short_name, ballot_types} : null;
    },
    [election_property_short_name, ballot_types]
    );  
    
    const props_variable = useMemo(
      () => {
        return ballot_type_visibility ? {ballot_type_visibility} : null;
      },
      [ballot_type_visibility]
      );  
      

    const on_click = (element, api_response, parent_props_constant, parent_props_variable, graph_data) => {
      let property_filter;
      if (api_response.meta_data.election_property.inner_type === 'int'){
        property_filter = {
          min: Math.ceil(parseInt(api_response.data.bins[element.index])),
          max: Math.floor(parseInt(api_response.data.bins[element.index+1]))
        } 
      } else {
        property_filter = {
          min: parseFloat(api_response.data.bins[element.index].toFixed(2)),
          max: parseFloat(api_response.data.bins[element.index+1].toFixed(2))
        }

      }
      
      let election_filters = {[parent_props_constant.election_property_short_name]: property_filter};
      set_ballot_type_selected(parent_props_constant.ballot_types[element.datasetIndex].name);
      navigate('compare_elections', {state: {election_filters: election_filters}});
    }


    return (
      <GeneralChart 
        chart_id={"election_property_histogram"+election_property_short_name}
        compute_graph_data={compute_graph_data}
        update_graph_data={update_graph_data}
        api_request={api_request}
        generate_tooltip_info={generate_tooltip_info}
        parent_props_constant={props_constant}
        parent_props_variable={props_variable}
        get_graph_options={get_graph_options}
        generate_export_data={generate_export_data}
        chart_component={Bar}
        render_delay={render_delay}
        on_click={on_click}
    />
  );
}
