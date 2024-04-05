import ElectionFilterCheckbox from "./ElectionFilterCheckbox"
import ElectionFilterMinMax from "./ElectionFilterMinMax"
import ElectionFilterSelector from './ElectionFilterSelector';
import ActivityIndicator from '../reusables/ActivityIndicator';
import styles from './ElectionFilterList.module.css'


/**
 * React Component displaying a list of election filters, given a list of election properties
 * @param {object} props
 * @param {object} props.election_filter_properties
 * the election properties (serialized ElectionDataproperty objects of the django db)
 * Each is expected to have entries for 'name', 'short_name', 'description',
 * 'inner_type', and 'referencable_objects' if 'inner_type' is set to "refernece"
 * @param {object} props.election_filters
 * the state object in which the current filters are stored using their short_name as key
 * this corresponds to the format that the database api expects as the filters argument
 * depending on the 'inner_type' of a filter property this will look different:
 *    'int' and 'float':  an object with keys 'min' and/or 'max'
 *    'bool':             a boolean
 *    'string':           an object with key 'contains' or 'equals'
 *    'reference':        a string containing the name of the referenced object
 *    'date' is not supported yet
 * @param {(object)=>void} props.set_election_filters
 * the setter function of the election_filters
 * @returns {React.JSX.Element}
 */
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
        Filters
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