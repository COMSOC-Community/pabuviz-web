# pabuviz

[Pabuviz.org](https://pabuviz.org), a visualisation platform for
participatory budgeting. It provides intuitive and visually appealing comparison tools
for PB, based on real-life data from past PB elections. It can be used
as a helper tool when discussing possible voting rules for PB.

This repository contains the react application for the website. It works hand-in-hand
with the [pabuviz-db](https://github.com/COMSOC-Community/pabuviz-db) repository which
contains the Django project implementing the database for [pabuviz.org](https://pabuviz.org).

## Getting started

### Local development
- install [Node.js](https://nodejs.org/ "Node.js") and npm: `sudo apt install npm nodejs`
- install yarn: `npm install --global yarn`
- install dependencies: `yarn install`
- run the Django server for the database (need to be on port 8000, see the file `.env.development`)
- run: `yarn start`

### Build for the server
- run: `npm run build`
- scp the content of the build folder to the folder on the server

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

## GitHub Workflow

When changes have been pushed to the repository, you can directly update the server by publishing 
a release.

- Published a new release here: https://github.com/COMSOC-Community/pabuviz-web/releases/new.
- Create a new tag for the release.
- Make sure that the release will be set as the latest (this is the default).
- Once the release is published, the `Build and Release` action will be run in the background.
This action:
  - Builds the project into a set of HTML files
  - Zips the build into build.zip
  - Adds build.zip as an asset to the newly created release (you can check [here](https://github.com/COMSOC-Community/pabuviz-web/releases/latest))
  - Runs the `update_web_from_release.sh` script on the server to download the new build and update the directories.

Once the action is done, the website [pabuviz.org](https://pabuviz.org) should have been updated.