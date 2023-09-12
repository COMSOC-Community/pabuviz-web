import { Tooltip } from 'react-tooltip'
import styles from './HoverTooltip.module.css'

export default function HoverTooltip(props) { 

  const {children, text, id, clickable, disabled, no_padding} = props;


  return (
    <div className={styles.container} data-tooltip-id={"hover_tooltip"+id} data-tooltip-delay-hide={clickable ? 200 : 0}>
      <div className={props.className}>
        {text}
      </div>
      <Tooltip
        id={"hover_tooltip"+id}
        clickable={clickable}
        className={styles.children_container}
        style={{padding: no_padding ? 0 : "15px"}}
        hidden={disabled}
        positionStrategy={"fixed"}
      > 
        {children}
      </Tooltip>
    </div>
  )
}
