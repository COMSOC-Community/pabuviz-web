import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from "react-router-dom";
import { default_rules_visible } from './constants/constants';
import { UrlStateContext } from 'contexts';

/**
 * Here, we define all states that should be synchronized with the URL search parameters
 * Options:
 *  [to_string]: method that stringifies the state to be stored in the URL, optional if state is a string
 *  [from_string]: method that parses the state from the URL, optional if state is a string
 *  global: whether the search parameter (and thus the state) should persist, when changing the page
 *  dependencies: names of other URL parameters that this state depends on
 *                whenever any of them is changed, this state will be reset to default
 *  default: default/initial value of the state
 *           can also be passed a function taking as parameter the dependencies array and returning the default state
 */
export const search_param_states_options = new Map([
  ["ballot_type_selected", {
    default: "approval",
    global: true
  }],
  ["rule_visibility", {
    default: deps => default_rules_visible[deps[0]].reduce((acc,curr) => {acc[curr] = true; return acc}, {}),
    to_string: rv => JSON.stringify(Object.keys(rv).filter(key => rv[key])),
    from_string: rv_string => JSON.parse(rv_string).reduce((acc,curr) => {acc[curr] = true; return acc}, {}),
    dependencies: ["ballot_type_selected"],
    global: true
  }],
  ["elections_selected", {
    default: [],
    dependencies: ["ballot_type_selected"],
    to_string: JSON.stringify,
    from_string: JSON.parse,
    global: false
  }]
]);

/**
 * Component managing the states that should be synchronized with the URL search parameters.
 * Wrap your main component with this and you can use the provided states defined in search_param_states_options
 * and a corresponding setter function through the context
 * @example 
 * import React, { useContext } from 'react';
 * import { UrlStateContext } from 'UrlParamsContextProvider'; 
 * const {ballot_type_selected, set_ballot_type_selected} = useContext(UrlStateContext);
 * @returns {React.JSX.Element}
 */
export default function UrlParamsContextProvider(props) {  
  
  // the 'state' holding the search parameters
  const [search_params, set_search_params] = useSearchParams(); 
  // the state holding the parsed search params, this state is controlled by search_params
  const [search_param_states, set_search_param_states] = useState({});

  // effect that updates search_param_states, when search_params changes
  useEffect(() => {
    const new_search_param_states = {}
    search_param_states_options.forEach((options, key) => {
      
      const from_string = options.from_string || (x=>x);
      if (search_params.get(key)){
        new_search_param_states[key] = from_string(search_params.get(key));
      } else {
        const default_value = typeof(options.default) === 'function' ? 
          options.default(options.dependencies.map(dep_key => new_search_param_states[dep_key])) :
          options.default
        new_search_param_states[key] = default_value;
      }
    })
    set_search_param_states(new_search_param_states);
  }, [search_params, set_search_param_states]);
  

  // function that can update one or multiple search params from an object
  // careful: does not set the new search params
  const get_updated_search_params = (search_params, new_search_params_obj) => {
    const new_search_params = new URLSearchParams(search_params);
    search_param_states_options.forEach((options, key) => {
      if(new_search_params_obj[key] !== undefined){
        const to_string = options.to_string || (x=>x);
        const new_value = to_string(new_search_params_obj[key]);
        if (new_value){
          new_search_params.set(key, new_value);
        } else {
          new_search_params.delete(key);
        }
        search_param_states_options.forEach((opt, k) => {
          if (opt.dependencies && opt.dependencies.includes(key)){
            new_search_params.delete(k);
          }
        }); 
      }
    });
    return new_search_params;
  } 

  // function that sets one or multiple multiple search params from an object
  const set_updated_search_params = (new_search_params_obj) => {
    set_search_params(get_updated_search_params(search_params, new_search_params_obj));
  }
  
  // returns an url string to the given local path with the new search parameters given in the object
  // use this for any navigation to make sure the search params update properly 
  const get_url_navigation_string = (route_name, new_search_params_obj = {}) => {
    let new_search_params = new URLSearchParams(search_params);
    search_param_states_options.forEach((options, key) => {
      if (!options.global){
        new_search_params.delete(key);
      }
    });
    new_search_params = get_updated_search_params(new_search_params, new_search_params_obj);
    return route_name + "/?" + createSearchParams(new_search_params);
  }
  

  const provider_value = {get_url_navigation_string};
  search_param_states_options.forEach((options, state_name) => {
    provider_value[state_name] = search_param_states[state_name];
    provider_value["set_" + state_name] = (new_state) => set_updated_search_params({[state_name]: new_state});
  });



  return (
    <UrlStateContext.Provider value={provider_value}>
      {props.children}
    </UrlStateContext.Provider>
  )
}