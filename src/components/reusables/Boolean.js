
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
