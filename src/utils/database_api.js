

import { get_rule_color } from './utils';


const api_post = (url_suffix, parameters = {}) => {
  const abort_controller = new AbortController();
  return [
    new Promise(async (resolve, reject) => {

      let data;
      try { // TODO: proper error handling
        data = await fetch(
          process.env.REACT_APP_API_URL + url_suffix + '/',
          {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            },
            signal: abort_controller.signal
          }
        );
          
        if (data.status === 200){
          resolve(await data.json());
        } else if (data.status === 404) {
          resolve(null);
        } else {
          resolve(null);
        }

      } catch (error) {
        if (error.name === "AbortError"){
          resolve(undefined);
        } else {
          reject(error);
        }
      }
      
    }),
    abort_controller
  ]
}



export const get_elections = (filters = {}) => {
  return api_post('elections', {filters});
}

export const get_election_details = (property_short_names, ballot_type = null, filters = {}) => {
  return api_post('election_details', {property_short_names, ballot_type, filters});
}

// get the rules and add their colors. This way we don't always need to pass the families as well 
export const get_rules = () => {
  const [rules_promise, abort_controller] = api_post('rules');
  return [new Promise((resolve, reject) => {
    rules_promise.then(rules_response => {
      if(rules_response){
        rules_response.data.forEach((rule_family, family_index) => {
          rule_family.elements.forEach((rule, index) => {
            rule.color = get_rule_color(family_index, index);
          });
          rule_family.color_from = get_rule_color(family_index, 0);
          rule_family.color_to = get_rule_color(family_index, rule_family.elements.length-1);
        });
      }
      resolve(rules_response);
    }).catch(reject)
  }), abort_controller]
}

export const get_ballot_types = () => {
  return api_post('ballot_types');
}

export const get_rule_properties = (property_short_names) => {
  return api_post('rule_properties', {property_short_names});
}

export const get_election_properties = (property_short_names, ballot_type) => {
  console.log(ballot_type)
  return api_post('election_properties', {property_short_names, ballot_type});
}

export const get_election = (election_id) => {
  return api_post('elections/' + election_id);
}

export const get_projects = (election_id) => {
  return api_post('projects', {election_id});
}


export const get_rule_result_properties = (rule_abbr_list, property_short_names, election_filters = {}) => {
  return api_post(
    'avg_rule_property',
    {
      rule_abbr_list,
      property_short_names,
      election_filters
    }
  );
}

export const get_rule_satisfaction_histogram = (rule_abbr_list, election_filters = {}) => {
  return api_post(
    'rule_voter_satisfaction_histogram',
    {
      rule_abbr_list,
      election_filters
    }
  );
}

export const get_election_property_histogram = (election_property_short_name, num_bins, by_ballot_type=false, log_scale=false, election_filters = {}) => {
  return api_post(
    'election_property_histogram',
    {
      election_property_short_name,
      election_filters,
      by_ballot_type,
      num_bins,
      log_scale
    }
  );
}

export const get_category_proportions = (election_id, rule_abbreviation_list) => {
  return api_post(
    'category_proportions',
    {
      election_id,
      rule_abbreviation_list
    }
  );
}