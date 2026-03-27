import { useMediaQuery } from "react-responsive";

const UtilStore = () => {
  const isPc = useMediaQuery({ query: "(min-width: 601px)" });

  return {
    isPc
  };
};

export default UtilStore;
