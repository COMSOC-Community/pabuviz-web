import React, { useEffect, useMemo, useState } from 'react';
import {
  Outlet
} from "react-router-dom";
import styles from './Main.module.css'
import SideNavigation from '../components/SideNavigation';
import { get_ballot_types, get_rules } from '../utils/database_api';
import Selector from '../components/reusables/Selector';
import { capitalize_first_letter, clone, get_ballot_type_color } from '../utils/utils';
import LegendItem from '../components/reusables/LegendItem';
import { Tooltip } from 'react-tooltip';
import RulePicker from '../components/reusables/RulePicker';
import ActivityIndicator from '../components/reusables/ActivityIndicator';
import { default_rules_visible } from '../constants/constants';

// this is the page that will always be shown with the router navigation and the outlet showing
// different pages depending on the route
function Main() {
  
  const [ballot_types, set_ballot_types] =  useState(undefined)
  const [ballot_type_selected, set_ballot_type_selected] =  useState(null)

  const [rule_families, set_rule_families] =  useState(undefined);
  const [rule_visibility, set_rule_visibility] = useState(() => {
    let initial_visibility = {}; 
    default_rules_visible.forEach(rule_abbr => {
      initial_visibility[rule_abbr] = true;
    })
    return initial_visibility;
  });
  

  useEffect(() => {
    const [ballot_type_promise, ballot_type_abort_controller] = get_ballot_types();
    let [rule_promise, rule_abort_controller] = get_rules();

    ballot_type_promise.then(response => {
      const ballot_type_array = response.data;
      const ballot_type_map = new Map(ballot_type_array.map(ballot_type => [ballot_type.name, ballot_type]));
      set_ballot_types(ballot_type_map);
      set_ballot_type_selected(response.data[0].name)
    }).catch(() => {
      set_ballot_types(undefined);
    })

    rule_promise.then(response => {
      set_rule_families(response.data);
    }).catch(() => {
      set_rule_families(undefined);
    })

    return () => {
      ballot_type_abort_controller.abort()
      rule_abort_controller.abort()
    }
  }, []);


  const render_ballot_type_picker = () => {
    return ballot_types && (
      <Selector
        items_map={ballot_types}
        item_selected_key={ballot_type_selected}
        set_item_selected_key={set_ballot_type_selected}
        render_item={(ballot_type, index) => {
          console.log(ballot_type, index)
          return (
            <div key={ballot_type.name} className={styles.ballot_type_option_container}>
              <LegendItem
                color={get_ballot_type_color(index)}
                tooltip_text={ballot_type.description}
                tooltip_id={"main_tooltip"}
              >
                <div className={styles.ballot_type_option_text}>
                  {capitalize_first_letter(ballot_type.name) + " ballots"}
                </div>
              </LegendItem>
            </div>
        )}}
      />
    )
  }

  const rule_families_filtered = useMemo(() => {
    if (rule_families && ballot_type_selected){
      let new_rule_families = clone(rule_families);
      new_rule_families.forEach((rule_family, index) => {
        rule_family.elements = rule_family.elements.filter(rule => rule.applies_to.includes(ballot_type_selected))
      })
      return new_rule_families;
    }
    return null;
  }, [rule_families, ballot_type_selected]);
  

  const rule_list = useMemo(() => {
    if (rule_families_filtered){
      let new_rule_list = []
      rule_families_filtered.forEach(rule_family => {
        rule_family.elements.forEach(rule => {
          new_rule_list.push(rule);
        });
      })
      return new_rule_list;
    }
    return null;
  }, [rule_families_filtered]);


  return (
    <main className={styles.main}>
      <div className={styles.horizontal_layout}>
        <div className={styles.side_menu}>
          <div className={styles.nav_container}>
            <SideNavigation/>
          </div>
          <div className={styles.ballot_type_picker_container}>
            {render_ballot_type_picker()}
          </div>
          <Tooltip
            id="main_tooltip"
            delayShow={500}
            style={{maxWidth: "750px"}}
          />
        </div>
        <div className={styles.content_and_rule_picker_container}>
          <div className={styles.content_container}> 
            <Outlet context={{
              ballot_type_selected: ballot_type_selected,
              set_ballot_type_selected: set_ballot_type_selected,
              rule_list: rule_list,
              rule_visibility: rule_visibility
            }}/>
          </div>
          <div className={styles.rule_picker_container}>
            <div className={styles.rule_picker}>
              {rule_families_filtered && rule_visibility ? 
                <RulePicker
                  rules={rule_list}
                  rule_families={rule_families_filtered}
                  visibility={rule_visibility}
                  set_visibility={set_rule_visibility}
                  horizontal
                /> :
                <ActivityIndicator/>
              }
            </div>
          </div>
          <Tooltip
            id="main_tooltip"
            delayShow={500}
            style={{maxWidth: "750px", zIndex: 2}}
          />
        </div>
      </div>
    </main>
    );
  }
  
export default Main;