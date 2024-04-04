import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { get_category_proportions } from '../../utils/database_api';
import GeneralChart from './GeneralChart';
import { capitalize_first_letter, get_chart_color, transparentize } from '../../utils/utils';
import { category_proportions_explanation } from '../../constants/chart_explanations';


export const get_graph_options = (api_response) => {
  return {
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        min: 0,
        max: 100,
      },
      y: {
        stacked: true,
        ticks: {
          autoSkip: false,
        },
      }
    },
    animation: {     
      duration: 0
    },
    plugins: {
      title: {
        text: "Category proportions",
      },
      tooltip:{
        // mode: 'index',
        backgroundColor: '#00000077',
        callbacks: {
          label: tooltipItem => (tooltipItem.dataset.data[tooltipItem.dataIndex]).toFixed(1) + "%",
          title: tooltipItems => tooltipItems[0].dataset.label
        }
      },
    },
  }
};


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data, set_error) => {
  let rules = props_constant.rules.filter((rule, index) => props_variable.rule_visibility[rule.abbreviation])

  if (api_response.data.category_names.length === 0){
    set_error("No categories");
    return old_graph_data;
  }

  let datasets = [];
  let labels = ["Vote share"].concat(rules.map(rule => capitalize_first_letter(rule.name)));

  api_response.data.category_names.forEach((category_name, index) => {
    let data = [
      api_response.data.vote_cost_shares[index] * 100,
    ];
   
    rules.forEach((rule) => {
      data.push(api_response.data.result_cost_shares[rule.abbreviation][index] * 100);
    });

    datasets.push({
      label: category_name,
      data: data,
      inflateAmount: 0,
      backgroundColor: transparentize(get_chart_color(index), 0.6),
    });
  });
  
  let graph_data = {
    labels: labels,
    datasets: datasets
  };
  return graph_data;
}


const api_request = (props_constant) => {
  let [category_proportions_promise, abort_controller] = get_category_proportions(
    props_constant.election_name,
    props_constant.rules.map(rule => rule.abbreviation),
    props_constant.user_submitted
  );
  
  return {
    promise: category_proportions_promise,
    abort_func: () => {abort_controller.abort()}
  }
}


const generate_export_data = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  
  let data = {
    categories: api_response.data.category_names,
    vote_cost_shares: api_response.data.vote_cost_shares,
    allocation_cost_shares: {}
  };

  parent_props_constant.rules.forEach((rule) => {
    data.allocation_cost_shares[rule.name] = api_response.data.result_cost_shares[rule.abbreviation]
  });
  
  return data;
}



export default function CategoryProportion(props) { 
  const {election_name, rules, rule_visibility, render_delay, user_submitted} = props;
  
  const props_constant = useMemo(
    () => {
      return election_name && rules ? {election_name, rules, user_submitted} : null;
    },
    [election_name, rules, user_submitted]
  );  

  const props_variable = useMemo(
    () => {
      return rule_visibility ? {rule_visibility} : null;
    },
    [rule_visibility]
  );  
    

    return (
      <GeneralChart 
        chart_id={"category_proportions"}
        api_request={api_request}
        // compute_graph_data={compute_graph_data}
        update_graph_data={update_graph_data}
        parent_props_constant={props_constant}
        parent_props_variable={props_variable}
        get_graph_options={get_graph_options}
        chart_component={Bar}
        render_delay={render_delay}
        generate_tooltip_info={() => category_proportions_explanation}
        generate_export_data={generate_export_data}
    />
  );
}
