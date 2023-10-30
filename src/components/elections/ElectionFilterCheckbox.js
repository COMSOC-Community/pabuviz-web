import { useState } from 'react';
import { capitalize_first_letter, clone } from '../../utils/utils';
import styles from './ElectionFilterCheckbox.module.css'


/**
 * React Component displaying a checkbox election filter, do not use directly, use ElectionFilterList component
 * Careful: right now only supports 'positive' filters,
 * i.e. it will set the filter to true if selected, but to undefined (no filter) if not selected 
 * @param {object} props
 * @param {object} props.election_property
 * the election property (serialized ElectionDataproperty object of the django db)
 * expected to have entries for 'name', 'short_name', 'description'
 * @param {(object)=>void} props.set_election_filters
 * the setter function of the election filter state of the parent
 * @param {boolean} [props.initial_value]
 * the initial value of the filter, default: false
 * @returns {React.JSX.Element}
 */
export default function ElectionFilterCheckbox(props) { 

  const { initial_value, set_election_filters, election_property } = props;
  
  const [checked, set_checked] = useState(initial_value ? true : false);

  // if box is checked set filter to true, if unchecked to undefined (i.e., no filter)
  const toggle_filter_state = () => {
    set_election_filters((old_election_filters) => {
      let new_election_filters = clone(old_election_filters);
      new_election_filters[election_property.short_name] = !checked ? true : undefined;
      return new_election_filters;
    })

    set_checked(!checked)
  }

  return (
    <div className={styles.filter} onClick={toggle_filter_state}>
      <p  
        className={styles.filter_title}
        data-tooltip-id="main_tooltip"
        data-tooltip-content={capitalize_first_letter(election_property.description)}
      >
        {capitalize_first_letter(election_property.name)}
      </p>
      <div className={styles.checkbox_container}>
        <input 
          type="checkbox"
          checked={checked}
          readOnly={true}
          className={styles.checkbox}
        />
      </div>
    </div>
  )
}




