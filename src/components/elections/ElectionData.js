import styles from './ElectionData.module.css'
import { useEffect, useState } from "react";
import NetworkError from "../reusables/NetworkError";
import ActivityIndicator from "../reusables/ActivityIndicator";
import { get_election_details } from "../../utils/database_api";
import { capitalize_first_letter, format_number_string } from '../../utils/utils';
import Boolean from '../reusables/Boolean';


export default function ElectionData(props) {

  const {election, election_filter_properties, election_filter_properties_short_names, election_details} = props;

  const [state, set_state] = useState({
    election_details: election_details,
    election_filter_properties: election_filter_properties
  });

  const [error, set_error] = useState(false);



  useEffect(() => {
    set_error(false);

    if (!election_details || !election_filter_properties){

      let [election_details_promise, election_details_abort_controller] = get_election_details(
        election_filter_properties_short_names,
        election.ballot_type,
        {id_list: [election.id]},
      );
      
      election_details_promise.then(response => {
        if (response){
          console.log(response)
          set_state({
            election_details: response.data[election.id],
            election_filter_properties: response.metadata
          });
        }
      }).catch((e) => set_error(true))
  
      return () => {election_details_abort_controller.abort()}
    }

  }, [election, election_details, election_filter_properties]);

  return (
    error ?
    <NetworkError/> :
    ( !state.election_details || !state.election_filter_properties ?
      <ActivityIndicator/> :
      <table className={styles.table}>
        <tbody className={styles.tbody}>
          {state.election_filter_properties.map(property => {
            const property_value = state.election_details[property.short_name];
            let property_value_render;
            if (property_value != null){
              if (property.inner_type === "int" || property.inner_type === "float"){
                property_value_render = format_number_string(property_value.toFixed(2));
              } else if (property.inner_type === "bool"){
                property_value_render = <Boolean boolean_value={property_value} no_colors />;
              } else {
                property_value_render = property_value;
              }
            }
            return (
              <tr key={property.short_name} className={styles.row}>
                <td
                  className={styles.title_column}
                  data-tooltip-id={"main_tooltip"}
                  data-tooltip-content={capitalize_first_letter(property.description)}
                >
                  <div className={styles.property_title}>
                    {capitalize_first_letter(property.name) + ": "}
                  </div>
                </td>
                <td className={styles.value_column}>
                  <div
                    className={styles.value_container}
                    data-tooltip-id={"main_tooltip"}
                    data-tooltip-content={typeof(property_value) === "string" ? property_value : null}
                  >
                    {property_value_render}
                  </div>  
                </td>
              </tr>
            )
          })}
        </tbody>
      </table> 
    )
  )
}