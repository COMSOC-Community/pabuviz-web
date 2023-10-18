import styles from './ActivityIndicator.module.css'

/**
  * React Component for displaying a custom activity indicator
 * @returns {React.JSX.Element}
 */
export default function ActivityIndicator(props) { 
  return (
    <div className={styles.center_box}>
      <div className={styles.spinner}>
        <h1>PB</h1>
      </div>
    </div>
  )
}
