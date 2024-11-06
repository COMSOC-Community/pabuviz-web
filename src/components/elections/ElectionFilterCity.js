import { ballot_types } from 'constants/constants';
import { get_election_property_values_list } from '../../utils/database_api';
import ElectionFilterSelector from './ElectionFilterSelector';
import { useContext, useEffect, useState } from 'react';
import { UrlStateContext } from 'contexts';

/**
 * React Component displaying a selection election filter, do not use directly, use ElectionFilterList component
 * @param {object} props
 * @param {object} props.election_property
 * the election property (serialized ElectionDataproperty object of the django db)
 * expected to have entries for 'name', 'short_name', 'description'
 * @param {(object)=>void} props.set_election_filters
 * the setter function of the election filter state of the parent
 * @param {Map} props.possible_values_map
 * js Map containing all possible values that can be selected
 * each entry is expected to have a 'name' and 'description' key
 * @param {string} [props.initial_key_selected]
 * the key of the initially selected value from the possible_values_map
 * @returns {React.JSX.Element}
 */
export default function ElectionFilterCity(props) { 

  const {election_property, set_election_filters} = props;
  const {ballot_type_selected} = useContext(UrlStateContext);
  

  const [city_list, set_city_list] = useState(new Map());

  useEffect(() => {
    // if (city_list.size == 0){
    let [city_list_promise, city_list_abort_controller]
      = get_election_property_values_list("unit", ballot_type_selected);
    
      city_list_promise.then(response => {
        if (response){
          var city_list_map = new Map() 
          for (var city of response.data) {
            city_list_map.set(city, {name: city});
          }
          set_city_list(city_list_map);
        }
      }).catch(() => {});

    return () => {
      city_list_abort_controller.abort();
    }
    // }
  }, [ballot_type_selected]);

  return (
    <ElectionFilterSelector
      election_property={{short_name: "unit", name: "city", inner_type:"string"}}
      initial_value={undefined}
      set_election_filters={set_election_filters}
      possible_values_map={city_list}
      max_height={170}
    />
  )
}




