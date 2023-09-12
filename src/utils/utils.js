import { color_palette_general, color_palette_rules, color_palette_ballot_types } from "../constants/constants";

// TODO: should be replaced by proper deep clone function
export function clone(obj){
  return JSON.parse(JSON.stringify(obj));
} 



export function get_chart_color(index){
  return color_palette_general[index%color_palette_general.length]
}


export function get_rule_color(index, subindex){
  let color_palette = color_palette_rules[index%color_palette_rules.length];
  return color_palette[subindex%color_palette.length];
}


export function get_ballot_type_color(index){
  return color_palette_ballot_types[index%color_palette_ballot_types.length]
}


export function transparentize(hex_color_string, opacity){
  if (hex_color_string.length === 7){
    const num = Math.floor(opacity * 255);
    return hex_color_string + ('0' + num.toString(16)).slice(-2);
  } else if (hex_color_string.length === 4){
    const num = Math.floor(opacity * 15);
    return hex_color_string + num.toString(16)
  } else {
    console.warn("transparentize does not support input colors with opacity for now");
    return hex_color_string;
  }
}


export function capitalize_first_letter(str){
  if (str)
    return str[0].toUpperCase() + str.slice(1);
} 


export function format_number_string(number) {
  return Intl.NumberFormat('en').format(number);
}


export function shorten_high_magnitude_number(number, decimal_places=1, min=1000) {
  
  if (number >= min) {
    const units = ["", "k", "M", "B", "T"];
    const order = Math.min(Math.floor(Math.log(number) / Math.log(1000)), 4);
    const unitname = units[order];
    const num = (number / 1000 ** order).toFixed(decimal_places);
    return num + unitname;
  }
  return number.toFixed(decimal_places);
}


// export const array_to_object = (array, key) => {
//   return array.reduce((obj, item) => {
//     return {
//       ...obj,
//       [item[key]]: item,
//     };
//   }, {});
// };


// export const useInitialRender = () => {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = true;
//   }, []);
//   return ref.current;
// };