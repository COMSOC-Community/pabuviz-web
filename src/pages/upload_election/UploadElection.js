import styles from './UploadElection.module.css'
import { useContext, useState } from "react";
import { get_election_details, submit_pb_file } from "utils/database_api";
import FileUpload from "components/reusables/FileUpload";
import { UserDataContext } from "contexts";
import { clone } from "utils/utils";


export default function UploadElection() {
  const {user_elections, set_user_elections} = useContext(UserDataContext);
  

    const get_election_data = (election_name) => {
      let [election_details_promise, election_details_abort_controller] = get_election_details(
        null,
        null,
        {name: {equals: election_name}},
        true
      );
      election_details_promise.then(response => {
        const new_user_elections = new Map(user_elections);
        new_user_elections.set(election_name, response["data"][election_name]);
        set_user_elections(new_user_elections);
      })
    }

    return (
      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.explanation}>
            {
              "You can upload your own .pb file here. \n\nWe will try to compute some rules and properties and show them to you on the 'Compare Elections' page"
            }
          </div>
        </div>
        <div className={styles.column}>
          <FileUpload
            file_type={".pb"}
            api_request={submit_pb_file}
            on_successful_upload={response => {get_election_data(response.election_name)}}
          />
        </div>
        {/* {election && 
          <>{election.election_name}</>
        } */}
      </div>
    )
  }