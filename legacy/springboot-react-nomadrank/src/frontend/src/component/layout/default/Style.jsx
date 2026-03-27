
export default function LayoutStyle() {
  /** @type {React.CSSProperties} */
  const contentContainer = {
    margin : "30px auto",
    maxWidth: "1024px"
  };

  const content = {
    marginLeft : "10px",
    marginRight : "10px"
  }

  return {
    contentContainer,
    content
  }

}