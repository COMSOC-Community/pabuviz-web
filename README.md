# Pabuviz

[Pabuviz.org](https://pabuviz.org) is a visualization platform for participatory budgeting (PB).
It provides intuitive and visually appealing comparison tools based on real-life data from past PB
elections. It can be used as a helper tool when discussing possible voting rules for PB.

This repository contains the React application for the website. It works hand-in-hand with the
[pabuviz-db](https://github.com/COMSOC-Community/pabuviz-db) repository, which contains the Django project implementing the database for [pabuviz.org](https://pabuviz.org).

## Getting Started

### Local Development
- Install [Node.js](https://nodejs.org/ "Node.js") and npm: `sudo apt install npm nodejs`
- Install yarn: `npm install --global yarn`
- Install dependencies: `yarn install`
- Run the Django server for the database (must be on port 8000; see `.env.development` for configuration)
- Start the application: `yarn start`

### Build for the Server
To update the server, you can do it manually like this:

- Run the build: `npm run build`
- Copy the contents of the `build` folder to the web folder on the server

You can also use the GitHub workflow described below ([here](#github-workflow)).

## Source file structure
```
src
└── components
│   └── charts      React components displaying charts.
│                   GeneralChart.js provides an interface used by all other files in this folder.
│   └── elections   React components for election data display and filtering.
│   └── reusables   React components that are independent and could be used in any React project.
└── constants       Holds JavaScript and CSS constants.
└── pages           Each folder corresponds to a page on the website.
│   └── main                       Main page, contains the side menu and displays other pages within it.
│   └── database_overview          Landing page showing an overview of the dataset.   
│   └── compare_rule_properties    Page for inspecting and comparing elections and their outcomes.
│   └── compare_election_results   Page for comparing rule properties averaged over multiple elections.
```

## GitHub Workflow

When changes have been pushed to the repository, you can update the server directly by publishing a release.

1. Publish a new release here: https://github.com/COMSOC-Community/pabuviz-web/releases/new.
2. Create a new tag for the release.
3. Ensure the release is set as the latest (this is the default).
4. Once published, the `Build and Release` action will run in the background. This action:
   - Builds the project into a set of HTML files
   - Zips the build output into `build.zip`
   - Adds `build.zip` as an asset to the newly created release (check it [here](https://github.com/COMSOC-Community/pabuviz-web/releases/latest))
   - Runs the `update_web_from_release.sh` script on the server to download the new build and update the directories.

After the action completes, the website at [pabuviz.org](https://pabuviz.org) should be updated.

Instead of this process, we could also simply check out the repository from the server 
and build directly there. However, using the release mechanism means we don't have to install npm
and other packages on the server, reducing setup complexity on the server side.

