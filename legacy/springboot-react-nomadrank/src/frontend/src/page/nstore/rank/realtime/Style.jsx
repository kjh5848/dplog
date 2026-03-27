import UtilStore from "/src/store/UtilStore.jsx";

export default function NstoreRankRealtimeStyle() {

  const { isPc } = UtilStore();

  /** @type {React.CSSProperties} */
  const searchContainerPc = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 0px 100px",
    gap: "10px"
  };

  /** @type {React.CSSProperties} */
  const searchContainerMobile = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  };

  /** @type {React.CSSProperties} */
  const searchCatalogCheckBoxContainer = {
    marginTop: "20px",
    display: "flex",
    justifyContent: "end"
  };

  /** @type {React.CSSProperties} */
  const midSearchButton = {
    marginLeft: "5px"
  };

  /** @type {React.CSSProperties} */
  const searchResultDivider = {
    marginTop: "30px",
    marginBottom: "30px"
  };

  /** @type {React.CSSProperties} */
  const noResult = {
    fontSize: "17px",
    fontWeight: "bold",
    textAlign: "center"
  };

  /** @type {React.CSSProperties} */
  const resultCardBody = {
    display: "grid",
    gridTemplateColumns: isPc ? "140px minmax(0px, 1fr) 160px" : "160px minmax(0px, 1fr)",
    gap: "20px"
  };

  /** @type {React.CSSProperties} */
  const resultImageRankContainer = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "34px 1fr",
    gap: "5px"
  };


  /** @type {React.CSSProperties} */
  const resultImage = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "10px"
  };

  /** @type {React.CSSProperties} */
  const resultButtonContainer = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "5px"
  };

  /** @type {React.CSSProperties} */
  const resultRank = {
    fontSize: "25px",
    fontWeight: "bolder",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };

  /** @type {React.CSSProperties} */
  const resultShopName = {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };

  /** @type {React.CSSProperties} */
  const resultAddress = {
    fontSize: "18px",
    marginTop: "5px"
  };

  /** @type {React.CSSProperties} */
  const resultReviewAndCategoryContainer = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px"
  };

  /** @type {React.CSSProperties} */
  const resultCategoryAndScore = {
    opacity: "70%",
    fontSize: "15px"
  };

  /** @type {React.CSSProperties} */
  const resultMid = {
    height: "20px",
    fontSize: "12px",
    padding: "0 10px",
    borderRadius: "20px"
  };

  /** @type {React.CSSProperties} */
  const resultLowMallListContainer = {
    borderLeft: "rgba(200, 200, 200, 0.5) solid 1px",
    paddingLeft: "5px"
  };

  /** @type {React.CSSProperties} */
  const resultLowMallListTitle = {
    fontSize: "15px",
    fontWeight: "bold"
  };

  /** @type {React.CSSProperties} */
  const resultLowMallContainer = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "rgb(116, 116, 116)",
    marginTop: "5px"
  };

  /** @type {React.CSSProperties} */
  const resultLowMallName = {
    width: "80px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };

  return {
    searchContainerPc,
    searchContainerMobile,
    searchCatalogCheckBoxContainer,
    midSearchButton,
    searchResultDivider,
    noResult,
    resultCardBody,
    resultImageRankContainer,
    resultImage,
    resultButtonContainer,
    resultRank,
    resultShopName,
    resultAddress,
    resultReviewAndCategoryContainer,
    resultCategoryAndScore,
    resultMid,
    resultLowMallListContainer,
    resultLowMallListTitle,
    resultLowMallContainer,
    resultLowMallName
  };

}