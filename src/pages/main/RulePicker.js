import { useContext } from "react";
import { UrlStateContext } from "contexts";
import CollapsableList from "../../components/reusables/CollapsableList";
import LegendItem from "../../components/reusables/LegendItem";
import { capitalize_first_letter } from "../../utils/utils";
import styles from './RulePicker.module.css'

/**
 * React Component for displaying the rule picker, i.e. collapsables for each rule family and a toggle button for each rule
 * @returns {React.JSX.Element}
 */
export default function RulePicker(props) { 

  const {rule_families, auto_collapse} = props;
  const {rule_visibility, set_rule_visibility} = useContext(UrlStateContext);

  const on_rule_click = (rule_abbr) => {
    let visibility_updated = {...rule_visibility};
    visibility_updated[rule_abbr] = !visibility_updated[rule_abbr]
    set_rule_visibility(visibility_updated)
  }


  const render_header = (rule_family) => {
    const active = rule_family.elements.some(rule => rule_visibility[rule.abbreviation]) ||
                    rule_family.sub_families.some(rule_sub_family => rule_sub_family.elements.some(rule => rule_visibility[rule.abbreviation]))
    return (
      <div
        key={rule_family.name}
        data-tooltip-id={"main_tooltip"}
        data-tooltip-content={capitalize_first_letter(rule_family.description)}
      >
        <div
          className={styles.legend_header}
          style={{opacity: active ? 1 : 0.4}}
          key={rule_family.name}
        >
          <LegendItem
            color={rule_family.color_from}
            color_secondary={rule_family.color_to}
            hide_info_icon
          >
            <div className={styles.legend_text}>
              {capitalize_first_letter(rule_family.name)}
            </div>
          </LegendItem>
        </div>
      </div>
    )
  }


  const render_rule = (rule) => {
    return (
      <div
        key={rule.name}
        data-tooltip-id={"main_tooltip"}
        data-tooltip-content={capitalize_first_letter(rule.description)}
      >
        <div
          className={styles.legend_item}
          style={{opacity: rule_visibility[rule.abbreviation] ? 1 : 0.4}}
          onClick={() => on_rule_click(rule.abbreviation)}
        >
          <LegendItem
            color={rule.color}
            hide_info_icon
          >
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
    let children_renders = []
    children_renders.push(
      <RulePicker
        key={rule_family.name}
        rule_families={rule_family.sub_families}
        auto_collapse
      />
    )

    rule_family.elements.forEach(rule => {
      children_renders.push(render_rule(rule));
    })

    return children_renders;
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
