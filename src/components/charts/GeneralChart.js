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

/**
 * @typedef {Object} PropsConstant
 * Constant parent props passed to the GeneralChart component as parent_props_constant
 * 
 * @typedef {Object} PropsVariable
 * the variable parent props passed to the GeneralChart component as parent_props_constant
 * 
 * @typedef {Object} ApiResponse
 * Response object of the api_request function
 * 
 * @typedef {Object} GraphData
 * Graph data passed to the chartjs chart for rendering (see chartjs doc for details)
 * 
 * @typedef {Object} GraphOptions
 * Options object passed to the chartjs chart (see chartjs doc for details)
 * 
*/


/**
 * 
 * @callback ApiRequest
 * @param {PropsConstant} props_constant constant parent props
 * @returns {ApiResponse}
 * Response object of the api_request function
 * 
 * @callback InitialGraphData
 * @param {PropsConstant} [props_constant]
 * Constant props provided by the parent of GeneralChart
 * @returns {GraphData}
 * Data object to be passed to the chartjs chart
 * 
 * @callback ComputeGraphData
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {GraphData} old_graph_data the current graph data
 * @param {function} set_error function to set the error text, if computation goes wrong
 * @returns {GraphData}
 * Data object to be passed to the chartjs chart
 * 
 * @callback UpdateGraphData
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {PropsVariable} props_variable variable parent props
 * @param {GraphData} old_graph_data the current graph data
 * @param {function} set_error function to set the error text, if computation goes wrong
 * @returns {GraphData}
 * Data object to be passed to the chartjs chart
 * 
 * @callback GetGraphOptions
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {PropsVariable} props_variable variable parent props
 * @param {GraphData} graph_data the current graph data
 * @returns {GraphOptions}
 * Options object to be passed to the chartjs chart
 * 
 * @callback GenerateInfo
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {PropsVariable} props_variable variable parent props
 * @param {GraphData} graph_data the current graph data
 * @returns {React.JSX.Element}
 * JSX element for rendering
 * 
 * @callback GenerateData
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {PropsVariable} props_variable variable parent props
 * @param {GraphData} graph_data the current graph data
 * @returns {Object}
 * Data object containing all the relevant data presented in the chart
 * 
 * @callback OnClick
 * @param {import('chart.js').InteractionItem} element the chartjs interaction item that was clicked
 * @param {ApiResponse} api_response response of the api, will be null if no api_request function was provided
 * @param {PropsConstant} props_constant constant parent props
 * @param {PropsVariable} props_variable variable parent props
 * @param {GraphData} graph_data the current graph data
*/


/**
  * Component to be used to display any kind of chartjs chart.
  * To implement a specific chart write a parent component and provide the following props:
  * @param {object} props
  * @param {string} props.chart_id
  * Identifier of the chart, make sure there are no two with the same id rendered at the same time (mainly needed for the tooltip)
  * @param {import('react-chartjs-2/dist/types').TypedChartComponent} props.chart_component
  * react-chartjs-2 component to be drawn
  * @param {ApiRequest} [props.api_request]
  * Function to request data from the api. May not be necessary for charts that only need data that parent provides.
  * @param {InitialGraphData} [props.initial_graph_data]
  * Callback computing the graph data for the chart before the api response with the actual data was received.
  * If not provided or no return value, initial_graph_data_default is used as fallback.
  * Make sure this default is appropriate for your graph type if you do not provide the callback.
  * @param {Object} props.parent_props_constant
  * 'Constant' parent props. These are the props that require a new api_request and thus complete recomputation of the graph data, when changed.
  * Whenever parent_props_constant changes, api_request and compute_graph_data are executed and the chart is rerendered completely
  * @param {Object} props.parent_props_variable
  * 'Variable' parent props. These are the props that only require the graph data to updated, when changed.
  * Whenever parent_props_variable changes, update_graph_data is executed and the chart updates with an animation
  * @param {ComputeGraphData} [props.compute_graph_data]
  * Function computing the graph data for the chartjs chart from the api response.
  * It is called initially and every time parent_props_constant change.
  * @param {UpdateGraphData} [props.update_graph_data]
  * Function updating the graph data for the chartjs chart from the api response and variable parent props.
  * It is called initially (after compute_graph_data) and every time parent_props_variable change.
  * @param {GetGraphOptions} props.get_graph_options
  * Function returning the graph options passed to the chartjs chart.
  * @param {GenerateInfo} [props.generate_tooltip_info]
  * Function returning the JSX element to be rendered in the info tooltip.
  * @param {GenerateInfo} [props.generate_corner_info]
  * Function returning the JSX element to be rendered in top right corner (info text).
  * @param {GenerateData} [props.generate_export_data]
  * Function returning a data object containing all the relevant data presented in the chart for exporting as json.
  * @param {OnClick} [props.on_click] 
  * Function to be executed when an item in the chart is clicked 
  * @param {int} [props.render_delay]
  * Time in millisecond to delay the api_request and thus rendering of the chart.
  * Usefull to avoid animation stutter if there are many charts initialized at the same time
 * @returns {React.JSX.Element}
 */
