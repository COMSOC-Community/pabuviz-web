/**
 * React Component for displaying a boolean value as a green tick (true) a red cross (false) or a grey question mark (null)
 * @param {object} props
 * @param {boolean | null} props.boolean_value the boolean to be displayed
 * @param {boolean} props.no_colors if true, no colors are set
 * @returns {React.JSX.Element}
 */
export default function Boolean(props) { 

  const {boolean_value, no_colors} = props;

  let color;
  let text;
 
  if (boolean_value != null){
    if (boolean_value){
      text = '✔';
      color = "green";
    } else {
      text = '✗';
      color = "red";
    }
  } else {
    text = '?';
    color = "gray";
  }

  if (no_colors){
    color = null;
  }
 
  return (
    <div style={{color: color, cursor: "default"}}>
      {text}
    </div>
  )
}
