import PropTypes from "prop-types";
import Header from "/src/component/common/Header/Index.jsx";
import LayoutStyle from "/src/component/layout/default/Style.jsx";

LayoutDefault.propTypes = {
  children: PropTypes.node.isRequired
};

export default function LayoutDefault({ children }) {

  const style = LayoutStyle();
  return (
    <>
      <Header />
      <div style={style.contentContainer}>
        <div style={style.content}>
          {children}
        </div>
      </div>
    </>
  );
}