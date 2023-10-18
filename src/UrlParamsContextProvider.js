import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { clone } from './utils/utils';

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
  const initial_search_params_state = Object.fromEntries([...search_params]);

  /** State that saves the url search params as a js object */
  const [search_params_state, set_search_params_state] = useState(initial_search_params_state);
  
  useEffect(() => {
    const new_search_params = new URLSearchParams();
    Object.entries(search_params_state).forEach(([key,value]) => {
      if (value){
        new_search_params.set(key, value);
      }
    });
    set_search_params(new_search_params);
  }, [search_params_state, set_search_params]);

  /** 
   * Updater function for 'search_params_state'
   * @param {string} key name of the url search parameter
   * @param {string} value value of the url search parameter
   */
  const update_search_params_state = useCallback((key, value) => {
    set_search_params_state(old_search_params_state => {
      const new_search_params_state = clone(old_search_params_state)
      new_search_params_state[key] = value;
      return new_search_params_state;
    })
  }, [set_search_params_state])

  return (
    <UrlStateContext.Provider value={{search_params_state, update_search_params_state}}>
      {props.children}
    </UrlStateContext.Provider>
  )
}


/**
  * Custom hook for states that should be synchonized with the url.
  * Any state defined through this hook corresponds to a URL search parameter with the name 'name'
  * and will be initialized by checking the URL and if no match was found using the 'default_value'. 
  * @param {string} name name of the url search parameter
  * @param {*} default_value default value for the state if search parameter of that name is not present
  * @param {Object} context the UrlStateContext provided by the UrlParamsContextProvider
  * @param {function} [to_string] function mapping the state to a string to be used in the URL, default: JSON.stringify
  * @param {function} [from_string] function mapping the URL parameter string to the state, default: JSON.parse
 * @returns {React.JSX.Element}
 */
export function useNamedUrlState(name, default_value, context, to_string=JSON.stringify, from_string=JSON.parse) {
  const {search_params_state, update_search_params_state} = context;

  const to_string_ref = useRef(to_string)
  const from_string_ref = useRef(from_string)

  
  // define the state variable, check URL parameters, fallback to default_value
  const [state, set_state] = useState(() => {
    const param_value = search_params_state[name];
    return param_value ? from_string_ref.current(param_value) : default_value;
  });
  

  // update the url_search_params_state, whenever the state changes
  useEffect(() => {
    update_search_params_state(name, state && to_string_ref.current(state));
  }, [state, name, update_search_params_state]);



  // return the state and its set function 
  return [state, set_state];
} 