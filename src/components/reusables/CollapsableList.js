import { useRef, useState } from "react";
import { get_rule_color, transparentize } from "../../utils/utils";
import styles from './CollapsableList.module.css'
import Collapsable from "./Collapsable";


export default function CollapsableList(props) { 

  const children_refs = useRef(undefined)
 
  const {header_list, children_list, auto_collapse, global_toggle, initially_uncollapsed_indices} = props;

  const [collapsed, set_collapsed] = useState(
    header_list.map((header, index) => !(initially_uncollapsed_indices && initially_uncollapsed_indices.includes(index)))
  );


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
    set_collapsed(new_collapsed);
  }
  
  
  return (
    <>
      {header_list.map((header, index) => (
        <div className={styles.container} key={index}>  
          <div className={styles.header} onClick={() => on_click(index)}>
            {/* <div 
              className={styles.indicator_container}
              style={{rotate: collapsed[index] ? '0deg' : '90deg'}}
            >
              <div className={styles.indicator} style={{paddingLeft: collapsed[index] ? '3pt' : '0'}}>
                
              </div>
            </div> */}
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
            <Collapsable collapsed={collapsed[index]}>
              {children_list[index]}
            </Collapsable>
          </div>
        </div>
      ))}
    </>
  );
}
