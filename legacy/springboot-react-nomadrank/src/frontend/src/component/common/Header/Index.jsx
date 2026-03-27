import HeaderStyle from "/src/component/common/Header/Style.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { PcView } from "/src/component/common/Responsive/Index.jsx";
import { useRef, useState } from "react";
import { Button, FloatingLabel, Form, Modal, Nav, Navbar, NavDropdown, Offcanvas } from "react-bootstrap";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";

export default function Header() {

  const { loginUser } = useAuthStore();

  const style = HeaderStyle();

  const location = useLocation();

  const navigate = useNavigate();

  const platform = (() => {
    if (location.pathname.includes("nplace")) {
      return "nplace";
    } else if (location.pathname.includes("nstore")) {
      return "nstore";
    } else {
      return "nplace";
    }
  })();

  const category = (() => {
    if (location.pathname.includes("rank")) {
      return "rank";
    } else if (location.pathname.includes("keyword")) {
      return "keyword";
    } else {
      return "rank";
    }
  })();

  const service = (() => {
    if (location.pathname.includes("realtime")) {
      return "realtime";
    } else if (location.pathname.includes("track")) {
      return "track";
    } else if (location.pathname.includes("relation")) {
      return "relation";
    } else {
      return "realtime";
    }
  })();

  const loginModalUsernameInputRef = useRef();
  const loginModalPasswordInputRef = useRef();
  const loginModalSubmitButtonRef = useRef();

  const [isLoginModalShow, setIsLoginModalShow] = useState(false);

  const handleLoginModalClose = () => {
    loginModalUsernameInputRef.current.value = "";
    loginModalPasswordInputRef.current.value = "";
    setIsLoginModalShow(false);
  };
  const handleLoginModalShow = () => {
    setIsLoginModalShow(true);
  };

  const handleServiceSelectChange = (event) => {
    if (platform === event.target.value) {
      return;
    }
    navigate(`/${event.target.value}/${category}/${service}`);
  };

  // const handleCategoryServiceMenuClick = (category, service) => {
  //   navigate(`/${platform}/${category}/${service}`);
  // };

  const handleLoginModalUsernameInputKeyUp = (event) => {
    if (event.key === "Enter") {
      loginModalPasswordInputRef.current.focus();
    }
  };

  const handleLoginModalPasswordInputKeyUp = (event) => {
    if (event.key === "Enter") {
      loginModalSubmitButtonRef.current.click();
    }
  };

  const [loginTrigger, loginIsPending] = usePendingFunction(async () => {
    if (loginModalUsernameInputRef.current.value === "") {
      alert("아이디를 입력해주세요.");
      loginModalUsernameInputRef.current.focus();
      return;
    }
    if (loginModalPasswordInputRef.current.value === "") {
      alert("비밀번호를 입력해주세요.");
      loginModalPasswordInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          username: loginModalUsernameInputRef.current.value,
          password: loginModalPasswordInputRef.current.value
        }
      })
    }).then((response) => response.json());
    if (dto.code === -3) {
      alert(Object.keys(dto.data).map((key) => dto.data[key]).join("\n"));
      return;
    }
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    // setLoginUser(dto.data);
    // setIsLoginModalShow(false);
    window.location.reload();
  });

  const [logoutTrigger] = usePendingFunction(async () => {
    if (confirm("로그아웃 하시겠습니까?") === false) {
      return;
    }
    const dto = await fetch(`/v1/auth/logout`, {
      method: "POST"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    window.location.reload();
  });

  return (
    <>
      <header>
        <div style={style.root}>
          <div style={style.left}>
            <div style={style.logo}>
              <PcView><span onClick={() => navigate(`/main`)} style={{cursor: "pointer"}}>내순위닷컴</span></PcView>
            </div>
            <div style={style.serviceSelectContainer}>
              <Form.Select defaultValue={platform} style={style.serviceSelect}
                           onChange={handleServiceSelectChange}>
                <option value="nplace" style={style.serviceSelect}>N플레이스</option>
                {/*<option value="nstore" style={style.serviceSelect}>N스토어</option>*/}
              </Form.Select>
            </div>
            <div style={style.menu}>
            </div>
          </div>
          <div style={style.right}>
            <div>
              {
                loginUser == null
                  ? <Button variant="primary" style={style.login} onClick={handleLoginModalShow}>로그인</Button>
                  : <Button variant="outline-primary" style={style.login} onClick={logoutTrigger}>로그아웃</Button>
              }
            </div>
            <div>
              <Navbar expand={false}>
                <Navbar.Toggle aria-controls={`offcanvas`} />
                <Navbar.Offcanvas
                  id={`offcanvasNavbar`}
                  aria-labelledby={`offcanvas`}
                  style={{ fontSize: "17px", width: "250px" }}
                  placement="end"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title id={`offcanvasTitle`}>
                    </Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <Nav>
                      <Nav.Link onClick={() => navigate(`/notice`)}>공지</Nav.Link>

                      {loginUser && loginUser.user.authority.includes('ADMIN') && (
                        <Nav.Link onClick={() => navigate(`/distributor/list`)}>관리자</Nav.Link>
                      )}

                      {loginUser && (loginUser.user.authority.includes('ADMIN') || loginUser.user.authority.includes('DISTRIBUTOR_MANAGER')) && (
                        <Nav.Link onClick={() => navigate(`/user/list`)}>회원</Nav.Link>
                      )}

                      {/* {loginUser && (
                        <Nav.Link onClick={() => navigate(`/point`)}>포인트</Nav.Link>
                      )} */}
                      
                      <Nav.Link onClick={() => navigate(`/${platform}/rank/realtime`)}>실시간순위조회</Nav.Link>
                      <Nav.Link onClick={() => navigate(`/${platform}/rank/track`)}>순위추적</Nav.Link>

                      <NavDropdown
                        title="키워드 분석"
                        id={`offcanvasNavbarDropdown`}
                      >
                        {
                          <div>
                            <NavDropdown.Item onClick={() => navigate(`/${platform}/keyword`)}>키워드 조회</NavDropdown.Item>
                          </div> 
                        }
                        {
                          <div>
                            <NavDropdown.Item onClick={() => navigate(`/${platform}/keyword/relation`)}>연관 키워드</NavDropdown.Item>
                          </div>
                        }
                      </NavDropdown>

                      {/* <Nav.Link onClick={() => navigate(`/${platform}/keyword/relation`)}>연관키워드분석</Nav.Link> */}
                      <NavDropdown
                        title="리워드"
                        id={`offcanvasNavbarDropdown`}
                      >
                        {
                          platform === "nplace" 
                          && <div>
                            <NavDropdown.Item onClick={() => navigate(`/nplace/reward/place/traffic`)}>플레이스 트래픽</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate(`/nplace/reward/place/save`)}>플레이스 저장하기</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate(`/nplace/campaign/blog-writers`)}>블로그 기자단</NavDropdown.Item>
                          </div>
                        }
                        {
                          platform === "nstore"
                          && <div>
                            <NavDropdown.Item onClick={() => navigate(`/nstore/campaign/traffic`)}>N스토어 유저유입</NavDropdown.Item>
                          </div>
                        }
                      </NavDropdown>

                      {loginUser && (loginUser.user.authority.includes('ADMIN') || loginUser.user.authority.includes('DISTRIBUTOR_MANAGER')) && (
                        <NavDropdown
                          title="리워드 관리"
                          id={`offcanvasNavbarDropdown`}
                        >
                          {
                            <div>
                              <NavDropdown.Item onClick={() => navigate(`/nplace/reward/place/info`)}>플레이스</NavDropdown.Item>
                            </div>
                          }
                          {
                            <div>
                              <NavDropdown.Item onClick={() => navigate(`/nplace/reward/blog-writers/info`)}>블로그 기자단</NavDropdown.Item>
                            </div> 
                            
                          }
                        </NavDropdown>
                      )}
                      {/* {loginUser && (
                        <NavDropdown
                          title="포인트"
                          id={`offcanvasNavbarDropdown`}
                        >
                          {
                            <div>
                              <NavDropdown.Item onClick={() => navigate(`/point/apply`)}>포인트 신청</NavDropdown.Item>
                            </div> 
                          }
                          {
                            <div>
                              <NavDropdown.Item onClick={() => navigate(`/point`)}>포인트 내역</NavDropdown.Item>
                            </div>
                          }
                        </NavDropdown>
                      )} */}
                      {loginUser && (
                        <Nav.Link onClick={() => navigate(`/group`)}>그룹 관리</Nav.Link>
                      )}
                      {loginUser && (
                        <Nav.Link onClick={() => navigate(loginUser.user.authority.includes('USER') ? `/user` : `/distributor`)}>내 정보</Nav.Link>
                      )}

                      {loginUser && (loginUser.user.authority.includes('ADMIN')) && (
                        <>
                          <hr />
                          <Nav.Link onClick={() => navigate(`/session`)}>세션관리</Nav.Link>
                        </>
                      )}

                        <hr />

                      {loginUser && (
                        <Nav.Link onClick={logoutTrigger}>로그아웃</Nav.Link>
                      )}
                      
                    </Nav>
                  </Offcanvas.Body>
                </Navbar.Offcanvas>
              </Navbar>
            </div>
          </div>
        </div>
        <Modal show={isLoginModalShow} backdrop="static" onHide={handleLoginModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>로그인</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FloatingLabel
              controlId="floatingLoginModalUsernameInput"
              label="아이디"
            >
              <Form.Control ref={loginModalUsernameInputRef} type="text" placeholder="아이디"
                            onKeyUp={handleLoginModalUsernameInputKeyUp} autoFocus />
            </FloatingLabel>
            <FloatingLabel
              controlId="floatingLoginModalPasswordInput"
              label="비밀번호"
              style={{ marginTop: "10px" }}
            >
              <Form.Control ref={loginModalPasswordInputRef} type="password" placeholder="아이디"
                            onKeyUp={handleLoginModalPasswordInputKeyUp} />
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button ref={loginModalSubmitButtonRef} variant="primary" onClick={loginTrigger} style={{ width: "75px" }}
                    disabled={loginIsPending}>
              {loginIsPending
                ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                : "로그인"}
            </Button>
          </Modal.Footer>
        </Modal>
      </header>
    </>
  );
}