import styles from './ElectionFilterList.module.css'
import ElectionFilterCheckbox from "./ElectionFilterCheckbox"
import ElectionFilterMinMax from "./ElectionFilterMinMax"
import ActivityIndicator from '../reusables/ActivityIndicator';
import ElectionFilterSelector from './ElectionFilterSelector';


export default function ElectionFilterList(props) {

  const {election_filter_properties, election_filters, set_election_filters} = props;

  const render_filter = (election_property, index) => {
    if (election_property.inner_type === 'int' || election_property.inner_type ===  'float'){
      return (
        <div className={styles.filter_container} key={election_property.short_name}>
          <ElectionFilterMinMax
            election_property={election_property}
            initial_values={election_filters[election_property.short_name]}
            set_election_filters={set_election_filters}
          />
        </div>
      )
    } else if (election_property.inner_type === 'bool'){
      return (
        <div className={styles.filter_container} key={election_property.short_name}>
          <ElectionFilterCheckbox
            election_property={election_property}
            initial_value={election_filters[election_property.short_name]}
            set_election_filters={set_election_filters}
          />
        </div>
      )
    } else if (election_property.inner_type === 'reference'){
      return (
        <div className={styles.filter_container} key={election_property.short_name}>
          <ElectionFilterSelector
            election_property={election_property}
            initial_value={election_filters[election_property.short_name]}
            set_election_filters={set_election_filters}
            possible_values_map={new Map(Object.entries(election_property.referencable_objects))}
          />
        </div>
      )
    } else {
      console.warn("Property type " + election_property.inner_type + " not supported as a filter")
      return <></>
    }
  }

  return (
    <div className={styles.filters_wrapper}>
      <p className={styles.filter_title}>
        Filter
      </p>
      <div className={styles.filters_container}>
        { election_filter_properties ? 
          election_filter_properties.map(render_filter):
          <ActivityIndicator/>
        }
      </div>
    </div>
  )
  
  
}