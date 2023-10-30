import { Tooltip } from 'react-tooltip'
import styles from './HoverTooltip.module.css'

/**
 * React Component for displaying a text that shows a tooltip on mouse hover
 * @param {object} props
 * @param {React.JSX.Element[]} props.children elements to be displayed INSIDE the tooltip
 * @param {string} props.text the text that should be hoverable
 * @param {string} props.id unique id of the tooltip, needed for the tooltip library
 * @param {boolean} [props.clickable] whether the tooltip should persist when the mouse enters it, useful for buttons, default: false
 * @param {boolean} [props.disabled] can be used to disable the tooltip (temporarily), default: false
 * @param {boolean} [props.no_padding] can be used to disable the default padding of the tooltip, default: false
 * @returns {React.JSX.Element}
 */
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
