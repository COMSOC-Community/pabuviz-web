import styles from './ActivityIndicator.module.css'
import pb_svg from "assets/PB.svg";

/**
  * React Component for displaying a custom activity indicator
 * @returns {React.JSX.Element}
 */
export default function ActivityIndicator(props) { 
  const {simple, scale} = props;
  if (simple){
    return (
      <div className={styles.center_box} style={{transform: `scale(${scale || 1}` }}>
        <div className={styles.spinner}>
          <h1>PB</h1>
        </div>
      </div>
    )
  } else {
    return (
      <div className={styles.center_box} style={{transform: `scale(${scale || 1}` }}>
        <div className={styles.coin}>
          <article className={styles.back}>
            <img src={pb_svg} alt="" className={styles.pb_logo}/>
          </article>
  
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          <article className={styles.middle}></article>
          
          <article className={styles.front}>
            <img src={pb_svg} alt="" className={styles.pb_logo}/>
          </article>
          
          
          {/* <div className={styles.head}/>
          <div className={styles.tails}/> */}
          {/* <h1>PB</h1> */}
        </div>
      </div>
    )
  }
}
