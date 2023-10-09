import { useState } from 'react'
import styles from './FileUpload.module.css'

export default function FileUpload(props) { 


  const [file, set_file] = useState(undefined);

  const handleFileChange = (event) => {
    if (event.target.files) {
      set_file(event.target.files[0]);
    }
  };

  return (
    <div className={styles.center_box}>
      <input
        type='file'
        accept=".pb"
        className={styles.input}
        onChange={handleFileChange}
      />
      {file && 
        <div className={styles.upload_button}>
          Upload
        </div>
      }
    </div>
  )
}
