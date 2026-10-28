import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

const About = lazy(() => import("./pages/About"));
const Community = lazy(() => import("./pages/Community"));
const Contact = lazy(() => import("./pages/Contact"));
const Ethics = lazy(() => import("./pages/Ethics"));
const EvidenceImpact = lazy(() => import("./pages/EvidenceImpact"));
const Faqs = lazy(() => import("./pages/Faqs"));
const ForOrganisations = lazy(() => import("./pages/ForOrganisations"));
const Home = lazy(() => import("./pages/Home"));
const Insights = lazy(() => import("./pages/Insights"));
const BehaviouralFollowThrough = lazy(
  () => import("./pages/insights/BehaviouralFollowThrough")
);
const EthicalDeliveryFragileContexts = lazy(
  () => import("./pages/insights/EthicalDeliveryFragileContexts")
);
const PreventiveLayerOfCare = lazy(
  () => import("./pages/insights/PreventiveLayerOfCare")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const PreventionModel = lazy(() => import("./pages/PreventionModel"));
const Privacy = lazy(() => import("./pages/Privacy"));
const SafeguardingFramework = lazy(() => import("./pages/SafeguardingFramework"));
const SawaAi = lazy(() => import("./pages/SawaAi"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const Terms = lazy(() => import("./pages/Terms"));

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="for-organisations" element={<ForOrganisations />} />
          <Route path="prevention-model" element={<PreventionModel />} />
          <Route path="insights" element={<Insights />} />
          <Route
            path="insights/preventive-layer-of-care"
            element={<PreventiveLayerOfCare />}
          />
          <Route
            path="insights/behavioural-follow-through"
            element={<BehaviouralFollowThrough />}
          />
          <Route
            path="insights/ethical-delivery-fragile-contexts"
            element={<EthicalDeliveryFragileContexts />}
          />
          <Route path="ethics" element={<Ethics />} />
          {/*
            The old /pilots URL is kept alive as a redirect. It is in
            bookmarks, in shared links and in the planning documents, and a
            visitor who follows one should reach the page rather than a 404
            (ticket 27).
          */}
          <Route path="pilots" element={<Navigate to="/partnerships" replace />} />
          <Route path="partnerships" element={<Partnerships />} />
          <Route path="about" element={<About />} />
          <Route path="evidence-impact" element={<EvidenceImpact />} />
          <Route path="community" element={<Community />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route
            path="safeguarding-framework"
            element={<SafeguardingFramework />}
          />
          <Route path="sawa-ai" element={<SawaAi />} />
          <Route path="style-guide" element={<StyleGuide />} />
          <Route path="terms" element={<Terms />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
