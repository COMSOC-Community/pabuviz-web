import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from "react-router-dom";
import SideNavigation from './SideNavigation';
import RulePicker from './RulePicker';
import Selector from '../../components/reusables/Selector';
import LegendItem from '../../components/reusables/LegendItem';
import ActivityIndicator from '../../components/reusables/ActivityIndicator';
import { UrlStateContext, UserDataContext } from 'contexts';
import { Tooltip } from 'react-tooltip';
import { get_ballot_types, get_election_details, get_rules } from '../../utils/database_api';
import { capitalize_first_letter, clone, get_ballot_type_color, get_rule_color } from '../../utils/utils';
import styles from './Main.module.css'

/**
 * this is the page that will always be shown with the router navigation and
 * the outlet showing different subpages depending on the route
 * @returns {React.JSX.Element}
 */
function Main() {
  const [ballot_types, set_ballot_types] =  useState(undefined)
  const [rule_families, set_rule_families] =  useState(undefined);
  const [user_elections, set_user_elections] =  useState(new Map());
    
  const {rule_visibility, ballot_type_selected, set_ballot_type_selected, elections_selected} = useContext(UrlStateContext);

  // request ballot types and rules from the database on first load
  useEffect(() => {
    const [ballot_type_promise, ballot_type_abort_controller] = get_ballot_types();
    let [rule_promise, rule_abort_controller] = get_rules();

    Promise.all([ballot_type_promise, rule_promise]).then(([ballot_type_response, rule_response]) => {
      const ballot_type_array = ballot_type_response.data;
      
      if (ballot_type_array.some(bt => bt.name === "approval")){
        const ballot_type_map = new Map(ballot_type_array.map(ballot_type => [ballot_type.name, ballot_type]));
        set_ballot_types(ballot_type_map);
      }
  
      set_rule_families(rule_response.data);

    }).catch(() => {
      set_ballot_types(undefined);
      set_rule_families(undefined);
    })

    return () => {
      ballot_type_abort_controller.abort()
      rule_abort_controller.abort()
    }
  }, []);

  // if an election is selected that is not yet saved in user_elections (either through an upload a URL), it gets added here
  useEffect(() => {
    if (elections_selected){
      elections_selected.forEach(election => {
        if (election.user_submitted && ![...user_elections.values()].some(e => (e.name === election.name))) {
          let [election_details_promise, election_details_abort_controller] = get_election_details(
            null,
            null,
            {name: {equals: election.name}},
            true
          );
          election_details_promise.then(response => {
            if (response["data"][election.name]){
              const new_user_elections = new Map(user_elections);
              new_user_elections.set(election.name, response["data"][election.name]);
              set_user_elections(new_user_elections);
            }
          })
        }
      })
    }
  }, [elections_selected, user_elections, set_user_elections])


  // function rendering the ballot type selector
  const render_ballot_type_selector = () => {
    return ballot_types && (
      <Selector
        items_map={ballot_types}
        item_selected_key={ballot_type_selected}
        set_item_selected_key={set_ballot_type_selected}
        invert={true}
        render_item={(ballot_type_name, ballot_type, index) => {
          return (
            <div
              key={ballot_type_name}
              className={styles.ballot_type_option_container}
              data-tooltip-id={"main_tooltip"}
              data-tooltip-content={capitalize_first_letter(ballot_type.description)}
            >
              <LegendItem
                color={get_ballot_type_color(index)}
              >
                <div className={styles.ballot_type_option_text}>
                  {capitalize_first_letter(ballot_type_name) + " ballots"}
                </div>
              </LegendItem>
            </div>
        )}}
      />
    )
  }


  // rule_families_filtered will save the rule families and rules that apply to the selected ballot type
  // this code should be improved, it's messy because of the recursive structure of the rule families
  const rule_families_filtered = useMemo(() => {
    const filter_by_ballot_type_selected = array => array.filter(item => item.applies_to.includes(ballot_type_selected))
    const filter_non_empty = rule_families => rule_families.filter(rule_family => rule_family.elements.length > 0 || rule_family.sub_families.length > 0)

    if (rule_families && ballot_type_selected){
      let new_rule_families = clone(rule_families);
      new_rule_families = filter_by_ballot_type_selected(new_rule_families);

      new_rule_families.forEach((rule_family, family_index) => {
        rule_family.elements = filter_by_ballot_type_selected(rule_family.elements)
        rule_family.sub_families = filter_by_ballot_type_selected(rule_family.sub_families)

        // assign colors here, this is still messy
        let rule_index = 0;
        rule_family.sub_families.forEach((rule_sub_family) => {
          rule_sub_family.elements = filter_by_ballot_type_selected(rule_sub_family.elements)
          rule_sub_family.color_from = get_rule_color(family_index, rule_index);
          rule_sub_family.elements.forEach((rule) => {
            rule.color = get_rule_color(family_index, rule_index);
            rule_index += 1;
          });
          rule_sub_family.color_to = get_rule_color(family_index, rule_index-1);
        });
        
        rule_family.sub_families = filter_non_empty(rule_family.sub_families)

        rule_family.elements.forEach((rule) => {
          rule.color = get_rule_color(family_index, rule_index);
          rule_index += 1;
        });

        rule_family.color_from = get_rule_color(family_index, 0);
        rule_family.color_to = get_rule_color(family_index, rule_index-1);        
      })

      new_rule_families = filter_non_empty(new_rule_families);
      return new_rule_families;
    }
    return null;
  }, [rule_families, ballot_type_selected]);
  

  // rule_list holds an array of the rules that apply to the selected ballot type
  const rule_list = useMemo(() => {
    if (rule_families_filtered){
      let new_rule_list = []
      rule_families_filtered.forEach(rule_family => {
        rule_family.sub_families.forEach(rule_sub_family => {
          rule_sub_family.elements.forEach(rule => {
            new_rule_list.push(rule);
          });
        });
        rule_family.elements.forEach(rule => {
          new_rule_list.push(rule);
        });
      })
      return new_rule_list;
    }
    return null;
  }, [rule_families_filtered]);


  return (
    <UserDataContext.Provider value={{user_elections, set_user_elections}}>
      <main className={styles.main}>
        <div className={styles.horizontal_layout}>
          <div className={styles.side_menu}>
            <div className={styles.nav_container}>
              <SideNavigation/>
            </div>
            <div className={styles.ballot_type_picker_container}>
              {render_ballot_type_selector()}
            </div>
            <Tooltip
              id="main_tooltip"
              delayShow={500}
              style={{maxWidth: "750px"}}
            />
          </div>
          <div className={styles.content_and_rule_picker_container}>
            <div className={styles.content_container}> 
              { ballot_type_selected && rule_list && rule_visibility ?
                <Outlet context={{
                  rule_list: rule_list,
                }}/> :
                <ActivityIndicator/>
              }
            </div>
            <div className={styles.rule_picker_container} key={ballot_type_selected}>
              {rule_families_filtered && rule_visibility ? 
                <div className={styles.rule_picker}>
                  <RulePicker
                    rule_families={rule_families_filtered}
                    horizontal
                  />
                </div> :
                <ActivityIndicator scale={0.7}/>
                }
            </div>
            <Tooltip
              id="main_tooltip"
              delayShow={500}
              style={{maxWidth: "750px", zIndex: 2}}
            />
          </div>
        </div>
      </main>
    </UserDataContext.Provider>
    );
  }
  
export default Main;