# pabuviz

## Getting started
- install [Node.js](https://nodejs.org/ "Node.js") and npm: `sudo apt install npm nodejs`
- install yarn: `npm install --global yarn`
- install dependencies: `yarn install`
- run: `yarn start`


## Source file structure
```
src
└── components
│ └── charts      React components displaying charts
                  GeneralChart.js provides an interface, which is used by all other files in the folder
│ └── elections   React components revolving around election data display and filtering
│ └── reusables   React components that are independent and could be used in any React project
└── constants     holds js constants and css constants 
└── pages         every folder corresponds to a page on the website
│ └── main                       main page, contains the side menu and displays the other pages in it
│ └── database_overview          landing page, showing an overview over the dataset   
│ └── compare_rule_properties    page for inspecting and comparing elections and their outcomes 
│ └── compare_election_results   page for comparing rule properties averaged over many elections
```