import { get_ballot_type_color } from "../../utils/utils";
import LegendItem from "./LegendItem";
import styles from './ToggleLegend.module.css'


export default function ToggleLegend(props) { 

 
  const {items, visibility, set_visibility, horizontal} = props;


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
      >
        <LegendItem
          color={get_ballot_type_color(index)}
          tooltip_text={item.description}
        >
          <div className={styles.legend_text}>
            {item.name}
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
