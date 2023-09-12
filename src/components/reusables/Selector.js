import styles from './Selector.module.css'
import { useEffect, useMemo, useRef, useState } from 'react';
import Collapsable from './Collapsable';


export default function Selector(props) { 

  const {items_map, item_selected_key, set_item_selected_key, render_item} = props;


  const [open, set_open] = useState(false);
  const ref = useRef(undefined)


  useEffect(() => {

    const on_click_anywhere = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        set_open(false);
      }
    }

    document.addEventListener("mousedown", on_click_anywhere);
    
    return () => {
      document.removeEventListener("mousedown", on_click_anywhere);
    };
  }, [ref]);
  

  const render_list_item = ([key, item], index) => {
    return (
      <div
        key={key}
        className={styles.item_container}
        onClick={() => {
          set_item_selected_key(key);
          set_open(false)
        }}
      >
        {render_item(item, index)}
      </div>
    )
  }

    
  const item_indices_by_key = useMemo(() => {
    if (items_map){
      const indices_by_key = {}
      Array.from(items_map.entries()).forEach(([key, item], index)=> {
        indices_by_key[key] = index;
      });
      return indices_by_key;
    }
  }, [items_map])


  return (
    <div className={styles.container} ref={ref}>
      <div className={styles.items_container}>
        <Collapsable collapsed={!open} animation_duration={".1s"}>
          {items_map && 
            Array.from(items_map.entries()).map(render_list_item)}
        </Collapsable>
      </div>
      <div className={styles.items_container}>
        <div className={styles.item_container}  onClick={() => set_open(!open)}>
          {items_map && item_selected_key && 
            render_item(items_map.get(item_selected_key), item_indices_by_key[item_selected_key])
          }
          <div className={styles.indicator} style={{rotate: open ? "180deg" : "0deg"}}>
            {'⌄'}
          </div>
        </div>
      </div>
    </div>
  )
}
