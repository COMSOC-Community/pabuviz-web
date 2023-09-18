import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { get_category_proportions } from '../../utils/database_api';
import GeneralChart from './GeneralChart';
import { get_chart_color, transparentize } from '../../utils/utils';
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


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data) => {
  let rules = props_constant.rules.filter((rule, index) => props_variable.rule_visibility[rule.abbreviation])

  let datasets = []
  let labels = ["Vote share"].concat(rules.map(rule => rule.name))

  api_response.category_names.forEach((category_name, index) => {
    let data = [
      api_response.vote_cost_shares[index] * 100,
    ]
   
    rules.forEach((rule) => {
      data.push(api_response.result_cost_shares[rule.abbreviation][index] * 100)
    })

    datasets.push({
      label: category_name,
      data: data,
      inflateAmount: 0,
      backgroundColor: transparentize(get_chart_color(index), 0.6),
    })
  });
  
  let graph_data = {
    labels: labels,
    datasets: datasets
  };
  return graph_data;
}


const api_request = (props_constant) => {
  let [category_proportions_promise, abort_controller] = get_category_proportions(
    props_constant.election_id,
    props_constant.rules.map(rule => rule.abbreviation),
  );
  
  return {
    promise: category_proportions_promise,
    abort_func: () => {abort_controller.abort()}
  }
}




export default function CategoryProportion(props) { 
  // const navigate = useNavigate(); 
  const {election_id, rules, rule_visibility, render_delay} = props;
  
  const props_constant = useMemo(
    () => {
      return election_id && rules ? {election_id, rules} : null;
    },
    [election_id, rules]
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
        // on_click={on_click}
    />
  );
}
