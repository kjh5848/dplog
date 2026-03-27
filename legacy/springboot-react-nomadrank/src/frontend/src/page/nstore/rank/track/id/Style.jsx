import UtilStore from "/src/store/UtilStore.jsx";

export default function NStoreRankTrackWithIdStyle() {

  const { isPc } = UtilStore();

  /** @type {React.CSSProperties} */
  const productContainer = {
    display: "grid",
    gridTemplateColumns: isPc ? "140px minmax(0px, 1fr) 160px" : "160px minmax(0px, 1fr)",
    gap: "20px"
  };


  /** @type {React.CSSProperties} */
  const productImage = {
    height: "100%",
    width: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "10px"
  };

  /** @type {React.CSSProperties} */
  const productName = {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };

  /** @type {React.CSSProperties} */
  const mallName = {
    fontSize: "18px",
    marginTop: "5px"
  };

  /** @type {React.CSSProperties} */
  const reviewAndCategoryContainer = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px"
  };

  /** @type {React.CSSProperties} */
  const categoryAndScore = {
    opacity: "70%",
    fontSize: "15px"
  };

  /** @type {React.CSSProperties} */
  const mid = {
    height: "20px",
    fontSize: "12px",
    padding: "0 10px",
    borderRadius: "20px"
  };

  /** @type {React.CSSProperties} */
  const entryKeyContainer = {
    display: "grid",
    gridTemplateColumns: isPc ? "1fr minmax(0, 250px)" : "1fr",
    gap: "10px"
  }

  return {
    productContainer,
    productImage,
    productName,
    mallName,
    reviewAndCategoryContainer,
    categoryAndScore,
    mid,
    entryKeyContainer
  };

}