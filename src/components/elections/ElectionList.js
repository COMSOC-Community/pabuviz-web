import { clone, format_number_string } from '../../utils/utils';
import styles from './ElectionList.module.css'
import { useState, useEffect, useRef } from 'react';
import { get_elections, get_election_properties, get_election_details } from '../../utils/database_api';
import ActivityIndicator from '../reusables/ActivityIndicator';
import NetworkError from '../reusables/NetworkError';
import HoverTooltip from '../reusables/HoverTooltip';
import ElectionData from './ElectionData';
import ElectionFilterList from './ElectionFilterList';


const election_filter_properties_short_names = [
  'num_projects',
  'num_votes',
  'budget',
  'avg_ballot_len',
  'avg_ballot_cost',
  'fund_scarc',
  'avg_proj_cost',
  'has_categories',
  'has_targets',
  'has_neighborhoods',
  'has_voting_methods',
  'rule',
]

const filter_elections_by_search_text = (elections, search_text) => {
  const search_texts = search_text.toLowerCase().split(' ');

  let filtered_elections = elections.filter(election => {
    for (const text of search_texts) {
      let found = false;
      if (text.length === 0)
        continue;
      for (const key of ['country', 'unit', 'subunit']){
        if (election[key].toLowerCase().includes(text)){
          found = true;
          break;
        }
      }
      if (!found 
          && !new Date(election['date_begin']).getFullYear().toString().includes(text)
          && !new Date(election['date_begin']).getFullYear().toString().includes(text)){
        return false;
      }
    }
    return true;
  });
  return filtered_elections;
}

const sort_elections = (elections, sorting) => {
  const {primary, secondary} = sorting;

  return elections.sort((e1, e2) => {
    const [e1_prim, e1_sec] = [e1[primary.field_name], e1[secondary.field_name]]
    const [e2_prim, e2_sec] = [e2[primary.field_name], e2[secondary.field_name]]

    const comp_prim = (+(e1_prim > e2_prim) || +(e1_prim === e2_prim) - 1);
    const comp_sec = (+(e1_sec > e2_sec) || +(e1_sec === e2_sec) - 1);
    return (primary.ascending ? comp_prim : -comp_prim) || (secondary.ascending ? comp_sec : -comp_sec);
  });
}


