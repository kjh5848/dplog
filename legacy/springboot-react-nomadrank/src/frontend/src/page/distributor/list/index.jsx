import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import usePendingFunction from "../../../use/usePendingFunction";
import { useEffect, useRef, useState } from "react";
import DistributorListStyle from "./Style";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';
export default function DistributorListPage() {

  const style = DistributorListStyle();

  const navigate = useNavigate();

  const [searchResult, setSearchResult] = useState(undefined);

  const [getDistributorListTrigger, getDistributorListIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/distributor/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSearchResult(dto.data);
  });

  useEffect(() => {
    getDistributorListTrigger();
  }, []);

  useEffect(() => {
    if (getDistributorListIsPending) {
      setSearchResult(undefined);
    }
  }, [getDistributorListIsPending]);

  const [isDistributorModalShow, setIsDistributorModalShow] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);  // 선택된 유저 정보 상태 추가
  const distributorModalCompanyNameInputRef = useRef();
  const distributorModalUsernameInputRef = useRef();
  const distributorModalPasswordInputRef = useRef();
  const distributorModalTelInputRef = useRef();
  const distributorModalEmailInputRef = useRef();
  const distributorModalDepositInputRef = useRef();
  const distributorModalAccountNumberInputRef = useRef();
  const distributorModalBankNameInputRef = useRef();
  const distributorModalGoogleSheetUrlInputRef = useRef();
  const distributorModalGoogleCredentialJsonInputRef = useRef();
  const distributorModalMemoInputRef = useRef();

  const openDistributorDetail = (distributor) => {
    setSelectedDistributor(distributor);  // 선택된 유저 정보 저장
    setIsDistributorModalShow(true);  // 모달 열기
  };

  useEffect(() => {
    // 모달이 열릴 때만 selectedDistributor 값이 있을 경우 Ref 세팅
    if (isDistributorModalShow && selectedDistributor) {
      distributorModalCompanyNameInputRef.current.value = selectedDistributor.companyName;
      distributorModalUsernameInputRef.current.value = selectedDistributor.username;
      distributorModalTelInputRef.current.value = selectedDistributor.tel;
      distributorModalEmailInputRef.current.value = selectedDistributor.email;
      distributorModalDepositInputRef.current.value = selectedDistributor.deposit;
      distributorModalAccountNumberInputRef.current.value = selectedDistributor.accountNumber;
      distributorModalBankNameInputRef.current.value = selectedDistributor.bankName;
      distributorModalGoogleSheetUrlInputRef.current.value = selectedDistributor.googleSheetUrl;
      distributorModalGoogleCredentialJsonInputRef.current.value = selectedDistributor.googleCredentialJson;
      distributorModalMemoInputRef.current.value = selectedDistributor.memo;
    }
  }, [isDistributorModalShow, selectedDistributor]);  // 모달 상태와 선택된 유저 정보 변화에 반응

  const handleDistributorModalClose = () => {
    resetDistributorModal();
    setIsDistributorModalShow(false);
  };

  const resetDistributorModal = () => {
    distributorModalCompanyNameInputRef.current.value = "";
    distributorModalUsernameInputRef.current.value = "";
    distributorModalPasswordInputRef.current.value = "";
    distributorModalTelInputRef.current.value = "";
    distributorModalEmailInputRef.current.value = "";
    distributorModalDepositInputRef.current.value = "";
    distributorModalAccountNumberInputRef.current.value = "";
    distributorModalBankNameInputRef.current.value = "";
    distributorModalGoogleSheetUrlInputRef.current.value = "";
    distributorModalGoogleCredentialJsonInputRef.current.value = "";
    distributorModalMemoInputRef.current.value = "";
    setSelectedDistributor(null);  // 선택된 유저 정보 초기화
  };

  const putDistributorTrigger = async () => {

    if (distributorModalTelInputRef.current.value === "") {
      alert("연락처를 입력해주세요.");
      distributorModalTelInputRef.current.focus();
      return;
    }
    if (distributorModalEmailInputRef.current.value === "") {
      alert("이메일을 입력해주세요.");
      distributorModalEmailInputRef.current.focus();
      return;
    }
    if (distributorModalDepositInputRef.current.value === "") {
      alert("예금주을 입력해주세요.");
      distributorModalDepositInputRef.current.focus();
      return;
    }
    if (distributorModalAccountNumberInputRef.current.value === "") {
      alert("계좌번호를 입력해주세요.");
      distributorModalAccountNumberInputRef.current.focus();
      return;
    }
    if (distributorModalBankNameInputRef.current.value === "") {
      alert("은행명을 입력해주세요.");
      distributorModalBankNameInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/distributor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        distributor: {
          userId: selectedDistributor.userId,
          distributorId: selectedDistributor.distributorId,
          password: distributorModalPasswordInputRef.current.value,
          tel: distributorModalTelInputRef.current.value,
          email: distributorModalEmailInputRef.current.value,
          deposit: distributorModalDepositInputRef.current.value,
          accountNumber: distributorModalAccountNumberInputRef.current.value,
          bankName: distributorModalBankNameInputRef.current.value,
          googleSheetUrl: distributorModalGoogleSheetUrlInputRef.current.value,
          googleCredentialJson: distributorModalGoogleCredentialJsonInputRef.current.value,
          memo: distributorModalMemoInputRef.current.value
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("관리자 정보가 수정되었습니다.");
    handleDistributorModalClose();
    getDistributorListTrigger();
  }

  const testSheetAccess = async () => {
    const sheetUrl = distributorModalGoogleSheetUrlInputRef.current.value;
    const credentialJson = distributorModalGoogleCredentialJsonInputRef.current.value;

    if (!sheetUrl) {
      Swal.fire({
        icon: "info",
        title: "",
        text: "구글 시트 URL를 입력하세요.",
      });
      return;
    }

    if (!credentialJson) {
      Swal.fire({
        icon: "info",
        title: "",
        text: "구글 인증키를 입력하세요.",
      });
      return;
    }

    const dto = await fetch(`/v1/google/test-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        googleSheetInfo: {
          googleSheetUrl: distributorModalGoogleSheetUrlInputRef.current.value,
          googleCredentialJson: distributorModalGoogleCredentialJsonInputRef.current.value
        }
      })
    }).then((response) => response.json())
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    if (!dto.data.success) {
      alert(dto.data.message);
      return;
    } else {
      Swal.fire({
        text: "테스트가 성공했습니다.",
        icon: "success"
      });
    }
  };

  return ( 
    <LayoutDefault>
      <Button variant="primary" onClick={() => navigate(`/distributor/add`)}>관리자 등록</Button>
      <hr style={style.searchResultDivider} />
      <Table striped hover>
        <thead>
          <tr>
            <th>관리자명</th>
            <th>관리자 아이디</th>
            <th>연락처</th>
            <th>이메일</th>
            <th>예금주</th>
            <th>계좌번호</th>
            <th>은행명</th>
            <th>포인트</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            if (searchResult === undefined) {
              return (
                <tr>
                  <th colSpan={8}></th>
                </tr>
              );
            }
            else if (!searchResult || searchResult.distributorList.length === 0) {
              return (
                <tr>
                  <th colSpan={8}>관리자가 존재하지 않습니다.</th>
                </tr>
              );
            } else {
              return searchResult.distributorList.map((item, index) => {
                return (
                  <tr key={index} onClick={() => openDistributorDetail(item)} style={{ cursor: 'pointer' }}>
                    <td>{item.companyName}</td>
                    <td>{item.username}</td>
                    <td>{item.tel}</td>
                    <td>{item.email}</td>
                    <td>{item.deposit}</td>
                    <td>{item.accountNumber}</td>
                    <td>{item.bankName}</td>
                    <td><Button variant="primary" size="sm" onClick={() => navigate(`/product/${item.userId}`)}>설정</Button>{' '}</td>
                  </tr>
                );
              });
            }
          })()}
        </tbody>
      </Table>

      <Modal show={isDistributorModalShow} scrollable size={"lg"} backdrop="static" onHide={handleDistributorModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>관리자 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Row className="align-items-center">
            <Col xs={4}>
              <label>관리자명</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalCompanyNameInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>관리자 아이디</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalUsernameInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>관리자 비밀번호</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="비밀번호 변경 시 새 비밀번호를 입력하세요." ref={distributorModalPasswordInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>연락처</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalTelInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>이메일</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalEmailInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>예금주</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalDepositInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>계좌번호</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalAccountNumberInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>은행명</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalBankNameInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>구글시트URL</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalGoogleSheetUrlInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>구글 인증키</label>
              <div>
                <Button variant="outline-primary" onClick={testSheetAccess}>테스트</Button>
              </div>
            </Col>
            <Col xs={8}>
              <Form.Control as="textarea" rows={5} placeholder="" ref={distributorModalGoogleCredentialJsonInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>메모</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="" ref={distributorModalMemoInputRef} />
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