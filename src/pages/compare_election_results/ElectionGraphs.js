import React, { useMemo, useState } from 'react';
import SatisfactionHistogram from '../../components/charts/SatisfactionHistogram';
import RulePropertyRadarChart from '../../components/charts/RulePropertyRadarChart';
import CategoryProportion from '../../components/charts/CategoryProportions';
import ElectionProjectsInfo from '../../components/elections/ElectionProjectsInfo';
import ElectionData from '../../components/elections/ElectionData';
import Collapsable from '../../components/reusables/Collapsable';
import { clone } from '../../utils/utils';
import styles from './ElectionGraphs.module.css'


// list of sections that should be displayed for a selection
// each section has a name, width, height, default_visibility and render function
const election_sections = [
  { 
    name: "Satisfaction histogram",
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <SatisfactionHistogram
        rules={rules}
        election_filters={election_filters}
        rule_visibility={rule_visibility}
        single_election={true}
        user_submitted={election.user_submitted}
      />
    )
  },
  { 
    name: "Rule properties", 
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <RulePropertyRadarChart
        rules={rules}
        rule_properties={rule_properties}
        election_filters={election_filters}
        rule_visibility={rule_visibility}
        single_election={true}
        user_submitted={election.user_submitted}
      />
    )
  },
  { 
    name: "Categories",
    width: "50%",
    height: "300px",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <CategoryProportion
        election_name={election.name}
        rules={rules}
        rule_visibility={rule_visibility}
        user_submitted={election.user_submitted}
      />
    )
  },
  { 
    name: "Projects",
    width: "100%",
    height: "fit content",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      only_one_selected ? 
        <div className={styles.graphs_wrapper}>
          <ElectionProjectsInfo
            election={election}
            rules={rules}
            visibility={rule_visibility}
            top={"60px"}
          />
        </div> :
        <div className={styles.graphs_wrapper}>
          {"Please select only one election to view this section"}
        </div>
    )
  },
  { 
    name: "Election details",
    width: "60%",
    height: "fit content",
    default_visibility: true,
    render: (election, rules, rule_visibility, rule_properties, election_filters, only_one_selected) => (
      <div className={styles.election_data_container}>
        <ElectionData election={election}/>
      </div>
    )
  },
]

/**
 * component rendering all the charts and information that should be displayed for a selected election
 * @returns {React.JSX.Element}
 */
export default function ElectionGraphs(props) {
  const { elections_selected_data, rules, rule_visibility, rule_properties } = props;
  const [section_visibility, set_section_visibility] = useState(
    election_sections.map((section) => section.default_visibility) 
  );

  const toggle_section_visibility = (index) => {
    set_section_visibility(old_visibility => {
      const new_visibility = clone(old_visibility);
      new_visibility[index] = !new_visibility[index];
      return new_visibility;
    })
  }

  const only_one_selected = elections_selected_data.size === 1;

  const election_filters = useMemo(() => (
    Array.from(elections_selected_data).map(([name, election]) => ({name: {equals: name}}))
  ), [elections_selected_data] )


  return Array.from(elections_selected_data).map(([name, election], election_index) => (
    election && (
      <div className={styles.election_container} key={name}>
        <div className={styles.election_title}>
          <p>
            {election.unit + ((election.subunit || election.instance) ? ", " + (election.subunit || election.instance) : "") + ". " + new Date(election.date_begin).getFullYear()}
          </p>
        </div>
        <div className={styles.election_body}>
          {election_sections.map((section, section_index) => (
            <div key={section.name} className={styles.section_container}>
              <div
                className={styles.section_title}
                onClick={() => toggle_section_visibility(section_index)}
              >
                {election_index === 0 ? 
                  <>
                    <div className={styles.indicator} style={{rotate: !section_visibility[section_index] ? "-90deg" : "0deg"}}>
                      {'▾'}
                    </div>
                    <div className={styles.section_title_text}>
                      {section.name}
                    </div>
                  </> :
                  <></>                
                }
              </div>  
              <Collapsable
                collapsed={!section_visibility[section_index]}
                animation_duration={400}
                initial_height={section.height}
              >
                <div className={styles.section_content_wrapper}>
                  <div
                    key={section.name}
                    className={styles.section_content_container}
                    style={{
                      width: only_one_selected ? section.width : "100%",
                      height: section.height
                    }}>
                    {section.render(
                      election,
                      rules,
                      rule_visibility,
                      rule_properties,
                      election_filters[election_index],
                      only_one_selected
                    )}
                  </div>
                </div>
              </Collapsable>
            </div>
        ))}
        </div>
      </div>
    )
  ))
}