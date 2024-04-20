import React from "react";
import ExitFrame from "./ExitFrame";
// import DebugIndex from "./pages/debug/Index";
// import BillingAPI from "./pages/debug/Billing";
import GetData from "./pages/debug/Data";
// import ActiveWebhooks from "./pages/debug/Webhooks";
import CreateNotification from './pages/CreateNotification'
import SettingsPage from './pages/SettingsPage'
import Templates from "./pages/Templates";
// import Segment from "./pages/Index"

const routes = {
  "/": () => <GetData/>,
  "/exitframe": () => <ExitFrame />,
  "/exitframe/:shop": ({ shop }) => <ExitFrame shop={shop} />,
  //Debug Cards
  // "/debug": () => <DebugIndex />,
  // "/debug/webhooks": () => <ActiveWebhooks />,
  // "/debug/data": () => <GetData />,
  // "/debug/billing": () => <BillingAPI />,
  "/createnotification":()=><CreateNotification/>,
  '/settings':()=><SettingsPage/>,
  '/templates':()=><Templates/>
  //Add your routes here
};

export default routes;
