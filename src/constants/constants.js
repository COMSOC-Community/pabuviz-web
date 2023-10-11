
export const ballot_types = ["approval", "ordinal", "cumulative"];

export const color_palette_general = [
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
]


export const color_palette_rules = [
  ["#c06600", "#df8600", "#f0b000", "#f7d200", "#fffb00"],
  ["#00630d", "#009100", "#20c000", "#8dda00", "#c9f700"],
  ["#860000", "#c70d0d", "#fd2554", "#ff378a", "#ff45d0", "#bd4cda", "#8c3eb9", "#632999", "#4c189e"],
  ["#754c00", "#754c00", "#754c00", "#754c00", "#754c00"],
  ["#000d81", "#0037cf", "#005fec", "#1990ff", "#52abff"],
  ["#00b2c2", "#00b2c2", "#00b2c2", "#00b2c2", "#00b2c2"],
]


// export const color_palette_rules = [
//   ["#000d81", "#0a1cc2", "#1a2ff0", "#4154fa", "#7986ff"],
//   ["#0da50d", "#0da50d", "#0da50d", "#0da50d", "#0da50d"],
//   ["#b40000", "#d41818", "#ee3333", "#ff5959", "#ff8585"],
//   ["#db8413", "#db8413", "#db8413", "#db8413", "#db8413"],
//   ["#eb44dd", "#eb44dd", "#eb44dd", "#eb44dd", "#eb44dd"],
//   ["#00b2c2", "#00b2c2", "#00b2c2", "#00b2c2", "#00b2c2"],
//   ["#754c00", "#754c00", "#754c00", "#754c00", "#754c00"],
// ]


export const color_palette_ballot_types = [
  "#0a6d2b",
  "#912f9e",
  "#e24747",
  "#d4b837",
]


export const default_rules_visible = {
  approval: ["greedy_cost", "max_cost", "mes_cost", "seq_phragmen"],
  ordinal: ["greedy_borda", "max_borda", "mes_borda"],
  cumulative: ["greedy_cardbal", "max_add_card", "mes_cardbal"],
  cardinal: ["greedy_cardbal", "max_add_card", "mes_cardbal"],
}


export const radar_chart_single_election_property_short_names = {
  approval: [
    "avg_card_sat",
    "avg_relcard_sat",
    "avg_cost_sat",
    "avg_relcost_sat",
    "inverted_cost_gini",
    "prop_pos_sat",
  ],
  ordinal: [
    "avg_borda_sat",
    "inverted_borda_gini",
    "prop_pos_sat_ord",
  ],
  cumulative: [
    "avg_sat_cardbal",
    "avg_relsat_cardbal",
    "inverted_cardbal_gini",
    "prop_pos_sat",
  ],
  cardinal: [
    "avg_sat_cardbal",
    "avg_relsat_cardbal",
    "inverted_cardbal_gini",
    "prop_pos_sat",
  ],  
}


export const radar_chart_multiple_elections_property_short_names = {
  approval: [
    "avg_nrmcard_sat",
    "avg_nrmcost_sat",
    "avg_relcard_sat",
    "avg_relcost_sat",
    "category_prop",
    "inverted_cost_gini",
    "prop_pos_sat",
  ],
  ordinal: [
    // "avg_borda_sat",
    "inverted_borda_gini",
    "prop_pos_sat_ord",
  ],
  cumulative: [
    // "avg_sat_cardbal",
    "avg_relsat_cardbal",
    "inverted_cardbal_gini",
    "prop_pos_sat",
  ],
  cardinal: [
    // "avg_sat_cardbal",
    "avg_relsat_cardbal",
    "inverted_cardbal_gini",
    "prop_pos_sat",
  ],  
}