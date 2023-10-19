import React, { createContext, useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { default_rules_visible } from './constants/constants';



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

export const UrlStateContext = createContext();

/**
 * Component managing the states that should be synchronized with the URL search parameters.
 * Wrap your main component with this and you can use the 'useNamedUrlState' hook and
 * you can access the url_params and its updater function through the UrlStateContext.
 * @example 
 * import React, { useContext } from 'react';
 * import { UrlStateContext } from 'UrlParamsContextProvider'; 
 * const {search_params_state, update_search_params_state} = useContext(UrlStateContext);
 * @returns {React.JSX.Element}
 */
export default function UrlParamsContextProvider(props) {  
  
  const [search_params, set_search_params] = useSearchParams();
  
  const [search_param_states, set_search_param_states] = useState({});

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
  

  const set_search_params_with_object = (new_search_params_obj) => {
    search_param_states_options.forEach((options, key) => {
      if(new_search_params_obj[key] !== undefined){
        const to_string = options.to_string || (x=>x);
        const new_value = to_string(new_search_params_obj[key]);
        if (new_value){
          search_params.set(key, new_value);
        } else {
          search_params.delete(key);
        }
        search_param_states_options.forEach((opt, k) => {
          if (opt.dependencies && opt.dependencies.includes(key)){
            search_params.delete(k);
          }
        }); 
      }
    });
    set_search_params(search_params);
  }

  const ballot_type_selected = search_param_states["ballot_type_selected"];
  const set_ballot_type_selected = (ballot_type) => set_search_params_with_object({"ballot_type_selected": ballot_type});
  const elections_selected = search_param_states["elections_selected"];
  const set_elections_selected = (elections_selected) => set_search_params_with_object({"elections_selected": elections_selected});
  const rule_visibility = search_param_states["rule_visibility"];
  const set_rule_visibility = (rule_visibility) => set_search_params_with_object({"rule_visibility": rule_visibility});
  
  return (
    <UrlStateContext.Provider value={{
      ballot_type_selected,
      set_ballot_type_selected,
      elections_selected,
      set_elections_selected,
      rule_visibility,
      set_rule_visibility,
      set_search_params_with_object
    }}>
      {props.children}
    </UrlStateContext.Provider>
  )
}