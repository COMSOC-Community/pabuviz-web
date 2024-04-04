import LegendItem from "./LegendItem";
import { capitalize_first_letter, get_ballot_type_color } from "../../utils/utils";
import styles from './ToggleLegend.module.css'
import HoverTooltip from "./HoverTooltip";

/**
 * React Component showing a list of toggleable legend items (see LegendItem)
 * Requires a react-tooltip Tooltip with tooltip_id to be defined somewhere up in the component tree
 * @param {object} props
 * @param {object[]} props.items
 * array of objects to be displayed as a legend
 * each item is expected to have a 'name' and a 'description'
 * @param {boolean[]} props.visibility
 * array of booleans indicating the current toggle state of each item
 * this will usually be a state variable of the parent component 
 * @param {(boolean[])=>void} props.set_visibility setter function for 'visibility'
 * @param {string} props.tooltip_id id of the react tooltip Tooltip component
 * @param {boolean} [props.horizontal] whether the legend items should be arranged horizontally, default: false
 * @returns {React.JSX.Element}
 */
export default function ToggleLegend(props) { 

  const {items, visibility, set_visibility, horizontal, tooltip_id} = props;


  const on_item_click = (index) => {
    let visibility_updated = [...visibility];
    visibility_updated[index] = !visibility_updated[index]
    set_visibility(visibility_updated)
  }


  let item_renders = items.map((item, index) => {
    return (
      <div
        className={styles.legend_item}
        style={{opacity: visibility[index] ? 1 : 0.4}}
        key={item.name}
        onClick={() => on_item_click(index)}
        data-tooltip-id={tooltip_id}
        data-tooltip-content={capitalize_first_letter(item.description)}
      >
        <LegendItem
          color={get_ballot_type_color(index)}
        >
          <div className={styles.legend_text}>
            {capitalize_first_letter(item.name)}
          </div>
        </LegendItem>
      </div>
    )
  })
  
  return (
    <div className={horizontal ? styles.legend_horizontal : styles.legend_vertical}>
        {item_renders}
    </div>
  )
}
