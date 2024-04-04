import { useState } from 'react'
import styles from './FileUpload.module.css'
import ActivityIndicator from './ActivityIndicator';


/**
 * React Component for user file upload
 * @param {object} props
 * @param {(file:File)=>Promise} props.api_request the function that should be called with the selected file, should return a Promise
 * @param {(any)=>void} props.on_successful_upload the function that is called with the succesful response of api_request
 * @param {string} [props.file_type] the file ending allowed as an upload
 * @returns {React.JSX.Element}
 */
export default function FileUpload(props) { 

  const {file_type, api_request, on_successful_upload} = props;

  const [file, set_file] = useState(undefined);
  const [upload_state, set_upload_state] = useState(null);
  const [error_text, set_error_text] = useState("");

  const handle_file_change = (event) => {
    if (event.target.files) {
      set_file(event.target.files[0]);
    }
  };

  const handle_click = () => {
    if (file && upload_state !== "uploading") {
      set_upload_state("uploading");
      api_request(file).then((response) => {
        set_upload_state("success");
        if (response) {
          on_successful_upload(response);
        }
      }).catch(e => {
        set_upload_state("error");
        set_error_text("Error: " + e);
      });
    }
  };

  return (
    <div className={styles.center_box}>
      <input
        type='file'
        accept={file_type}
        className={styles.input}
        onChange={handle_file_change}
      />
      { file &&
        <div className={styles.upload_button} onClick={handle_click}>
          {upload_state === "uploading" ? 
            <ActivityIndicator scale={0.8}/> :
            "Upload"
          }
        </div>
      }
      {
        upload_state === "success" &&
        "Successfully uploaded"
      }
      {
        upload_state === "error" &&
        <div className={styles.error_text}>
          {error_text}
        </div>
      }
    </div>
  )
}