export default function ElectionList(props) { 
  const {ballot_type, elections_selected, set_elections_selected, max_selected, initial_election_filters} = props;

  const [elections, set_elections] =  useState(undefined);
  const [election_details, set_election_details] =  useState(undefined);
  const [elections_filtered, set_elections_filtered] =  useState(new Map());

  const [election_filter_properties, set_election_filter_properties] =  useState(undefined);
  const [election_filters, set_election_filters] = useState(initial_election_filters || {});

  const [search_text, set_search_text] =  useState("");
  const [sorting, set_sorting] =  useState({primary: {field_name: "date_begin", ascending: false}, secondary: {field_name: "name", ascending: true}});

  const scroll_ref = useRef(undefined)
  const [num_elections_rendered, set_num_elections_rendered] = useState(50);
  
  const [error, set_error] = useState(false);


  useEffect(() => {
    if (ballot_type){
      let [election_filter_properties_promise, election_filter_properties_abort_controller]
        = get_election_properties(election_filter_properties_short_names, ballot_type);
  
      let [election_details_promise, election_details_abort_controller]
        = get_election_details(election_filter_properties_short_names, ballot_type, {});
      
      election_filter_properties_promise.then((election_filter_properties_response) => {
        if (election_filter_properties_response){
          set_election_filter_properties(election_filter_properties_response.data);
        }
      }).catch(() => set_error(true));
  
      election_details_promise.then((election_details_response) => {
        if (election_details_response){
          set_election_details(election_details_response.data);
        }
      }).catch(() => set_error(true));
  
  
      return () => {
        election_filter_properties_abort_controller.abort();
        election_details_abort_controller.abort();
      }
    }

  }, [ballot_type]);


  useEffect(() => {
    reset_scroll();
    set_error(false);
    let [election_promise, election_abort_controller] = get_elections({...election_filters, ballot_type: ballot_type});

    election_promise.then(elections_response => {
      if (elections_response){
        set_elections(elections_response.data);
      }
    }).catch(() => set_error(true));
    
    return () => {
      election_abort_controller.abort();
    };
  }, [election_filters, ballot_type]);


  useEffect(() => {
    reset_scroll();
    if (elections) {
      let new_election = [...elections]
      if (search_text.length > 0){
        set_elections_filtered(
          sort_elections(
            filter_elections_by_search_text(new_election, search_text), sorting
          )
        );
      } else {
        set_elections_filtered(
          sort_elections(new_election, sorting)
        );
      }
    } else {
      set_elections_filtered([]);
    }
  }, [elections, search_text, sorting]);


  const on_search_text_change = (new_search_text) => {
    set_search_text(new_search_text);
  }

  const on_election_click = (election) => {
    let new_elections_selected = new Map(elections_selected);

    if (new_elections_selected.has(election.name)){
      new_elections_selected.delete(election.name);
    } else {
      if (!max_selected || new_elections_selected.size < max_selected){
        new_elections_selected.set(election.name, election);
      } else {
        return;
      }
    }
    set_elections_selected(new_elections_selected);
  }

  const on_header_click = (field_name) => {
    let new_sorting = clone(sorting);
    if (new_sorting.primary.field_name === field_name){
      new_sorting.primary.ascending = !new_sorting.primary.ascending;
    } else {
      new_sorting = {
        primary: {
          field_name: field_name,
          ascending: true
        },
        secondary: new_sorting.primary
      }
    }
    set_sorting(new_sorting);
  }


  const on_scroll = () => {
    if (elections && elections.length > num_elections_rendered){
      const dist_to_bottom = scroll_ref.current.scrollHeight - (scroll_ref.current.scrollTop + scroll_ref.current.clientHeight);
      if(dist_to_bottom < 500){
        set_num_elections_rendered(num_elections_rendered + 25);
      }
    }
  }

  const reset_scroll = () => {
    set_num_elections_rendered(50);
    scroll_ref.current.scrollTop = 0;
  }


  const render_election_headers = () => {
    
    const render_election_header = (title, width, alignment, sort_field_name) => {
      let text = title;
      if (sorting.primary.field_name === sort_field_name){
        text = text + " " + (sorting.primary.ascending ? "↓" : "↑");
      }
      return (
        <div
          className={styles.election_header}
          style={{width: width, textAlign: alignment}}
          onClick={() => on_header_click(sort_field_name)}
        >
          {text}
        </div>
      );
    }
    
    return (
      <div 
        className={styles.election_container}
        // onClick={() => on_election_click(election)}
        style={{borderBottomWidth: "2px", borderTopWidth: "0px"}}
      >
        <div 
          className={styles.check_box}
        />
        {render_election_header("Country",    "8em",  "center", "country")}
        {render_election_header("City",       "9em",  "center", "unit")}
        {render_election_header("Unit",       "18em", "center", "subunit")}
        {render_election_header("Year",       "3em",  "center", "date_begin")}
        {render_election_header("# projects", "6em",  "right",  "num_projects")}
        {render_election_header("# votes",    "5em",  "right",  "num_votes")}
        <div className={styles.election_info_symbol}/>
      </div>
    )
  }


  const render_election = (election, index) => {
    
    const render_election_item = (title, width, alignment) => (
      <p style={{width: width, textAlign: alignment}}>
        {title}
      </p>
    )
    let year_text = new Date(election.date_begin).getFullYear()
    const year_end = new Date(election.date_end).getFullYear()
    
    if (year_end !== year_text){
      year_text = year_text + " - " + year_end
    }

    return (
      <div 
        className={styles.election_container}
        key={election.name}
        onClick={() => on_election_click(election)}
        style={{borderTopWidth: index && "1px"}}
      >
        <input 
          type="checkbox"
          checked={elections_selected.has(election.name)}
          readOnly={true}
          className={styles.check_box}
        />
        {render_election_item(election.country, "8em",  "center")}
        {render_election_item(election.unit,    "9em",  "center")}
        {render_election_item(election.subunit, "18em", "center")}
        {render_election_item(year_text,        "3em",  "center")}
        {render_election_item(format_number_string(election.num_projects), "6em", "right")}
        {render_election_item(format_number_string(election.num_votes),    "5em", "right")}
        <HoverTooltip
          id={election.name + "_details"}
          text={"ⓘ"}
          className={styles.election_info_symbol}
          disabled={false}
          no_padding
        >
          {!election_filter_properties || !election_details ?
            <ActivityIndicator/> :
            <ElectionData
              election={election}
              election_filter_properties={election_filter_properties}
              election_details={election_details[election.name]}
            />
          }
        </HoverTooltip>
      </div>
    )
  }



  
  return (
    <div className={styles.wrapper}>
      { error ?
        <NetworkError/> :
        <ElectionFilterList 
          election_filter_properties={election_filter_properties}
          election_filters={election_filters}
          set_election_filters={set_election_filters}
        />
      }
      <div className={styles.vertical_separator}/>
      <div className={styles.search_list_container}>
        <div className={styles.search_container}>
          <input 
            className={styles.search_text_input}
            value={search_text}
            placeholder={"Search election"}
            onChange={(event) => on_search_text_change(event.target.value)}
          />
          <p className={styles.results_info_text}>
            {elections_filtered.length + " results"}
          </p>
        </div>
        <div className={styles.lists_container}>
          {render_election_headers()}
          <div className={styles.horizontal_separator}/>
          <div className={styles.election_list_container} ref={scroll_ref} onScroll={on_scroll}>
            { error ?
              <NetworkError/> :
              ( elections ? 
                elections_filtered.slice(0, num_elections_rendered).map(render_election) :
                <ActivityIndicator/>
              )
            }
          </div>
          {elections_selected.size === 0 || <div className={styles.horizontal_separator}/>}
          <div className={styles.selected_list_container}>
            {Array.from(elections_selected).map(([name, election], index) => render_election(election, index))}
          </div>
        </div>
      </div>
    </div>
  )
}
