import styles from './NetworkError.module.css'

/**
 * React Component for displaying an error text in the center of the parent element
 * This component is usually conditionally displayed instead of another one
 * @param {object} props
 * @param {string} [props.error_text] error message, defaults to "Network Error"
 * @returns {React.JSX.Element}
 */
export default function NetworkError(props) { 

  return (
    <div className={styles.center_box}>
      <p className={styles.error_text}>
        {props.error_text || "Network Error"}
      </p>
    </div>
  )
}
