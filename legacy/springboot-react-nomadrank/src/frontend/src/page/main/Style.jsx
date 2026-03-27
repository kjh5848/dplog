export default function MainStyle() {

  /** @type {React.CSSProperties} */
  const container = {
    maxWidth: "1200px",
    margin: "auto",
    padding: "20px"
  }

  /** @type {React.CSSProperties} */
  const headerText = {
    color: "#4e2c69",
    fontWeight: "bold",
    fontSize: "24px"
  };

  /** @type {React.CSSProperties} */
  const subText = {
    color: "#575757",
    fontSize: "18px",
    fontWeight: "bold"
  };

  /** @type {React.CSSProperties} */
  const largeText = {
    color: "#4e2c69"
  };

  /** @type {React.CSSProperties} */
  const cityButton = {
    color: "#4e2c69",
    borderRadius: "20px",
    padding: "5px 20px",
    fontWeight: "bold",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
  };

  /** @type {React.CSSProperties} */
  const searchBox = {
    border: "2px solid #9095a0",
    borderRadius: "10px",
    background: "white"
  };

  /** @type {React.CSSProperties} */
  const inputBox = {
    padding: "20px",
    border: "2px solid #e0e0e0",
    textAlign: "center"
  }

  /** @type {React.CSSProperties} */
  const trackButton = {
    backgroundColor: "#4e2c69",
    color: "white",
    padding: "10px 20px",
    fontWeight: "bold",
    border: "none",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
  };

  /** @type {React.CSSProperties} */
  const card = {
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
    backgroundColor: "white"
  };

  /** @type {React.CSSProperties} */
  const listItem = {
    marginBottom: "10px",
    fontSize: "14px"
  };

  /** @type {React.CSSProperties} */
  const moneyText = {
    color: "#4f46e5",
  };

  /** @type {React.CSSProperties} */
  const countButton = {
    color: "#4f46e5",
    backgroundColor: "#f0f7ff",
    borderRadius: "15px",
    border: "none",
  };

  /** @type {React.CSSProperties} */
  const subscribeButton = {
    backgroundColor: "#4f46e5",
    color: "white",
    borderRadius: "5px",
    border: "none",
    padding: "10px"
  };

  /** @type {React.CSSProperties} */
  const membershipCard = {
    backgroundColor: "#e1dfdf",
    border: "none"
  };

  /** @type {React.CSSProperties} */
  const popularMembershipCard = {
    backgroundColor: "#f8faff",
    border: "2px solid #4f46e5"
  }

  /** @type {React.CSSProperties} */
  const popularButton = {
    backgroundColor: "#4f46e5",
    position: "absolute",
    top: "-15px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "3px 15px",
    borderRadius: "20px"
  }

  return {
    container,
    largeText,
    cityButton,
    searchBox,
    inputBox,
    trackButton,
    card,
    listItem,
    headerText,
    subText,
    countButton,
    moneyText,
    subscribeButton,
    membershipCard,
    popularMembershipCard,
    popularButton
  };

}