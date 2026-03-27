export default function SignUpStyle() {

  /** @type {React.CSSProperties} */
  const card = {
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "2px 6px 15px 0 rgba(69, 65, 78, .1)",
    borderWidth: "0",
    maxWidth: "500px",
    width: "100%",
    margin: "0 auto"
  };

  /** @type {React.CSSProperties} */
  const cardHeader = {
    padding: "1rem 1.25rem",
    backgroundColor: "transparent",
    borderBottom: "1px solid #ebecec!important"
  }

  /** @type {React.CSSProperties} */
  const cardTitle = {
    margin: "0",
    color: "#2a2f5b",
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "1.6"    
  }

  /** @type {React.CSSProperties} */
  const cardFooter = {
    backgroundColor: "transparent",
    lineHeight: "30px",
    borderTop: "1px solid #ebecec !important",
    fontSize: "1rem"
  }

  /** @type {React.CSSProperties} */
  const formGroup = {
    margin: "0",
    padding: "10px"    
  }

  /** @type {React.CSSProperties} */
  const formLabel = {
    fontSize: "0.9rem"
  }

  return {
    card,
    cardHeader,
    cardTitle,
    cardFooter,
    formGroup,
    formLabel
  };

}