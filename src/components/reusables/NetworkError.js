import styles from './NetworkError.module.css'

export default function NetworkError(props) { 

  return (
    <div className={styles.center_box}>
      <p className={styles.error_text}>
        {props.error_text || "Network Error"}
      </p>
    </div>
  )
}
