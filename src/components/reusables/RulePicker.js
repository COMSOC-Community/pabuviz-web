import CollapsableList from "./CollapsableList";
import styles from './RulePicker.module.css'
import LegendItem from "./LegendItem";
import { capitalize_first_letter } from "../../utils/utils";


export default function RulePicker(props) { 

 
  const {rules, rule_families, visibility, set_visibility, auto_collapse} = props;

  const on_rule_click = (rule_abbr) => {
    let visibility_updated = {...visibility};
    visibility_updated[rule_abbr] = !visibility_updated[rule_abbr]
    set_visibility(visibility_updated)
  }


  const render_header = (rule_family) => {
    const active = rule_family.elements.some(rule => visibility[rule.abbreviation])
    return (
      <div
        key={rule_family.name}
      >
        <div
          className={styles.legend_header}
          style={{opacity: active ? 1 : 0.4}}
          key={rule_family.name}
        >
          <LegendItem color={rule_family.color_from} color_secondary={rule_family.color_to} tooltip_text={rule_family.description}>
            <div className={styles.legend_text}>
              {capitalize_first_letter(rule_family.name)}
            </div>
          </LegendItem>
        </div>
      </div>
    )
  }


  const render_item = (rule) => {
    return (
      <div
        key={rule.name}
      >
        <div
          className={styles.legend_item}
          style={{opacity: visibility[rule.abbreviation] ? 1 : 0.4}}
          onClick={() => on_rule_click(rule.abbreviation)}
        >
          <LegendItem color={rule.color} tooltip_text={capitalize_first_letter(rule.description)}>
            <div className={styles.legend_text}>
              {capitalize_first_letter(rule.name)}
            </div>
          </LegendItem>
        </div>
      </div>
    )
  }


  let header_list = rule_families.map(rule_family => {
    return render_header(rule_family);
  })

  let children_list = rule_families.map(rule_family => {
    return rule_family.elements.map(rule => {
      return render_item(rule);
    })
  });

  rules.forEach(rule => {
    if (!rule.rule_family){
      header_list.push(
        render_item(rule)
      );
      children_list.push(null);
    }
  });
  

  return (
    <>
      <CollapsableList
        header_list={header_list}
        children_list={children_list}
        auto_collapse={auto_collapse}
        global_toggle={!auto_collapse}
      />
    </>
  )
}
