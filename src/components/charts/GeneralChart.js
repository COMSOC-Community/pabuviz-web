import React, { useEffect, useState, useRef } from 'react';
import styles from './GeneralChart.module.css'
import ActivityIndicator from '../reusables/ActivityIndicator';
import { getElementAtEvent } from 'react-chartjs-2';
import NetworkError from '../reusables/NetworkError';
import HoverTooltip from '../reusables/HoverTooltip';



export const initial_graph_data_default = (props_constant) => {
  return {
    labels: [],
    datasets: []
  }
}


export default function GeneralChart(props) { 
  
  const {
    chart_id,
    parent_props_constant,
    parent_props_variable,
    api_request,
    initial_graph_data,
    compute_graph_data,
    update_graph_data,
    chart_component,
    get_graph_options,
    generate_tooltip_info,
    generate_corner_info_text,
    render_delay,
    on_click
  } = props;


  const chart_ref = useRef();

  const [api_response, set_api_response] = useState(undefined);
  const [graph_data, set_graph_data] = useState(initial_graph_data ? initial_graph_data() : initial_graph_data_default());
  const [is_loading, set_is_loading] = useState(true)

  const initial_parent_props = useRef(true);
  const [has_error, set_has_error] = useState(false)
  const [waiting_for_render_delay, set_waiting_for_render_delay] = useState(render_delay ? true : false)

  // initial api request and computation
  useEffect(() => {
    if (waiting_for_render_delay){
      setTimeout(
        () => {set_waiting_for_render_delay(false)},
        render_delay
      )
    } else {
      // api request depends on parent props, only execute if they are loaded
      if (parent_props_constant !== null){
        set_has_error(false);

        // if this is the first time then set the initial (empty) data for the graph 
        if (initial_parent_props.current){
          set_graph_data(initial_graph_data ? initial_graph_data(parent_props_constant) : initial_graph_data_default());
          initial_parent_props.current = false;
        }

        // send api request (may not be necessary for charts that only need data that parent provides)
        if (api_request){
          let request = api_request(parent_props_constant);
          set_is_loading(true);
    
          request.promise.then(api_response_data => {
            // if data is received set it into the state and trigger graph_data computation
            if (api_response_data){
              set_api_response(api_response_data);
              set_is_loading(false);
    
              // if compute_graph_data may not be defined if it needs to be recomputed on every update (all code will then be in update_graph_data)
              if (compute_graph_data){
                set_graph_data(old_graph_data => {
                  return compute_graph_data(
                    api_response_data,
                    parent_props_constant,
                    old_graph_data,
                  );
                });
              }
            }
          }).catch(e => {set_has_error(true)});
    
          // abort last api request, when new one is started
          return request.abort_func;
        } else {
          if (compute_graph_data){
            set_is_loading(false);
            set_graph_data(old_graph_data => compute_graph_data(
                null,
                parent_props_constant,
                old_graph_data,
              )
            );
          }
        }
      }
    }

  }, [parent_props_constant, compute_graph_data, api_request, initial_graph_data, waiting_for_render_delay, render_delay]);


  // update graph_data without new api call
  useEffect(() => {
    if (!waiting_for_render_delay && !is_loading){
      if (update_graph_data && (api_response || !api_request) && parent_props_constant !== null && parent_props_variable !== null){
        set_graph_data((prev_graph_data) => {
          return update_graph_data(api_response, parent_props_constant, parent_props_variable, prev_graph_data);
        });
      }
    }
  }, [parent_props_constant, parent_props_variable, update_graph_data, api_response, api_request, waiting_for_render_delay, is_loading]);

    
  const on_chart_click = (event) => {
    if (on_click){
      let element_array = getElementAtEvent(chart_ref.current, event);
      if (element_array.length > 0){
        on_click(element_array[0], api_response, parent_props_constant, parent_props_variable, graph_data);
      }
    }
  }

  const on_export_image_click = (event) => {
    if (chart_ref){
      const image = chart_ref.current.toBase64Image();
      const a = document.createElement('a')
      a.download = 'chart.png'
      a.href = image;
      a.click()
    }
  }

  const on_export_data_click = (event) => {
    if (graph_data){
      const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph_data));
      const a = document.createElement('a')
      a.download = 'chart.json'
      a.href = data;
      a.click()
    }
  }


  const Chart = chart_component;

  const corner_info_text = generate_corner_info_text ? 
    generate_corner_info_text(api_response, parent_props_constant, parent_props_variable, graph_data) :
    null;

  const tooltip_info = generate_tooltip_info &&
    generate_tooltip_info(api_response, parent_props_constant, parent_props_variable, graph_data);
  

  const render_corner_menu = () => (
    <div className={styles.corner_info}>
      { corner_info_text && 
        <div className={styles.corner_info_text}>
          {corner_info_text}
        </div>
      }
      { tooltip_info &&
        <HoverTooltip
          id={chart_id+"info"}
          text={"ⓘ"}
          className={styles.info_symbol}
          disabled={is_loading || has_error}
        >
          {tooltip_info}
        </HoverTooltip>
      }
      <HoverTooltip
        id={chart_id+"menu"}
        text={"☰"}
        className={styles.menu_symbol}
        disabled={is_loading || has_error}
        clickable
        no_padding
      >
        <div className={styles.menu}>
          <div className={styles.menu_item} onClick={on_export_image_click}>
            {"Export chart as png"}
          </div>
          <div className={styles.menu_item} onClick={on_export_data_click}>
            {"Export chart data"}
          </div>
        </div>
      </HoverTooltip>
    </div>
  );


  return (
    <div className={styles.chart_wrapper}>
      <div className={styles.chart_container}  style={{opacity: is_loading ? 0.5 : 1}}>
        <Chart 
          data={graph_data}
          options={get_graph_options(api_response, parent_props_constant, parent_props_variable, graph_data)}
          ref={chart_ref}
          onClick={on_chart_click}
        />
        {render_corner_menu()}
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
      </div>
      {(is_loading || waiting_for_render_delay) && !has_error &&
        <div className={styles.overlay_container}>
          <ActivityIndicator/> 
        </div>
      }
      {has_error &&
        <div className={styles.overlay_container}>
          <NetworkError error_text={"API request error"}/>
        </div>
      }
      {/* <button onClick={on_debug_button_click}>Click me!</button> */}
    </div>
  );
}
