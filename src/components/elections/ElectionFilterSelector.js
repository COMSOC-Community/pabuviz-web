import { capitalize_first_letter, clone } from '../../utils/utils';
import Selector from '../reusables/Selector';
import styles from './ElectionFilterSelector.module.css'
import { useState } from 'react';


export default function ElectionFilterSelector(props) { 

  const { initial_key_selected, set_election_filters, election_property, possible_values_map } = props;
  
  const [key_selected, set_key_selected] = useState(initial_key_selected);
  // if box is checked set filter to true, if unchecked to undefined (i.e., no filter)
  const set_filter = (key) => {
    set_election_filters((old_election_filters) => {
      let new_election_filters = clone(old_election_filters);
      new_election_filters[election_property.short_name] = key;
      return new_election_filters;
    })
    set_key_selected(key);
  }

  return (
    <div className={styles.filter}>
      <p  
        className={styles.filter_title}
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




