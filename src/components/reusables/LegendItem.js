import styles from './LegendItem.module.css'

export default function LegendItem(props) { 

  const {color, color_secondary, children, tooltip_text, tooltip_id} = props;


  return (
    <>
      <div
        className={styles.container}
        data-tooltip-id={tooltip_id || "main_tooltip"}
        data-tooltip-content={tooltip_text}
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
