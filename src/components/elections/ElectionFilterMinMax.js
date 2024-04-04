import NumberTextInput from '../reusables/NumberTextInput';
import { capitalize_first_letter, clone } from '../../utils/utils';
import styles from './ElectionFilterMinMax.module.css'

/**
 * React Component displaying a minimum and maximum value election filter, do not use directly, use ElectionFilterList component
 * @param {object} props
 * @param {object} props.election_property
 * the election property (serialized ElectionDataproperty object of the django db)
 * expected to have entries for 'name', 'short_name', 'description'
 * @param {(object)=>void} props.set_election_filters
 * the setter function of the election filter state of the parent
 * @param {object} [props.initial_values]
 * the initial values of the filter, should be an object with a 'min' and a 'max' key, default: null
 * @returns {React.JSX.Element}
 */
export default function ElectionFilterMinMax(props) { 

  const { initial_values, set_election_filters, election_property } = props;
  
  
  const update_filter_state = (key, value) => {
    set_election_filters((old_election_filters) => {
      let new_election_filters = clone(old_election_filters);
      if (!new_election_filters[election_property.short_name]){
        new_election_filters[election_property.short_name] = {}
      }
      new_election_filters[election_property.short_name][key] = value;
      return new_election_filters;
    })
  }

  
  return (
    <div className={styles.filter}>
      <p
        className={styles.filter_title}
        data-tooltip-id="main_tooltip"
        data-tooltip-content={capitalize_first_letter(election_property.description || election_property.name)}
      >
        {capitalize_first_letter(election_property.name)}
      </p>
      <div className={styles.range}>
        <div className={styles.input_container}>
          <NumberTextInput
            initial_value={initial_values ? initial_values.min : null}
            set_value={(value) => {update_filter_state("min", value)}}
            placeholder={"min"}
            type={election_property.inner_type}
          />
        </div>
        <div className={styles.range_separator}>
          {"-"}
        </div>
        <div className={styles.input_container}>
          <NumberTextInput
              initial_value={initial_values ? initial_values.max : null}
              set_value={(value) => {update_filter_state("max", value)}}
              placeholder={"max"}
              type={election_property.inner_type}
            />
        </div>
      </div>
    </div>
  )
}




