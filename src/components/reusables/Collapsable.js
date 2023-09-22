import { useEffect, useRef, useState } from "react";
import styles from './Collapsable.module.css'

export default function Collapsable(props) { 
  
  const { children, collapsed, animation_duration, initial_height } = props;
  
  const [child_height, set_child_height] = useState(initial_height ? initial_height : 0);
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
        transitionDuration: animation_duration && animation_duration.toString() + "ms",
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
