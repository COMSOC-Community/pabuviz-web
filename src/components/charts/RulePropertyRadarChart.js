import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { capitalize_first_letter, format_number_string, transparentize } from '../../utils/utils';
import { get_rule_result_properties } from '../../utils/database_api';
import GeneralChart from './GeneralChart';
import { rule_property_radar_chart_explanation } from '../../constants/chart_explanations';
import styles from "../../pages/compare_election_results/ElectionGraphs.module.css";


export const get_graph_options = (api_response, parent_props_constant, parent_props_variable, graph_data) => ({
  scales: {
    r: {
      min: -0.3,
      max: 1.2,
      ticks: {
        display: false,
      },
    }
  },
  spanGaps: false,
  plugins: {
    title: {
      display: false
    },
    tooltip:{
      callbacks: {
        label: tooltipItem => {
          const range = parent_props_constant.rule_properties[tooltipItem.dataIndex].range;
          if (range === "01") {
            return (tooltipItem.dataset.raw_data[tooltipItem.dataIndex]*100).toFixed(2) + "%";
          } else {
            return format_number_string(tooltipItem.dataset.raw_data[tooltipItem.dataIndex].toFixed(2));
          }
        }
      }
    },
  },
});


const initial_graph_data = (props_constant) => {
  if (props_constant && props_constant.rule_properties){
    return {
      labels: props_constant.rule_properties.map(property => capitalize_first_letter(property.name)),
      datasets: []
    };;
  }
}


const update_graph_data = (api_response, props_constant, props_variable, old_graph_data, set_error) => {

  if (api_response.meta_data.num_elections === 0){
    return initial_graph_data(props_constant)
  }

  // collect min and max values for each property for normalizing 
  let min_visible_value = props_constant.rule_properties.map(() => Infinity);
  let max_visible_value = props_constant.rule_properties.map(() => 0);

  let datasets = props_constant.rules.map((rule, rule_index) => {
    let dataset = {
      label: rule.abbreviation,
      raw_data: [],
      data: [],
      hidden: !props_variable.rule_visibility[rule.abbreviation],
      borderColor: rule.color,
      backgroundColor: transparentize(rule.color, 0.5),
      fill: false
    }
    
    props_constant.rule_properties.forEach((rule_property, rule_property_index) => {
      let value = api_response.data[rule.abbreviation][rule_property.short_name]
      dataset.raw_data.push(value);
      if (props_variable.rule_visibility[rule.abbreviation] && value < min_visible_value[rule_property_index])
        min_visible_value[rule_property_index] = value;
      if (props_variable.rule_visibility[rule.abbreviation] && value > max_visible_value[rule_property_index])
        max_visible_value[rule_property_index] = value;
    });

    return dataset;
  });

  // normalize data
  datasets.forEach((dataset, rule_index) => {
    dataset.raw_data.forEach((value, rule_property_index) => {
      if (value){
        let max_scaling = 0.01; // does not do much for big values, could be adapted to be multiplicative
        if (max_visible_value[rule_property_index] - min_visible_value[rule_property_index] > max_scaling){
          dataset.data.push((value - min_visible_value[rule_property_index]) / (max_visible_value[rule_property_index] - min_visible_value[rule_property_index]));
        } else {
          dataset.data.push((value - 0.5 * (min_visible_value[rule_property_index] + max_visible_value[rule_property_index])) / max_scaling + .5);
        }
      } else {
        dataset.data.push(null);
      }
    })
  });
  
  
  let data = {
    labels: props_constant.rule_properties.map(property => capitalize_first_letter(property.name)),
    datasets: datasets
  };
  
  return data;

}


const generate_export_data = (api_response, parent_props_constant, parent_props_variable, graph_data) => {
  const property_values = {}

  parent_props_constant.rules.forEach(rule => {
    const rule_property_values = []
    parent_props_constant.rule_properties.forEach(rule_property => {
      rule_property_values.push(api_response.data[rule.abbreviation][rule_property.short_name]);
    });
    property_values[rule.name] = rule_property_values;
  });

  const data = {
    properties: parent_props_constant.rule_properties.map(property => property.name),
    avg_values: property_values,
    num_elections: api_response.meta_data.num_elections
  };

  if (api_response.meta_data.num_elections !== 1){
    data['filters'] = parent_props_constant.election_filters;
  }

  return data;
}


const generate_corner_info = (api_response, props_constant, props_variable, graph_data) => {
  if (api_response){
    return "Number of elections: " + api_response.meta_data.num_elections.toString();
  } else {
    return "";
  }
}


const generate_tooltip_info = (api_response, props_constant, props_variable, graph_data) => {
  if (props_constant){
    return (
      <div>
        {rule_property_radar_chart_explanation}
        {props_constant.rule_properties.map(property => (
          <div key={property.name}>
            <br/>
            <span style={{fontWeight: "bold"}}>{capitalize_first_letter(property.name) + ": "}</span>
            <br/>
            {capitalize_first_letter(property.description)}
          </div>
        
        ))}
        
      </div>
    );
  }
}

const api_request = (props_constant) => {
  let [rule_result_property_promise, abort_controller] = get_rule_result_properties(
    props_constant.rules.map(rule => rule.abbreviation),
    props_constant.rule_properties.map(property => property.short_name),
    props_constant.election_filters,
    props_constant.user_submitted,
    props_constant.single_election
  )
  
  return {
    promise: rule_result_property_promise,
    abort_func: () => {abort_controller.abort()}
  }
}


export default function RulePropertyRadarChart(props) { 
    
  const {rules, rule_properties, election_filters, rule_visibility, single_election, user_submitted} = props;
    
  const props_constant = useMemo(
    () => {
      return rules && rule_properties && election_filters ? {rules, rule_properties, election_filters, user_submitted, single_election} : null;
    },
    [rules, rule_properties, election_filters, user_submitted, single_election]
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
        chart_id={"rule_property_radar_chart" + JSON.stringify(election_filters)}
        initial_graph_data={initial_graph_data}
        // compute_graph_data={compute_graph_data}
        update_graph_data={update_graph_data}
        generate_corner_info={single_election ? null : generate_corner_info}
        generate_tooltip_info={generate_tooltip_info}
        generate_export_data={generate_export_data}
        api_request={api_request}
        parent_props_constant={props_constant}
        parent_props_variable={props_variable}
        get_graph_options={get_graph_options}
        chart_component={Radar}
      />
      <p className={styles.graph_info_text}>
        Fox each axis the position only presents the ranking of the rules and not the
        actual magnitude of the difference.
      </p>
    </div>
  );
}
