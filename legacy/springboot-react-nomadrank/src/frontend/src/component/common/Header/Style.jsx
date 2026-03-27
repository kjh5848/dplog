
export default function HeaderStyle() {

  /** @type {React.CSSProperties} */
  const mouseHand = {
    cursor: "pointer"
  };

  /** @type {React.CSSProperties} */
  const root = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "80px",
    backgroundColor: "white"
    // minWidth: "768px"
  };

  /** @type {React.CSSProperties} */
  const logo = {
    marginLeft: "20px",
    marginRight: "10px",
    marginBottom: "5px",
    fontSize: "30px",
    fontWeight: "bold",
    color: "dodgerblue",
    ...mouseHand
  };

  /** @type {React.CSSProperties} */
  const left = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  };

  /** @type {React.CSSProperties} */
  const right = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: "20px"
  };

  /** @type {React.CSSProperties} */
  const serviceSelectContainer = {
    // marginRight: "50px"
  };

  const serviceSelect = {
    fontSize: "18px",
    fontWeight: "bold"
  };

  /** @type {React.CSSProperties} */
  const menu = {
    display: "flex",
    gap: "50px",
    fontSize: "20px"
  };

  const login = {
    marginRight: "20px"
  };


  return {
    mouseHand,
    root,
    logo,
    left,
    right,
    serviceSelectContainer,
    serviceSelect,
    menu,
    login
  };

}