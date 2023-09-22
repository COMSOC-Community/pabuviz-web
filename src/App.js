import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Main from './pages/Main';
import ErrorPage from './pages/ErrorPage';
import CompareRuleProperties from './pages/compare_rule_properties/CompareRuleProperties';
import DatabaseOverview from './pages/database_overview/DatabaseOverview';
import CompareElectionResults from './pages/compare_election_results/CompareElectionResults';

// here we need to import and register all elements implicitly used by any of our charts
import {
  Chart,
  LinearScale, LogarithmicScale, CategoryScale, RadialLinearScale,
  LineElement, PointElement, BarElement,
  Title, Legend, Tooltip,
  Colors, Filler,
  defaults
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(
  LinearScale, LogarithmicScale, CategoryScale, RadialLinearScale,
  LineElement, PointElement, BarElement,
  Title, Legend, Tooltip,
  Colors, Filler,
  annotationPlugin
);

// set the global defaults for our charts, can be overwritten with the options object
// for each chart individually
defaults.font.size = 14;
defaults.scales.radialLinear.pointLabels.font.size = 14;
defaults.plugins.title.display = true;
defaults.plugins.title.font.weight = 'normal';
defaults.plugins.title.font.size = 16;
defaults.plugins.legend.display = false;
defaults.maintainAspectRatio = false;
defaults.scales.linear.title = {display: true};
defaults.scales.logarithmic.title = {display: true};


function App() {
  // create the browser routes, they can be plugged in using <Outlet/> (see Main.js)
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main/>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <DatabaseOverview />,
        },
        {
          path: "compare_elections",
          element: <CompareElectionResults />,
        },
        {
          path: "rules",
          element: <CompareRuleProperties />,
        },
        {
          path: "upload_election",
          element: "Coming soon...",
        },
      ],
    },
  ]);

  return (
    <RouterProvider router={router}>
      <Main/>
    </RouterProvider>
    );
  }
  
export default App;
