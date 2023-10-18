import { useEffect, useRef, useState } from "react";
import styles from './Collapsable.module.css'

/**
 * React Component for displaying an animated, collapsable element, i.e. the height of the element can be toggled between
 * its child height and 0. The collapsed state is controled through the 'collapsed' prop,
 * whenever it changes, an animation is triggered. 
 * @param {object} props
 * @param {React.JSX.Element} props.children the components to be displayed inside the collapsable
 * @param {boolean} props.collapsed
 * the value controling the state of the component
 * if true, the components height will be set to 0, if false to the total height of the children
 * @param {int} [animation_duration] duration of the animation in ms, use 0 to disable animations, default: 200
 * @param {string} [initial_height]
 * css string (e.g. "100px") of the initial height of the component.
 * Only needed if you want your collabsable to be open on default.
 * This is needed, because we cannot access the children height before the first render. Default: 0.
 * @returns {React.JSX.Element}
 */
export default function Collapsable(props) { 
  
  const { children, collapsed, animation_duration = 200, initial_height = 0 } = props;
  
  const [child_height, set_child_height] = useState(initial_height);
  const [contain, set_contain] = useState(collapsed ? 'paint' : 'none');
  
  const child_container_ref = useRef(undefined)
  const height_controller_ref = useRef(undefined)
    

  useEffect(() => {
    const resize_ref = child_container_ref.current;
    if (resize_ref){
      const resizeObserver = new ResizeObserver(() => {
        set_child_height(resize_ref.scrollHeight);
      });
      resizeObserver.observe(resize_ref);
      
      return () => {
        resizeObserver.disconnect();
      }
    }
  }, []);


  useEffect(() => {
    if (!collapsed){
      setTimeout(() => set_contain('none'), animation_duration);
    } else {
      set_contain('paint');
    }
  }, [collapsed, animation_duration]);


  return (
    <div
      className={styles.collapsable}
      ref={height_controller_ref}
      style={{
        transitionDuration: animation_duration != null && animation_duration.toString() + "ms",
        height: collapsed ? 0 : child_height,
        contain: contain
      }}
    >
      <div ref={child_container_ref}>
        {children}
      </div>
    </div>
  );
}
