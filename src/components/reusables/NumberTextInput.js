import { useState } from 'react';
import styles from './NumberTextInput.module.css'

export default function NumberTextInput(props) { 


  const {placeholder, type, set_value, initial_value} = props;

  const [current_text, set_current_text] = useState(initial_value != null ? initial_value.toString() : "");

  const clean_input = (input_text) => {
    let input_text_cleaned = input_text.slice(0,20);
    if (type === "float"){
      input_text_cleaned = input_text_cleaned.replaceAll(',', '.')
    }
    return input_text_cleaned
  }


  const is_valid_input = (input_text_cleaned) => {
    if (type === "int"){
      return /^\d*$/.test(input_text_cleaned);
    } else {
      return input_text_cleaned.length === 0 || !(isNaN(input_text_cleaned) || isNaN(parseFloat(input_text_cleaned)))
    }
  }


  return (
    <input  
      className={styles.input}
      value={current_text}
      placeholder={placeholder}
      onChange={(event) => {
        let cleaned_input = clean_input(event.target.value)
        if (is_valid_input(cleaned_input)){
          set_current_text(cleaned_input);
          set_value(cleaned_input.length === 0 ? undefined : (type === "int" ? parseInt(cleaned_input) : parseFloat(cleaned_input)));
        }
      }}
    />
  )
}
