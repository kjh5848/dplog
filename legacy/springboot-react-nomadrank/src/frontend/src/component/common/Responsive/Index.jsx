import { useMediaQuery } from "react-responsive";
import PropTypes from "prop-types";

MobileView.propTypes = {
  children: PropTypes.node.isRequired
};

PcView.propTypes = {
  children: PropTypes.node.isRequired
};

export function MobileView({ children }) {
  const isMobile = useMediaQuery({
    query: "(max-width:600px)"
  });

  return <>{isMobile && children}</>;
}

export function PcView({ children }) {
  const isPc = useMediaQuery({
    query: "(min-width:601px)"
  });

  return <>{isPc && children}</>;
}
