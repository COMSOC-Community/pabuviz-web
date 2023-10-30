import { useRef, useState } from "react";
import Collapsable from "./Collapsable";
import styles from './CollapsableList.module.css'

const animation_duration = 300;

/**
 * React Component for displaying a list of collapsables, each with a clickable header as a toggle
 * @param {object} props
 * @param {React.JSX.Element[]} props.header_list array of headers to be displayed
 * @param {React.JSX.Element[]} props.children_list array of elements that should be displayed in a collapsable each
 * @param {int[]} [props.initially_uncollapsed_indices] array of indices that should be expanded by default, default: none
 * @param {boolean} [props.auto_collapse] whether on expansion of one collapsable, all the others should collapse, default: false
 * @param {boolean} [props.global_toggle] whether expansion and collapsing of the collabsables should be synchronized, default: false
 * @returns {React.JSX.Element}
 */
export default function CollapsableList(props) { 

  const children_refs = useRef(undefined)
 
  const {header_list, children_list, auto_collapse, global_toggle, initially_uncollapsed_indices} = props;

  const [collapsed, set_collapsed] = useState(
    header_list.map((header, index) => !(initially_uncollapsed_indices && initially_uncollapsed_indices.includes(index)))
  );

  const [animate, set_animate] = useState(false)

  const get_ref_map = () => {
    if (!children_refs.current) {
      children_refs.current = new Map();
    }
    return children_refs.current;
  }

  const on_click = (header_index) => {
    let new_collapsed;
    if (global_toggle){
      new_collapsed = header_list.map((header, index) => (!collapsed[header_index]));
    } else if (auto_collapse){
      new_collapsed = header_list.map((header, index) => (index === header_index ? !collapsed[index] : true));
    } else {

      new_collapsed = [...collapsed];
      new_collapsed[header_index] = !new_collapsed[header_index];
    }
    set_animate(true);
    set_collapsed(new_collapsed);
    setTimeout(() => set_animate(false), animation_duration);
  }
  
  
  return (
    <>
      {header_list.map((header, index) => (
        <div className={styles.container} key={index}>  
          <div className={styles.header} onClick={() => on_click(index)}>
            {header}
            <div className={styles.indicator} style={{rotate: collapsed[index] ? "0deg" : "180deg"}}>
              {children_list[index] ? '▾' : ''}
            </div>
          </div>
          <div 
            className={styles.children_container}
            ref={(node) => {
              const map = get_ref_map();
              if (node) {
                map.set(header.key, node);
              } else {
                map.delete(header.key);
              }
            }}
          >
            <Collapsable
              collapsed={collapsed[index]}
              animation_duration={animate ? animation_duration : 0}
            >
              {children_list[index]}
            </Collapsable>
          </div>
        </div>
      ))}
    </>
  );
}
