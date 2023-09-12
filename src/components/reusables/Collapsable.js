import { useEffect, useRef, useState } from "react";
import styles from './Collapsable.module.css'

export default function Collapsable(props) { 
  
  const { children, collapsed, animation_duration } = props;
  
  const [child_height, set_child_height] = useState(0);
  
  const child_container_ref = useRef(undefined)
  
  useEffect(() => {
    if (child_container_ref.current){
      set_child_height(child_container_ref.current.scrollHeight);
    }
  }, [children]);
    

  return (
    <div className={styles.collapsable} style={{maxHeight: collapsed ? 0 : child_height, transitionDuration: animation_duration}}>
      <div className={styles.child_container} ref={child_container_ref}>
        {children}
      </div>
    </div>
  );
}
