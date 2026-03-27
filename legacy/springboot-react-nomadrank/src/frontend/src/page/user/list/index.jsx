import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import usePendingFunction from "../../../use/usePendingFunction";
import { useEffect, useRef, useState } from "react";
import UserListStyle from "./Style";
import MembershipModal from './MembershipModal';
import { useNavigate } from "react-router-dom";

export default function UserListPage() {

  const authStore = useAuthStore();

  const style = UserListStyle();

  const navigate = useNavigate();

  const [isUserModalShow, setIsUserModalShow] = useState(false);
  const [isMembershipModalShow, setIsMembershipModalShow] = useState(false);
  const [isDistributorModalShow, setIsDistributorModalShow] = useState(false);
  const [selectedMembershipUser, setSelectedMembershipUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const userModalUsernameInputRef = useRef();
  const userModalPasswordInputRef = useRef();
  const userModalCompanyNameInputRef = useRef();
  const userModalTelInputRef = useRef();
  const userModalStatusInputRef = useRef();
  const distributorModalDistributorIdRef = useRef();

  const openUserDetail = (user) => {
    setSelectedUser(user);
    setIsUserModalShow(true);
  };

  const openDistirbutor = (user) => {
    getDistributorListTrigger();
    setSelectedUser(user);
    setIsDistributorModalShow(true);
  };

  useEffect(() => {
    if (isUserModalShow && selectedUser) {
      userModalUsernameInputRef.current.value = selectedUser.username;
      userModalCompanyNameInputRef.current.value = selectedUser.companyName;
      userModalTelInputRef.current.value = selectedUser.tel;
      userModalStatusInputRef.current.value = selectedUser.status;
    }
  }, [isUserModalShow, selectedUser]);

  const handleMembershipModalOpen = (user) => {
    setSelectedMembershipUser(user);
    setIsMembershipModalShow(true);
  };

  const handleMembershipModalClose = () => {
    setIsMembershipModalShow(false);
    setSelectedMembershipUser(null);
  };

  const handleUserModalClose = () => {
    resetUserModal();
    setIsUserModalShow(false);
  };

  const handleDistributorModalClose = () => {
    resetDistributorModal();
    setIsDistributorModalShow(false);
  };


  const resetUserModal = () => {
    userModalUsernameInputRef.current.value = "";
    userModalPasswordInputRef.current.value = "";
    userModalCompanyNameInputRef.current.value = "";
    userModalTelInputRef.current.value = "";
    userModalStatusInputRef.current.value = "";
    setSelectedUser(null);
  };

  const resetDistributorModal = () => {
    userModalUsernameInputRef.current.value = "";
    distributorModalDistributorIdRef.current.value = "";
    setSelectedUser(null);
  };

  const putUserTrigger = async () => {

    if (userModalCompanyNameInputRef.current.value === "") {
      alert("업체명을 입력해주세요.");
      userModalCompanyNameInputRef.current.focus();
      return;
    }
    // if (userModalTelInputRef.current.value === "") {
    //   alert("연락처를 입력해주세요.");
    //   userModalTelInputRef.current.focus();
    //   return;
    // }

    const dto = await fetch(`/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          userId: selectedUser.userId,
          username: userModalUsernameInputRef.current.value,
          password: userModalPasswordInputRef.current.value,
          companyName: userModalCompanyNameInputRef.current.value,
          tel: userModalTelInputRef.current.value,
          status: userModalStatusInputRef.current.value,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("유저 정보가 수정되었습니다.");
    handleUserModalClose();
    getUserListTrigger();
  }

  const putDistributorTrigger = async () => {

    if (distributorModalDistributorIdRef.current.value === "") {
      alert("관리자를 입력해주세요.");
      distributorModalDistributorIdRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/user/distributor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          userId: selectedUser.userId,
          distirbutorId: distributorModalDistributorIdRef.current.value,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("유저의 관리자가 변경되었습니다.");
    handleDistributorModalClose();
    getUserListTrigger();
  }

  const [searchResult, setSearchResult] = useState(undefined);
  const [distributorList, setDistributorList] = useState(undefined);

  const [getUserListTrigger, getUserListIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/user/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSearchResult(dto.data);
  });

  const [getDistributorListTrigger, getDistributorListIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/distributor/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setDistributorList(dto.data.distributorList);
  });

  useEffect(() => {
    if (isDistributorModalShow && selectedUser && !getDistributorListIsPending) {
      userModalUsernameInputRef.current.value = selectedUser.username;
      distributorModalDistributorIdRef.current.value = selectedUser.distributorId;
    }
  }, [isDistributorModalShow, selectedUser, getDistributorListIsPending]);

  const completeUser = async (user) => {
    const dto = await fetch(`/v1/user/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          userName: user.username
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("승인되었습니다.");
      location.reload();
    }
    
  };

  const withdrawUser = async (user) => {
    const dto = await fetch(`/v1/user/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          userName: user.username
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("거부되었습니다.");
      location.reload();
    }
    
  };

  useEffect(() => {
    getUserListTrigger();
  }, []);

  useEffect(() => {
    if (getUserListIsPending) {
      setSearchResult(undefined);
    }
  }, [getUserListIsPending]);

  return ( 
    <LayoutDefault>
      <Button variant="primary" onClick={() => navigate(`/user/add`)}>유저 등록</Button>
      <hr style={style.searchResultDivider} />
      <Table striped hover>
        <thead>
          <tr>
            <th>아이디</th>
            <th>업체명</th>
            <th>연락처</th>
            <th>상태</th>
            <th>최근 로그인 일시</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            if (searchResult === undefined) {
              return (
                <tr>
                  <th colSpan={4}></th>
                </tr>
              );
            }
            else if (!searchResult || searchResult.userList.length === 0) {
              return (
                <tr>
                  <th colSpan={4}>유저가 존재하지 않습니다.</th>
                </tr>
              );
            } else {
              return searchResult.userList.map((user, index) => {
                return (
                  <tr key={index} style={{ cursor: 'pointer' }}>
                    <td>{user.username}</td>
                    <td>{user.companyName}</td>
                    <td>{user.tel}</td>
                    <td>
                      {
                        (() => {
                          return user.status === "WAITING" ? 
                            authStore.loginUser.user.authority.includes("ADMIN") ? (
                              <>
                                <Button variant="primary" size="sm" className="me-2" onClick={() => {completeUser(user)}}>승인</Button>{' '}
                                <Button variant="primary" size="sm" onClick={() => {withdrawUser(user)}}>거부</Button>{' '}
                              </>
                            ) : "대기" 
                          : user.status === "COMPLETION" ? "승인" : "중지"
                        })()
                      }
                    </td>
                    <td>{user.lastLoginDate ? user.lastLoginDate.split(".")[0].replace("T", " ") : "-"}</td>
                    <td>
                    <Button 
                      variant="primary" 
                      className="me-2 btn-sm" 
                      onClick={() => handleMembershipModalOpen(user)}  // 수정
                    >
                      멤버십 관리
                    </Button>
                    {selectedMembershipUser && (  // 조건부 렌더링 추가
                      <MembershipModal 
                        show={isMembershipModalShow}
                        handleClose={handleMembershipModalClose}  // 수정
                        user={selectedMembershipUser}  // 수정
                      />
                    )}
                    <Button 
                      variant="primary" 
                      className="me-2 btn-sm" 
                      onClick={() => openUserDetail(user)}
                    >
                      회원 관리
                    </Button>
                    <Button 
                      variant="primary" 
                      className="btn-sm" 
                      onClick={() => openDistirbutor(user)}
                    >
                      관리자 변경
                    </Button>
                    </td>
                  </tr>
                );
              });
            }
          })()}
        </tbody>
      </Table>

      <Modal show={isUserModalShow} scrollable size={"lg"} backdrop="static" onHide={handleUserModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>유저 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Row className="align-items-center">
            <Col xs={4}>
              <label>유저 아이디</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={userModalUsernameInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>관리자 비밀번호</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="비밀번호 변경 시 새 비밀번호를 입력하세요." ref={userModalPasswordInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>업체명</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={userModalCompanyNameInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>연락처</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={userModalTelInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>상태</label>
            </Col>
            <Col xs={8}>
              <Form.Select ref={userModalStatusInputRef}>
                <option value="">선택</option>
                <option value="COMPLETION">승인</option>
                <option value="STOP">중지</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xs={5}>
              <Button
                variant="outline-primary"
                style={{ width: "100%" }}
                onClick={putUserTrigger}
              >
                수정
              </Button>
            </Col>
            <Col xs={2}></Col>
            <Col xs={5}>
              <Button
                variant="outline-secondary"
                style={{ width: "100%" }}
                onClick={handleUserModalClose}
              >
                닫기
              </Button>
            </Col>
          </Row>

        </Modal.Body>
      </Modal>

      <Modal show={isDistributorModalShow} scrollable size={"lg"} backdrop="static" onHide={handleDistributorModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>관리자 변경</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Row className="align-items-center">
            <Col xs={4}>
              <label>유저 아이디</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={userModalUsernameInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
          <Col xs={4}>
            <label>관리자</label>
          </Col>
          <Col xs={8}>
            <Form.Select ref={distributorModalDistributorIdRef}>
              {distributorList ? distributorList.map(distributor => (
                <option key={distributor.distributorId} value={distributor.distributorId}>
                  {distributor.username}
                </option>
              )) : ""}
            </Form.Select>
          </Col>
        </Row>

          <Row className="mt-4">
            <Col xs={5}>
              <Button
                variant="outline-primary"
                style={{ width: "100%" }}
                onClick={putDistributorTrigger}
              >
                수정
              </Button>
            </Col>
            <Col xs={2}></Col>
            <Col xs={5}>
              <Button
                variant="outline-secondary"
                style={{ width: "100%" }}
                onClick={handleDistributorModalClose}
              >
                닫기
              </Button>
            </Col>
          </Row>

        </Modal.Body>
      </Modal>
      
  </LayoutDefault>
  )
}