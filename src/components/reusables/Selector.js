import { useEffect, useMemo, useRef, useState } from 'react';
import Collapsable from './Collapsable';
import styles from './Selector.module.css'

/**
 * React Component for displaying a dropdown selection
 * @param {object} props
 * @param {Map} props.items_map
 * js Map object containing the items that can be selected
 * @param {string} props.item_selected_key key of the item currently selected
 * @param {(string)=>void} props.set_item_selected_key setter function for 'item_selected_key'
 * @param {(any)=>React.JSX.Element} props.render_item render function for an item in items_map
 * @param {boolean} [props.allow_deselect] whether an empty selection should be part of the selectable values, default: false
 * @param {boolean} [props.invert] whether the dropdown should go upwards instead, default: false
 * @returns {React.JSX.Element}
 */
export default function Selector(props) { 

  const {items_map, item_selected_key, set_item_selected_key, render_item, allow_deselect, invert} = props;


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
  

  const render_list_item = (list_item, index) => {
    if (list_item){
      const [key, item] = list_item;
      return (
        <div
          key={key}
          className={styles.item_container}
          onClick={() => {
            set_item_selected_key(key);
            set_open(false)
          }}
        >
          {render_item(key, item, index)}
        </div>
      )
    } else {
      return (
        <div
          className={styles.item_container}
          onClick={() => {
            set_item_selected_key(undefined);
            set_open(false)
          }}
        />
      )
    }
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
      <div
        className={styles.items_container}
        style={{position: 'absolute', bottom: invert ? "100%" : null, top: invert ? null : "100%"}}
      >
        <Collapsable collapsed={!open} animation_duration={200}>
          {invert && items_map && Array.from(items_map.entries()).map(render_list_item)}
          {allow_deselect && render_list_item(undefined)}
          {!invert && items_map && Array.from(items_map.entries()).map(render_list_item)}
        </Collapsable>
      </div>
      <div className={styles.items_container}>
        <div className={styles.item_container}  onClick={() => set_open(!open)}>
          {items_map && item_selected_key ? 
            render_item(item_selected_key, items_map.get(item_selected_key), item_indices_by_key[item_selected_key]) :
            <div/>
          }
          <div className={styles.indicator} style={{rotate: open ? "180deg" : "0deg"}}>
            {'⌄'}
          </div>
        </div>
      </div>
    </div>
  )
}
