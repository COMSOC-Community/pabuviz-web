import styles from './ElectionProjectsInfo.module.css'
import { useEffect, useState } from "react";
import NetworkError from "../reusables/NetworkError";
import ActivityIndicator from "../reusables/ActivityIndicator";
import { get_projects } from "../../utils/database_api";
import LegendItem from "../reusables/LegendItem";
import { clone, format_number_string } from '../../utils/utils';
import Boolean from '../reusables/Boolean';


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
    if (projects){
      let projects_sorted = clone(projects);
      projects_sorted = projects_sorted.sort((p1, p2) => (
        sorting.ascending ?
          p1[sorting.field] > p2[sorting.field] :
          p1[sorting.field] < p2[sorting.field]
      ));
      set_projects(projects_sorted);
    }
  }, [sorting, projects])


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
      <td key={rule.abbreviation} style={{textAlign: 'center', width: "60px", flexShrink: 0, fontSize: "x-large"}}> 
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
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              onClick={() => set_new_sorting("name", true)}
              style={{flex: 1}}
            >
              {render_project_header_text("Project Name", "name")}
            </th>
            <th
              onClick={() => set_new_sorting("cost", true)}
              style={{width: "90px"}}
            >
              {render_project_header_text("Cost", "cost")}
            </th>
            <>
              {rules_visible.map(rule => (
                <th className={styles.rule_header} key={rule.abbreviation} style={{width: "60px"}}>
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
              <td className={styles.project_item} style={{textAlign: "left", flex: 1}}>
                {project.name}
              </td>
              <td className={styles.project_item} style={{textAlign: "right", width: "90px", marginRight: "10px"}}>
                {format_number_string(project.cost.toFixed(2))}
              </td>
              {rules_visible.map(rule => (
                render_project_rule_selected(project, rule)
              ))}
            </tr>
          ))}
        </tbody>
      </table> 
    )
  )
}