import { useUtilStore } from "/src/store/StoreProvider.jsx";

export default function NplaceRewardPlaceStyle() {
  const { isPc } = useUtilStore();

  /** @type {React.CSSProperties} */
  const searchResultDivider = {
    marginTop: "30px",
    marginBottom: "30px"
  };

  /** @type {React.CSSProperties} */
  const trackableButtonContainer = {
    display: "flex",
    alignItems: "center",
    justifyContent: "end"
  };

  /** @type {React.CSSProperties} */
  const trackableModalInputContainer = {
    marginTop: "10px",
    display: "grid",
    gridTemplateColumns: isPc ? "3fr 1fr" : "1fr",
    gap: "10px"
  };

  /** @type {React.CSSProperties} */
  const trackableModalExampleContainer = {
    fontSize: "12px",
    fontWeight: "bold"
  }

  /** @type {React.CSSProperties} */
  const tableImage = {
    width: "70px",
    height: "70px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "10px"
  };

  return {
    trackableButtonContainer,
    trackableModalInputContainer,
    trackableModalExampleContainer,
    searchResultDivider,
    tableImage
  };

}