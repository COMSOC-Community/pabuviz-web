import { capitalize_first_letter, clone } from '../../utils/utils';
import Selector from '../reusables/Selector';
import styles from './ElectionFilterSelector.module.css'
import { useState } from 'react';

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
export default function ElectionFilterSelector(props) { 

  const { initial_key_selected, set_election_filters, election_property, possible_values_map, max_height } = props;
  
  const [key_selected, set_key_selected] = useState(initial_key_selected);
  const set_filter = (key) => {
    set_election_filters((old_election_filters) => {
      let new_election_filters = clone(old_election_filters);
      if (election_property.inner_type === "reference"){
        new_election_filters[election_property.short_name] = key;
      } else if (election_property.inner_type === "string"){
        new_election_filters[election_property.short_name] = {"equals": key};
      }
      return new_election_filters;
    })

    set_key_selected(key);
  }

  return (
    <div className={styles.filter}>
      <p  
        className={election_property.description ? styles.filter_title_tooltip : styles.filter_title}
        data-tooltip-id="main_tooltip"
        data-tooltip-content={capitalize_first_letter(election_property.description)}
      >
        {capitalize_first_letter(election_property.name)}
      </p>
      <div className={styles.selector_container}>
        <Selector
          items_map={possible_values_map}
          item_selected_key={key_selected}
          allow_deselect={true}
          max_height={max_height}
          set_item_selected_key={set_filter}
          render_item={(key, value, index) => {
            return (
              <div key={key} className={styles.option_container}>
                <div
                  data-tooltip-id={"main_tooltip"}
                  data-tooltip-content={value.description}
                  className={styles.selector_item}
                >
                  {capitalize_first_letter(value.name)}
                </div>
              </div>
          )}}
        />
      </div>
    </div>
  )
}




