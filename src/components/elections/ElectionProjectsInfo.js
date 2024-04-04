import styles from './ElectionProjectsInfo.module.css'
import { useEffect, useMemo, useState } from "react";
import NetworkError from "../reusables/NetworkError";
import ActivityIndicator from "../reusables/ActivityIndicator";
import { get_projects } from "../../utils/database_api";
import LegendItem from "../reusables/LegendItem";
import { capitalize_first_letter, clone, format_number_string } from '../../utils/utils';
import Boolean from '../reusables/Boolean';
import ElectionData from './ElectionData';


const election_filter_properties_short_names = [
  // "name",
  "budget",
  "num_projects",
  // "has_categories",
  // "has_targets",
  "sum_proj_cost",
  "avg_proj_cost",
  "med_proj_cost",
  "sd_proj_cost"
]


/**
 * React Component displaying a table of projects and whether they were selected by a rule of an election
 * The rules will be displayed on top and will stick to the top end of the screen when scrolled down
 * @param {object} props
 * @param {object} props.election
 * the election object (serialized Election object of the django db)
 * all that is needed for this component to work is election.name
 * if election.rule is present, then the rules are reordered to put that one first
 * @param {object[]} props.rules
 * array of rules (serialized Rule object of the django db)
 * Each is expected to have entries for 'name', 'abbreviation' and additionally 'color'
 * @param {object} props.visibility 
 * object containing rule abbreviations as keys and whether they should be displayed as a value
 * @param {int} props.top
 * the top position for the sticky header
 * @returns {React.JSX.Element}
 */
export default function ElectionProjectsInfo(props) {

  const {election, rules, visibility, top} = props;

  const [projects, set_projects] = useState(null);
  const [sorting, set_sorting] = useState({field: "name", ascending: true});
  const [error, set_error] = useState(false);


  useEffect(() => {
    set_error(false);
    let [projects_promise, projects_abort_controller] = get_projects(
      election.name,
      election.user_submitted
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
    }).catch((e) => console.warn(e))


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


  const rules_reordered = useMemo(() => {
    if (rules && election){
      const new_rules = clone(rules);
      if (election.rule){
        let index = new_rules.findIndex(rule => rule.abbreviation === election.rule);
        if (index !== -1){
          new_rules.unshift(new_rules.splice(index, 1)[0]);
        }
      }
      return new_rules;
    }
  }, [rules, election])



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
    const is_election_rule = rule.abbreviation === election.rule;
    return (
      <td
        key={rule.abbreviation}
        className={styles.boolean_container}
        style={{backgroundColor: is_election_rule ? "#ffffff22" : "none"}}
        data-tooltip-id={'main_tooltip'}
        data-tooltip-content={is_election_rule ? "This is the rule used in the actual election" : ""}
      > 
        <Boolean
          boolean_value={selected}
        />
      </td>
    );
    
  }

  let rules_visible;
  if (rules_reordered && visibility){
    rules_visible = rules_reordered.filter(rule => visibility[rule.abbreviation]);
  }


  return (
    error ?
    <NetworkError/> :
    ( !projects ?
      <ActivityIndicator/> :
      <div className={styles.table_wrapper}>
        <table className={styles.table}>
          <thead style={{top: top}}>
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
                      style={{textAlign: "center", cursor: "default"}} 
                      onClick={() => set_new_sorting("name", true)}
                    > 
                      {render_project_header_text("Project Name", "name")}
                    </div>
                    <div
                      className={styles.project_cost_column}
                      style={{textAlign: "center", cursor: "default"}} 
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
                            // data-tooltip-id={"main_tooltip"}
                            // data-tooltip-content={capitalize_first_letter(rule.description)}
                          >
                            <LegendItem color={rule.color}>
                              {render_project_header_text(capitalize_first_letter(rule.name), rule.abbreviation)}
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
          <tbody className={styles.tbody}>
            {projects.map(project => {
              return (
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
            )})}
          </tbody>
        </table> 
      </div>
    )
  )
}