export default function GeneralChart(props) { 
  
  const {
    chart_id,
    chart_component,
    api_request,
    initial_graph_data,
    parent_props_constant,
    parent_props_variable,
    compute_graph_data,
    update_graph_data,
    get_graph_options,
    generate_tooltip_info,
    generate_corner_info,
    generate_export_data,
    on_click,
    render_delay
  } = props;

  const chart_ref = useRef();

  const [api_response, set_api_response] = useState(undefined);
  const [graph_data, set_graph_data] = useState((initial_graph_data && initial_graph_data()) || initial_graph_data_default())
  const [is_loading, set_is_loading] = useState(true)

  const initial_parent_props = useRef(true);
  const [error, set_error] = useState(null)
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
        set_error(null);

        // if this is the first execution with parent_props defined then set the initial (empty) data for the graph 
        if (initial_parent_props.current){
          set_graph_data((initial_graph_data && initial_graph_data(parent_props_constant)) || initial_graph_data_default());
          initial_parent_props.current = false;
        }

        // send api request if api_request function is provided
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
                    set_error
                  );
                });
              }
            }
          }).catch(e => {set_error(e)});
    
          // abort last api request, when new one is started
          return request.abort_func;
        } else {
          set_is_loading(false);
          if (compute_graph_data){
            set_graph_data(old_graph_data => compute_graph_data(
              null,
              parent_props_constant,
              old_graph_data,
              set_error
            ));
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
          return update_graph_data(api_response, parent_props_constant, parent_props_variable, prev_graph_data, set_error);
        });
      }
    }
  }, [parent_props_constant, parent_props_variable, update_graph_data, api_response, api_request, waiting_for_render_delay, is_loading]);

  // triggered when the chart is clicked. Extracts the element that was clicked and passes it to the on_click function, if provided
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
    if (api_response && parent_props_constant && parent_props_variable && graph_data){
      let export_data;
      if (generate_export_data){
        export_data = generate_export_data(api_response, parent_props_constant, parent_props_variable, graph_data);
      } else {
        export_data = graph_data;
      }
      const export_data_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(export_data));
      const a = document.createElement('a')
      a.download = 'chart.json'
      a.href = export_data_str;
      a.click()
    }
  }



  const corner_info = generate_corner_info ? 
    generate_corner_info(api_response, parent_props_constant, parent_props_variable, graph_data) :
    null;

  const tooltip_info = generate_tooltip_info &&
    generate_tooltip_info(api_response, parent_props_constant, parent_props_variable, graph_data);
  
  const render_corner_menu = () => (
    <div className={styles.corner_info}>
      { corner_info && 
        <div className={styles.corner_info_text}>
          {corner_info}
        </div>
      }
      { tooltip_info &&
        <HoverTooltip
          id={chart_id+"info"}
          text={"ⓘ"}
          className={styles.info_symbol}
          disabled={is_loading || error}
        >
          {tooltip_info}
        </HoverTooltip>
      }
      <HoverTooltip
        id={chart_id+"menu"}
        text={"☰"}
        className={styles.menu_symbol}
        disabled={is_loading || error}
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


  const Chart = chart_component;

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
      </div>
      {(is_loading || waiting_for_render_delay) && !error &&
        <div className={styles.overlay_container}>
          <ActivityIndicator/> 
        </div>
      }
      {error &&
        <div className={styles.overlay_container}>
          <NetworkError error_text={"error"}/>
        </div>
      }
    </div>
  );
}
