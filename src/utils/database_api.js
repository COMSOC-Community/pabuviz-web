
const api_get = (url_suffix, parameters = {}) => {
  const abort_controller = new AbortController();
  return [
    new Promise(async (resolve, reject) => {
      
      var parameter_search_query = new URLSearchParams()
      for (var key of Object.keys(parameters)){
        parameter_search_query.append(key, JSON.stringify(parameters[key]))
      }
      
      try { // TODO: proper error handling
        var response = await fetch(
          process.env.REACT_APP_API_URL + url_suffix + '/?' + parameter_search_query.toString(),
          {
            cache: "default",
            signal: abort_controller.signal
          } 
        );

        // response = await fetch(
        //   process.env.REACT_APP_API_URL + url_suffix + '/',
        //   {
        //     method: "POST",
        //     body: JSON.stringify(parameters),
        //     headers: {
        //       "Content-type": "application/json; charset=UTF-8"
        //     },
        //     signal: abort_controller.signal
        //   }
        // );
        if (response.status === 200){
          resolve(await response.json());
        } else if (response.status === 404) {
          resolve(null);
        } else {
          console.warn("api error:", (await response.json()).detail);
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
  return api_get('elections', {filters});
}

export const get_election_details = (property_short_names, ballot_type = null, filters = {}, user_submitted = false) => {
  return api_get('election_details', {property_short_names, ballot_type, filters, user_submitted});
}

export const get_election_property_values_list = (property_short_name, ballot_type = null, user_submitted = false) => {
  return api_get('election_property_values_list', {property_short_name, ballot_type, user_submitted});
}

export const get_rules = () => {
  return api_get('rules'); 
}

export const get_ballot_types = () => {
  return api_get('ballot_types');
}

export const get_rule_properties = (property_short_names) => {
  return api_get('rule_properties', {property_short_names});
}

export const get_election_properties = (property_short_names, ballot_type) => {
  return api_get('election_properties', {property_short_names, ballot_type});
}

export const get_projects = (election_name, user_submitted = false) => {
  return api_get('projects', {election_name, user_submitted});
}

export const get_rule_result_properties = (
  rule_abbr_list,
  property_short_names,
  election_filters = {},
  user_submitted = false,
  include_incomplete_elections = false,
) => {
  return api_get(
    'avg_rule_property',
    {
      rule_abbr_list,
      property_short_names,
      election_filters,
      user_submitted,
      include_incomplete_elections
    }
  );
}

export const get_rule_satisfaction_histogram = (
  rule_abbr_list,
  election_filters = {},
  user_submitted = false,
  include_incomplete_elections = false
) => {
  return api_get(
    'rule_voter_satisfaction_histogram',
    {
      rule_abbr_list,
      election_filters,
      user_submitted,
      include_incomplete_elections
    }
  );
}

export const get_election_property_histogram = (election_property_short_name, num_bins, by_ballot_type=false, log_scale=false, election_filters = {}) => {
  return api_get(
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

export const get_category_proportions = (election_name, rule_abbreviation_list, user_submitted = false) => {
  return api_get(
    'category_proportions',
    {
      election_name,
      rule_abbreviation_list,
      user_submitted
    }
  );
}


export const submit_pb_file = async (pb_file) => {
  const formData = new FormData();
  formData.append("pb_file", pb_file);

  const response = await fetch(
    process.env.REACT_APP_API_URL + "submit_pb_file/",
    {
      method: "POST",
      body: formData,
    }
  );

  if (response.status === 200){
    const data = await response.json();
    return data;
  } else {
    const data = await response.json();
    throw (data.detail)
  }
}