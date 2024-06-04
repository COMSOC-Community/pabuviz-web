import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { clone, transparentize } from '../../utils/utils';

import { get_rule_satisfaction_histogram } from '../../utils/database_api';
import GeneralChart from './GeneralChart';
import { satisfaction_histogram_explanation } from '../../constants/chart_explanations';
import styles from "../../pages/compare_election_results/ElectionGraphs.module.css";


export const get_graph_options = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  const annotations = {}
  if (api_response && parent_props_constant && parent_props_variable) {
    parent_props_constant.rules.forEach((rule, index) => {
      annotations[rule.abbreviation] = {
        type: 'line',
        scaleID: 'x',
        value: api_response.data[rule.abbreviation]["avg"] * 100,
        borderWidth: 3,
        borderColor: rule.color,
        borderDash: [3, 6],
        borderDashOffset: 6,
        display: parent_props_variable.rule_visibility[rule.abbreviation] === true, // === true needed, because default value is true and expression might be undefined
        label: {
          display: false,
          backgroundColor: transparentize(rule.color, 0.8),
          drawTime: 'afterDatasetsDraw',
          content: "Average satisfaction: " + (api_response.data[rule.abbreviation]["avg"] * 100).toFixed(2) + "%",
          position: "start",
          z: 2,
        },
        enter({element}, event) {
          element.label.options.display = true;
          return true;
        },
        leave({element}, event) {
          element.label.options.display = false;
          return true;
        }
      }
    });
  }

  return {
    scales: {
      x: {
        type: 'linear',
        title: {
          text: 'Percentage of budget spent on approved projects'
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 5
        },
      },
      y: {
        type: 'linear',
        title: {
          text: 'Percentage of voters' 
        },
        beginAtZero: true,
        ticks: {
          grace: '30%'
        }
      }
    },
    plugins: {
      title: {
        text: "Relative voter satisfaction distribution",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems, data) => {
            let interval_string = "";
            if (tooltipItems[0].dataIndex > 0)
            interval_string += ((tooltipItems[0].dataIndex - 1) * 5).toString() + " - ";
            interval_string += (tooltipItems[0].dataIndex * 5).toString() + "% satisfaction";
            return interval_string;
          },
          label: tooltipItem => (tooltipItem.dataset.data[tooltipItem.dataIndex].y).toFixed(2) + "% of voters"
        }
      },
      annotation: {
        annotations
      }
    },
  }
};


const compute_graph_data = (api_response, props_constant, old_graph_data, set_error) => {
  let x_data = []
  for (let interval_start = 0; interval_start <= 100; interval_start+=5) {
    x_data.push(interval_start);
  }
  
  let data = {
    datasets: props_constant.rules.map((rule, index) => {
      let dataset = {
        label: rule.name,
        data: {},
        borderColor: rule.color,
        backgroundColor: transparentize(rule.color, 0.5),
        lineTension: 0.3,
      }
      dataset.data = x_data.map((x, i) => ({x: x, y: api_response.data[rule.abbreviation]["hist_data"][i] * 100}));

      if (!old_graph_data || old_graph_data.datasets.length === 0)
        dataset.hidden = !rule.visible;
      return dataset;
    })
  };
  return data; 
}


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data, set_error) => {
  let new_graph_data = clone(old_graph_data)
  for (let index = 0; index < new_graph_data.datasets.length; index++) {
    new_graph_data.datasets[index].hidden = !props_variable.rule_visibility[props_constant.rules[index].abbreviation];
  }
  return new_graph_data;
}


const generate_export_data = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  let bins = [[0, 0]]
  for (let interval_start = 0; interval_start < 100; interval_start+=5) {
    bins.push([interval_start, interval_start + 5]);
  }
  let voter_percentages = {};
  let avg_satisfactions = {};
  parent_props_constant.rules.forEach(rule => {
    voter_percentages[rule.name] = api_response.data[rule.abbreviation].hist_data;
    avg_satisfactions[rule.name] = api_response.data[rule.abbreviation].avg;
  });

  return {
    voter_satisfaction_bins: bins,
    voter_percentages: voter_percentages,
    avg_satisfactions: avg_satisfactions,
    num_elections: api_response.meta_data.num_elections
  };
 
}


const api_request = (props_constant) => {
  let [rule_satisfaction_histogram_promise, abort_controller] = get_rule_satisfaction_histogram(
    props_constant.rules.map(rule => rule.abbreviation),
    props_constant.election_filters,
    props_constant.user_submitted,
    props_constant.single_election
  );
  return {
    promise: rule_satisfaction_histogram_promise,
    abort_func: () => {abort_controller.abort();}
  }
}


const generate_corner_info = (api_response, props_constant, props_variable, graph_data) => {
  if (api_response){
    return "Number of elections: " + api_response.meta_data.num_elections.toString();
  } else {
    return "";
  }
}


export default function SatisfactionHistogram(props) { 

  const {rules, election_filters, rule_visibility, single_election, user_submitted} = props;
    
  const props_constant = useMemo(
    () => {
      return rules && election_filters ? {rules, election_filters, user_submitted, single_election} : null;
    },
    [rules, election_filters, user_submitted, single_election]
  );

  const props_variable = useMemo(
    () => {
      return rule_visibility ? {rule_visibility} : null;
    },
    [rule_visibility]
  );
  

  return (
    <div className={styles.graph_info_text_container}>
      <GeneralChart
        chart_id={"satisfaction_histogram"}
        compute_graph_data={compute_graph_data}
        update_graph_data={update_graph_data}
        generate_corner_info={single_election ? null : generate_corner_info}
        generate_tooltip_info={() => satisfaction_histogram_explanation}
        api_request={api_request}
        parent_props_constant={props_constant}
        parent_props_variable={props_variable}
        generate_export_data={generate_export_data}
        get_graph_options={get_graph_options}
        chart_component={Line}
      />
      <p className={styles.graph_info_text}>
        A point at coordinates (x, y) reads as: exactly y% of the voters are such that x% of the
        budget has been spent on projects that they individually approved of (see the info box
        for more details).
      </p>
    </div>
  );
}
