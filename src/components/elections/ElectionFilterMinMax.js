import { capitalize_first_letter, clone } from '../../utils/utils';
import styles from './ElectionFilterMinMax.module.css'
import NumberTextInput from '../reusables/NumberTextInput';


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
        data-tooltip-content={capitalize_first_letter(election_property.description)}
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




