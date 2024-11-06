import styles from './UploadElection.module.css'
import { useContext } from "react";
import { get_election_details, submit_pb_file } from "utils/database_api";
import FileUpload from "components/reusables/FileUpload";
import { UrlStateContext, UserDataContext } from "contexts";
import { useNavigate } from "react-router-dom";


export default function UploadElection() {
  const {user_elections, set_user_elections} = useContext(UserDataContext);
  const navigate = useNavigate(); 
  const {get_url_navigation_string} = useContext(UrlStateContext);


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

    const render_user_elections = () => {
      return Array.from(user_elections).map(([name, election], index) => {
        var election_name = ""
        election_name += (election.country ? election.country + ", ": "")
        election_name += (election.unit ? election.unit + ", ": "")
        election_name += (election.subunit ? election.subunit + ", ": "")
        election_name += (election.instance ? election.instance + ", ": "")
        
        var election_text = ""
        election_text += (election.num_votes + " voters, ")
        election_text += (election.num_projects + " projects, ")
        election_text += (election.ballot_type + " ballots.")
        
        return (
          <div 
            key={name}
            className={styles.election_container} 
            onClick={() => {
              navigate(get_url_navigation_string('/compare_elections', {
                ballot_type_selected: election.ballot_type,
                elections_selected: [{name: name, user_submitted: true}]
              }));
            }}
          >
            <div className={styles.election_property_container}> 
              {election_name}
            </div>
            <div className={styles.election_property_container}> 
              {election_text}
            </div>
          </div>
        )
      })
    }

    return (
      <div className={styles.page_container}>
        <div className={styles.header_box}>
          <h1 className={styles.title_text}>
            Upload Election
          </h1>
          <div className={styles.info_text}>
            <p>You can upload your own .pb file here. </p>
            <p>We will try to compute some rules and properties and visualize them on the 'Election Level' page.</p>
            {/* <p>Computations can take some time.</p> */}
          </div>
        </div>
        <div className={styles.upload_container}>
          <FileUpload
            file_type={".pb"}
            api_request={submit_pb_file}
            on_successful_upload={response => {get_election_data(response.election_name)}}
          />
        </div>
        <div className={styles.data_container}>
          {user_elections && user_elections.size > 0 &&
            <>
              <div className={styles.info_text}>
                Click one of your elections, to see the results:
              </div>
              <div className={styles.elections_container}>
                {render_user_elections()}
              </div>
            </>
          }
        </div>
          
      </div>
    )
  }