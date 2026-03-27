export default function NplaceKeywordStyle() {

  /** @type {React.CSSProperties} */
  const card = {
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "2px 6px 15px 0 rgba(69, 65, 78, .1)",
    borderWidth: "0",
    maxWidth: "1024px",
    margin: "0 auto"
  };

  /** @type {React.CSSProperties} */
  const textarea = {
    resize: "none",
    height: "150px"
  };

  return {
    card,
    textarea
  };

}