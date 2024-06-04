import styles from './LegendItem.module.css'

/**
 * React Component for displaying a text with a colored box next to it (as part of a legend)
 * Requires a react-tooltip Tooltip with tooltip_id to be defined somewhere up in the component tree
 * @param {object} props
 * @param {string} props.color hex string, color of the colored box
 * @param {string} [props.color_secondary]
 * hex string, secondary color of the box
 * if given the box will have a linear gradient from color to secondary_color
 * @param {React.JSX.Element[]} props.children elements to be contained next to the colored box
 * @returns {React.JSX.Element}
 */
export default function LegendItem(props) { 

  const {color, color_secondary, children, tooltip_text, tooltip_id} = props;


  return (
    <>
      <div
        className={styles.container}
      >
        <div
          className={styles.color_box_frame}
          style={{
            // backgroundColor: color,
            background: "linear-gradient(150deg, " + color + ", " + (color_secondary ? color_secondary : color) + ")",
          }}
        >
          <div 
            className={styles.color_box}
          />
        </div>
        {children}
      </div>
    </>
  )
}
