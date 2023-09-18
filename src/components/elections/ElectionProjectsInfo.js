import styles from './ElectionProjectsInfo.module.css'
import { useEffect, useState } from "react";
import NetworkError from "../reusables/NetworkError";
import ActivityIndicator from "../reusables/ActivityIndicator";
import { get_projects } from "../../utils/database_api";
import LegendItem from "../reusables/LegendItem";
import { clone, format_number_string } from '../../utils/utils';
import Boolean from '../reusables/Boolean';
import ElectionData from './ElectionData';


const election_filter_properties_short_names = [
  "name",
  "budget",
  "num_projects",
  // "has_categories",
  // "has_targets",
  "sum_proj_cost",
  "avg_proj_cost",
  "med_proj_cost",
  "sd_proj_cost"
]


export default function ElectionProjectsInfo(props) {

  const {election, rules, visibility} = props;

  const [projects, set_projects] = useState(null);

  const [sorting, set_sorting] = useState({field: "name", ascending: true});

  const [error, set_error] = useState(false);


  useEffect(() => {
    set_error(false);
    let [projects_promise, projects_abort_controller] = get_projects(
      election.id,
    );
    
    projects_promise.then(response => {
      if (response){
        const project_data = response.data;
        const rule_results_existing = response.metadata.rule_results_existing;
        
        project_data.forEach(project => {
          rule_results_existing.forEach(rule => {
            project[rule.abbreviation] = project.rules_selected_by.includes(rule.abbreviation);
          });
        });
        set_projects(project_data);
        
      }
    }).catch((e) => console.log(e))


    return () => {projects_abort_controller.abort()}

  }, [election]);


  useEffect(() => {
    set_projects(old_projects => {
      if (old_projects){
        let projects_sorted = clone(old_projects);
        projects_sorted = projects_sorted.sort((p1, p2) => (
          sorting.ascending ?
            p1[sorting.field] > p2[sorting.field] :
            p1[sorting.field] < p2[sorting.field]
        ));
        return projects_sorted;
      } else {
        return null;
      }
    });
  }, [sorting])


  const set_new_sorting = (field, default_ascending) => {
    const ascending = sorting.field === field ? !sorting.ascending : default_ascending;
    set_sorting({field, ascending})
  }


  const render_project_header_text = (text, column_field) => {
    if (sorting.field === column_field){
      return text + "\u00A0" + (sorting.ascending ? "↓" : "↑");
    }
    return text;
  }


  const render_project_rule_selected = (project, rule) => {
    const selected = project[rule.abbreviation];
    return (
      <td key={rule.abbreviation} style={{textAlign: 'center', width: "60px", boxSizing: "border-box", flexShrink: 0, fontSize: "x-large"}}> 
        <Boolean
          boolean_value={selected}
        />
      </td>
    );
    
  }


  let rules_visible;
  if (rules && visibility){
    rules_visible = rules.filter(rule => visibility[rule.abbreviation]);
  }




  return (
    error ?
    <NetworkError/> :
    ( !projects ?
      <ActivityIndicator/> :
      <div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.table_header_row}>
              <th style={{flex: 1}}>
                <div className={styles.table_headers_with_details}>
                  <div className={styles.election_data_container}>
                    <ElectionData
                      election={election}
                      election_filter_properties_short_names={election_filter_properties_short_names}
                    />
                  </div>
                  <div className={styles.table_headers_non_rule}>
                    <div 
                      className={styles.project_name_column}
                      style={{textAlign: "center"}} 
                      onClick={() => set_new_sorting("name", true)}
                    > 
                      {render_project_header_text("Project Name", "name")}
                    </div>
                    <div
                      className={styles.project_cost_column}
                      style={{textAlign: "center"}} 
                      onClick={() => set_new_sorting("cost", true)}
                    >
                      {render_project_header_text("Cost", "cost")}
                    </div>
                  </div>
                </div>
              </th>
              <>
                {rules_visible.map(rule => (
                  <th key={rule.abbreviation} style={{width: "60px", flexShrink: 0, boxSizing: "border-box"}}>
                    <div className={styles.center_header}>
                      <div className={styles.center_header_zero_width}>
                        <div className={styles.header_rotator} style={{rotate: "-45deg", translate: "-2px 10px"}}>
                          <div 
                            className={styles.legend_item_container}
                            onClick={() => set_new_sorting(rule.abbreviation, false)}
                          >
                            <LegendItem color={rule.color}>
                              {render_project_header_text(rule.name, rule.abbreviation)}
                            </LegendItem>
                          </div>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.name} className={styles.project_row}>
                <td className={styles.project_name_column} style={{display: "flex"}}>
                  <div
                    className={styles.project_name}
                    data-tooltip-id={"main_tooltip"}
                    data-tooltip-content={project.name}
                  >
                    {project.name}
                  </div>
                </td>
                <td className={styles.project_cost_column}>
                  {format_number_string(project.cost.toFixed(2))}
                </td>
                {rules_visible.map(rule => (
                  render_project_rule_selected(project, rule)
                ))}
              </tr>
            ))}
          </tbody>
        </table> 
      </div>
    )
  )
}