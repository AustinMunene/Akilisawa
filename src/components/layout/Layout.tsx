import { AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import BackToTop from "../ui/BackToTop";
import Footer from "./Footer";
import Navigation from "./Navigation";
import PageBackground from "./PageBackground";
import PageTransition from "./PageTransition";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const location = useLocation();

  return (
    <PageBackground>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname} className="flex-1">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
        <Footer />
      </div>
      <BackToTop />
    </PageBackground>
  );
};

export default Layout;
