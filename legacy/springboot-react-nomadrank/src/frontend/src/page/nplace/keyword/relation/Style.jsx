export default function NplaceKeywordRelationStyle() {

  /** @type {React.CSSProperties} */
  const searchContainerPc = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 100px 1fr",
    gap: "10px"
  };

  const searchContainerMobile = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "0 1fr 100px 0",
    gap: "10px"
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
    gridTemplateColumns: "160px 1fr",
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
    maxWidth: "450px"
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
  const resultShopId = {
    height: "20px",
    fontSize: "12px",
    padding: "0 10px",
    borderRadius: "20px"
  };


  return {
    searchContainerPc,
    searchContainerMobile,
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
    resultShopId
  };

}