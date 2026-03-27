import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Stack, Table } from "react-bootstrap";
import NplaceCampaignTrafficWithIdStyle from "./Style";


export default function NplaceCampaignTrafficWithIdPage() {

  const { loginUser } = useAuthStore();

  const style = NplaceCampaignTrafficWithIdStyle();

  const { id } = useParams();

  const navigate = useNavigate();

  const [shopWithIdResult, setShopWithIdResult] = useState();

  // const [formData, setFormData] = useState({
  //   // nplaceCampaignTrafficKeywordTraffic: {},
  //   nplaceCampaignTrafficRegister: {}
  // });

  const [getShopWithIdTrigger] = usePendingFunction(async () => {

    const dto = await fetch(`/v1/nplace/campaign/traffic/shop/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      navigate(`/nplace/campaign/traffic`, { replace: true });
      return;
    }
    setShopWithIdResult(dto.data);

    if (dto.data.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList.length > 0 && selectedKeywordIndex == undefined) {
      setSelectedKeyword(0);
    }
  });

  useEffect(() => {
    getShopWithIdTrigger();
  }, []);

  const [selectedKeywordIndex, setSelectedKeyword] = useState(undefined);

  const handleKeywordBadgeClick = (keyword, keywordIndex) => {
    if (selectedKeywordIndex !== keywordIndex) {
      setSelectedKeyword(keywordIndex);
    }
  };

  const handleKeywordBadgeRightClick = async (event, keywordId, keyword, keywordIndex) => {
    event.preventDefault();
    if (prompt(`키워드를 삭제하시려면 해당 키워드(${keyword})를 입력해주세요.\n삭제 후 다시 등록할 경우 과거 데이터는 복구되지 않습니다.`) !== keyword) {
      return;
    }
    const dto = await fetch(`/v1/nplace/campaign/traffic/keyword/${keywordId}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    if (selectedKeywordIndex === keywordIndex) {
      setSelectedKeyword(null);
    }
    getShopWithIdTrigger();
    alert(`${keyword} 키워드를 삭제했습니다.`);
  };

  const [deleteShopTrigger, deleteShopIsPending] = usePendingFunction(async () => {
    if (!confirm(`정말로 플레이스를 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 데이터는 복구되지 않습니다.`)) {
      return;
    }
    const dto = await fetch(`/v1/nplace/campaign/traffic/shop/${id}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("플레이스를 삭제했습니다.");
    navigate(`/nplace/campaign/traffic`, { replace: true });
  });

  const nplaceCampaignTrafficKeywordTrafficList = useMemo(() => {
    if (shopWithIdResult && selectedKeywordIndex != null) {
      return shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList[selectedKeywordIndex].nplaceCampaignTrafficKeywordTrafficList
        .toSorted((a, b) => a.createDate > b.createDate ? -1 : 1);
    }
    return [];
  }, [shopWithIdResult, selectedKeywordIndex]);

  const copyToClipboard = (text) => {
    window.navigator.clipboard.writeText(text);
    alert(`SHOP_ID ${text} 복사되었습니다.`);
  };

  // const keywordTrafficModalKeywordTrafficInputRef = useRef();
  // const keywordTrafficModalSearchButtonRef = useRef();

  // const [isKeywordTrafficModalShow, setIsKeywordTrafficModalShow] = useState(false);
  // const handleKeywordTrafficModalClose = () => {
  //   keywordTrafficModalKeywordTrafficInputRef.current.value = "";
  //   setKeywordTrafficResult(null);
  //   setIsKeywordTrafficModalShow(false);
  // };
  // const handleKeywordTrafficModalShow = () => {
  //   setIsKeywordTrafficModalShow(true);
  // };

  // const handleKeywordTrafficModalUrlInputKeyUp = (event) => {
  //   if (event.key === "Enter") {
  //     keywordTrafficModalSearchButtonRef.current.click();
  //   }
  // };

  // const [keywordTrafficResult, setKeywordTrafficResult] = useState(null);

  // const peakDate = keywordTrafficResult?.ndatalabSearchKeywordTraffic?.peakDate;

  // const [getKeywordTrafficTrigger, getKeywordTrafficIsPending] = usePendingFunction(async () => {
  //   if (keywordTrafficModalKeywordTrafficInputRef.current.value === "") {
  //     alert("키워드 트래픽을 입력해주세요.");
  //     keywordTrafficModalKeywordTrafficInputRef.current.focus();
  //     return;
  //   }
  //   const dto = await fetch(`/v1/nplace/campaign/traffic/search/keyword-traffic?keyword=${shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList[selectedKeywordIndex].keyword}&keywordTraffic=${keywordTrafficModalKeywordTrafficInputRef.current.value}`, {
  //     method: "GET"
  //   }).then((response) => response.json());
  //   if (dto.code === -8) {
  //     alert("검색 결과가 없습니다.");
  //     return;
  //   }
  //   if (dto.code !== 0) {
  //     alert(dto.message);
  //     return;
  //   }
  //   setKeywordTrafficResult(dto.data);
  // });

  // useEffect(() => {
  //   if (getKeywordTrafficIsPending) {
  //     setKeywordTrafficResult(null);
  //   }
  // }, [getKeywordTrafficIsPending]);

  // const [postKeywordTrafficTrigger] = usePendingFunction(async () => {
  //   if (keywordTrafficModalKeywordTrafficInputRef.current.value === "") {
  //     alert("키워드 트래픽을 입력해주세요.");
  //     keywordTrafficModalKeywordTrafficInputRef.current.focus();
  //     return;
  //   }

  //   const dto = await fetch(`/v1/nplace/campaign/traffic/keyword-traffic`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       nplaceCampaignTrafficKeywordTraffic: {
  //         keywordTraffic: keywordTrafficModalKeywordTrafficInputRef.current.value,
  //         keywordId: shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList[selectedKeywordIndex].id,
  //         shopId: shopWithIdResult ? shopWithIdResult.nplaceCampaignTrafficShop.shopId : ""
  //       }
  //     })
  //   }).then((response) => response.json());
  //   if (dto.code !== 0) {
  //     alert(dto.message);
  //     return;
  //   }
  //   alert("키워드 트래픽을 추가했습니다.");
  //   handleKeywordTrafficModalClose();
  //   getShopWithIdTrigger();
  // });

  // 유입 신청 모달 관련
  const [isTrafficRegisterModalShow, setIsTrafficRegisterModalShow] = useState(false);
  const trafficRegisterModalStartDateInputRef = useRef();
  const trafficRegisterModalEndDateInputRef = useRef();
  const trafficRegisterModaSearchInputRef = useRef();
  const trafficRegisterModalUrlInputRef = useRef();
  const trafficRegisterModalShopNameInputRef = useRef();
  const trafficRegisterModalGoalInputRef = useRef();

  const handleTrafficRegisterModalShow = () => {
    setIsTrafficRegisterModalShow(true);
  };

  const handleTrafficRegisterModalClose = () => {
    resetTrafficRegisterModal();
    setIsTrafficRegisterModalShow(false);
  };

  const resetTrafficRegisterModal = () => {
    trafficRegisterModalStartDateInputRef.current.value = "";
    trafficRegisterModalEndDateInputRef.current.value = "";
    trafficRegisterModaSearchInputRef.current.value = "";
    trafficRegisterModalGoalInputRef.current.value = "";
  };

  const [postTrafficRegisterTrigger, postTrafficRegisterIsPending] = usePendingFunction(async () => {
    const startDateValue = trafficRegisterModalStartDateInputRef.current.value;
    const endDateValue = trafficRegisterModalEndDateInputRef.current.value;
    const currentDate = new Date(); // 오늘 날짜
    const currentHour = currentDate.getHours(); // 현재 시간 (24시간 기준)

    if (startDateValue === "") {
      alert("시작일을 입력해주세요.");
      trafficRegisterModalStartDateInputRef.current.focus();
      return;
    }

    const startDate = new Date(`${startDateValue} 00:00:00`); // 입력된 시작일자

    const dayOfWeek = startDate.getDay(); // 0: 일요일, 6: 토요일
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert("주말은 시작일로 지정할 수 없습니다.");
      trafficRegisterModalStartDateInputRef.current.focus();
      return;
    }
    
    // 오후 1시 이전 조건
    if (currentHour < 13) {
      if (startDate <= currentDate) {
        alert("시작일자는 오늘일자보다 같거나 이전일 수 없습니다.");
        trafficRegisterModalStartDateInputRef.current.focus();
        return;
      }
    }
    // 오후 1시 이후 조건
    // else {
    //   const minStartDate = new Date();
    //   minStartDate.setDate(currentDate.getDate() + 1);
  
    //   if (startDate < minStartDate) {
    //     alert("시작일자는 오늘일자보다 최소 2일 이후부터 가능합니다.");
    //     trafficRegisterModalStartDateInputRef.current.focus();
    //     return;
    //   }
    // }

    if (endDateValue === "") {
      alert("종료일을 입력해주세요.");
      trafficRegisterModalEndDateInputRef.current.focus();
      return;
    }
  
    const endDate = new Date(`${endDateValue} 23:59:59`);

    if (endDate < startDate) {
      alert("종료일은 시작일보다 작을 수 없습니다.");
      trafficRegisterModalEndDateInputRef.current.focus();
      return;
    }

    // 종료일이 시작일부터 5일 이내여야 함
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 5); // 시작일 + 5일
  
    if (endDate > maxEndDate) {
      alert("종료일은 시작일부터 5일 이내여야 합니다.");
      trafficRegisterModalEndDateInputRef.current.focus();
      return;
    }

    if (trafficRegisterModaSearchInputRef.current.value === "") {
      alert("검색어를 입력해주세요.");
      trafficRegisterModaSearchInputRef.current.focus();
      return;
    }

    if (trafficRegisterModalUrlInputRef.current.value === "") {
      alert("플레이스 URL를 입력해주세요.");
      trafficRegisterModalUrlInputRef.current.focus();
      return;
    }

    if (trafficRegisterModalShopNameInputRef.current.value === "") {
      alert("업체명을 입력해주세요.");
      trafficRegisterModalShopNameInputRef.current.focus();
      return;
    }

    if (trafficRegisterModalGoalInputRef.current.value === "") {
      alert("일 유입 목표를 입력해주세요.");
      trafficRegisterModalGoalInputRef.current.focus();
      return;
    }

    if (trafficRegisterModalGoalInputRef.current.value < 100) {
      alert("일 유입 목표는 최소 100개 이상 입력해주세요.");
      trafficRegisterModalGoalInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/nplace/campaign/traffic/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({nplaceCampaignTrafficRegister: {
        startDate: trafficRegisterModalStartDateInputRef.current.value,
          endDate: trafficRegisterModalEndDateInputRef.current.value,
          search: trafficRegisterModaSearchInputRef.current.value,
          url: trafficRegisterModalUrlInputRef.current.value,
          shopName: trafficRegisterModalShopNameInputRef.current.value,
          goal: trafficRegisterModalGoalInputRef.current.value,
          shopId: shopWithIdResult ? shopWithIdResult.nplaceCampaignTrafficShop.shopId : ""
      }})
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("유저 유입을 신청했습니다.");
    handleTrafficRegisterModalClose();
    getShopWithIdTrigger();
  });

  // const handleKeywordTrafficModalNext = () => {
  //   // Store data from the first modal and open the second modal
  //   setFormData({nplaceCampaignTrafficKeywordTraffic: {
  //     keywordTraffic: keywordTrafficModalKeywordTrafficInputRef.current.value,
  //     keywordId: shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList[selectedKeywordIndex].id,
  //     shopId: shopWithIdResult ? shopWithIdResult.nplaceCampaignTrafficShop.shopId : ""
  //   }});
  //   handleKeywordTrafficModalClose();
  //   handleTrafficRegisterModalShow();
  // };

  
  if (loginUser === null) {
    navigate(`/nplace/campaign/traffic`, { replace: true });
    return <></>;
  }

  return (
    <LayoutDefault>
      <div>
        <Card>
          <Card.Body>
            {
              shopWithIdResult
                ? <>
                  <div style={style.shopContainer}>
                    <div>
                      <div
                        style={{
                          ...style.shopImage,
                          backgroundImage: `url('${shopWithIdResult.nplaceCampaignTrafficShop.shopImageUrl}')`
                        }}>
                      </div>
                    </div>
                    <div>
                      <div style={style.shopName}>{shopWithIdResult.nplaceCampaignTrafficShop.shopName}</div>
                      <div style={style.address}>
                        {(shopWithIdResult.nplaceCampaignTrafficShop.roadAddress && shopWithIdResult.nplaceCampaignTrafficShop.roadAddress.length > 0) ? shopWithIdResult.nplaceCampaignTrafficShop.roadAddress : shopWithIdResult.nplaceCampaignTrafficShop.address }
                      </div>
                      <div style={style.reviewAndCategoryContainer}>
                        <div>
                          <Button variant="outline-primary" style={style.shopId}
                                  onClick={() => copyToClipboard(shopWithIdResult.nplaceCampaignTrafficShop.shopId)}>
                            SHOP_ID
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline-danger" style={{ float: "right" }} onClick={deleteShopTrigger}
                              disabled={deleteShopIsPending}>
                        {deleteShopIsPending
                          ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                          : "플레이스 삭제"}
                      </Button>
                    </div>
                  </div>
                  <hr />
                  <div style={style.entryKeyContainer}>
                    <div>
                      <span className="me-3 fw-bold">목적키워드</span>
                      {shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList.length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          키워드가 없습니다
                        </Badge>
                        : shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList.map((value, index) => {
                          const thisInfo = shopWithIdResult.nplaceCampaignTrafficShop.nplaceCampaignTrafficKeywordList[index];
                          return <Badge key={index}
                                        bg={selectedKeywordIndex === index ? "warning" : "secondary"}
                                        text={selectedKeywordIndex === index ? "dark" : "white"}
                                        style={{ margin: "0 2px", cursor: "pointer" }}
                                        onClick={() => handleKeywordBadgeClick(value.keyword, index)}
                                        onContextMenu={(event) => handleKeywordBadgeRightClick(event, thisInfo.id, value.keyword, index)}
                          >
                            <span>{value.keyword}</span>
                          </Badge>;
                        })}
                    </div>
                  </div>
                </>
                : <div>로딩중...</div>
            }
          </Card.Body>
        </Card>
        <br />
        {
          selectedKeywordIndex != null && selectedKeywordIndex != undefined &&
          <>
          <Stack direction="horizontal" gap={3} className="mb-3">
            <Button variant="primary" onClick={() => {handleTrafficRegisterModalShow("traffic")}}>
              리워드 트래픽 추가
            </Button>
            <Button variant="primary" onClick={() => {handleTrafficRegisterModalShow("save")}}>
              리워드 저장하기 추가
            </Button>
          </Stack>
            
            <Card>
              <Card.Body>
                {
                  shopWithIdResult
                  && selectedKeywordIndex != null
                  && <>
                    <Table hover style={{ verticalAlign: "middle", textAlign: "center" }}>
                      <thead>
                      <tr>
                        <th scope="col">키워드 트래픽</th>
                        <th scope="col">시작일자</th>
                        <th scope="col">종료일자</th>
                        <th scope="col">총 작업기간</th>
                        <th scope="col">유입목표</th>
                      </tr>
                      </thead>
                      <tbody>
                      {nplaceCampaignTrafficKeywordTrafficList.map((thisKeywordTraffic, index) => (
                        <tr key={index}>
                          <td>
                            {thisKeywordTraffic.keywordTraffic}
                          </td>
                          <td>
                            {thisKeywordTraffic.nplaceCampaignTrafficRegister.startDate}
                          </td>
                          <td>
                            {thisKeywordTraffic.nplaceCampaignTrafficRegister.endDate}
                          </td>
                          <td>
                            {thisKeywordTraffic.nplaceCampaignTrafficRegister.workingPeriod}
                          </td>
                          <td>
                            {thisKeywordTraffic.nplaceCampaignTrafficRegister.goal}
                          </td>
                          {/* <td>
                            {thisKeywordTraffic.createDate.split(".")[0].replace("T", " ")}
                          </td> */}
                        </tr>
                      ))}
                      </tbody>
                    </Table>
                  </>
                }
              </Card.Body>
            </Card>
          </>
        }
        
      </div>

      {/* <Modal show={isKeywordTrafficModalShow} scrollable size={"lg"} backdrop="static" onHide={handleKeywordTrafficModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>키워트 트래픽 조회</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="align-items-center">

            <Col xs={5}>
              <FloatingLabel
                controlId="floatingTrackbaleModalKeywordInput"
                label="키워드"
              >
                <Form.Control
                  value={
                    shopWithIdResult && selectedKeywordIndex != null
                      ? shopWithIdResult.nplaceCampaignTrafficShop
                          .nplaceCampaignTrafficKeywordList[selectedKeywordIndex]
                          .keyword
                      : ""
                  }
                  type="text"
                  placeholder="키워드"
                  readOnly
                />
              </FloatingLabel>
            </Col>

            <Col xs={5}>
              <FloatingLabel
                controlId="floatingTrackbaleModalKeywordTrafficInput"
                label="키워드 트래픽"
              >
                <Form.Control
                  ref={keywordTrafficModalKeywordTrafficInputRef}
                  type="text"
                  placeholder="키워드 트래픽"
                  onKeyUp={handleKeywordTrafficModalUrlInputKeyUp}
                  autoFocus
                />
              </FloatingLabel>
            </Col>

            <Col xs={2}>
              <Button
                ref={keywordTrafficModalSearchButtonRef}
                variant="primary"
                onClick={getKeywordTrafficTrigger}
                style={{ height: "56px", width: "100%" }}
                disabled={getKeywordTrafficIsPending}
              >
                {getKeywordTrafficIsPending ? (
                  <span className="spinner-border" role="status" aria-hidden="true"></span>
                ) : (
                  "검색"
                )}
              </Button>
            </Col>
          </Row>
          {
            keywordTrafficResult != null &&
            <>
              <Row className="mt-3">
                <Col>
                  <Alert 
                    key="primary" 
                    variant={peakDate ? "danger" : "primary"}
                    className="text-center"
                  >
                  {peakDate 
                    ? `이 키워드 트래픽은 ${peakDate}에 사용되었습니다.` 
                    : "이 키워드 트래픽은 사용된 적이 없습니다."
                  }
                </Alert>
               </Col>
              </Row>

              <Row className="mt-2">
                <Col>
                  <Button
                    variant="outline-primary"
                    style={{ width: "100%" }}
                    onClick={handleKeywordTrafficModalNext}
                  >
                    다음
                  </Button>
                </Col>
              </Row>
            </>
          }
          
        </Modal.Body>
      </Modal> */}

      <Modal show={isTrafficRegisterModalShow} scrollable size={"lg"} backdrop="static" onHide={handleTrafficRegisterModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>유입 신청</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 상단 안내 문구 */}
          <Alert variant="primary">
            오후 12시까지 등록된 건수만 당일 등록 가능
          </Alert>

          {/* 입력 폼 */}
          <Row className="align-items-center">
            {/* 시작일 */}
            <Col xs={4}>
              <label>시작일</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="date" placeholder="2024-01-01" ref={trafficRegisterModalStartDateInputRef} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 종료일 */}
            <Col xs={4}>
              <label>종료일</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="date" placeholder="2024-01-01" ref={trafficRegisterModalEndDateInputRef}/>
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 검색어 */}
            <Col xs={4}>
              <label>검색어</label>
            </Col>
            <Col xs={8}>
              {/* <Form.Control type="text" placeholder="검색어 입력" value={formData.nplaceCampaignTrafficKeywordTraffic.keywordTraffic} ref={trafficRegisterModaSearchInputRef} /> */}
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 플레이스 URL (readonly) */}
            <Col xs={4}>
              <label>플레이스 URL</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" value={shopWithIdResult ? `https://m.place.naver.com/place/${shopWithIdResult.nplaceCampaignTrafficShop.shopId}` : ""} ref={trafficRegisterModalUrlInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 업체명 (readonly) */}
            <Col xs={4}>
              <label>업체명</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" value={shopWithIdResult ? shopWithIdResult.nplaceCampaignTrafficShop.shopName : ""} ref={trafficRegisterModalShopNameInputRef} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 일유입목표 */}
            <Col xs={4}>
              <label>일유입목표</label>
            </Col>
            <Col xs={8}>
              <Form.Control 
                type="number" 
                placeholder="100개 이상 입력" 
                min="100"
                ref={trafficRegisterModalGoalInputRef}
              />
            </Col>
          </Row>

          {/* 신청 버튼 */}
          <Row className="mt-4">
            <Col>
              <Button
                variant="outline-primary"
                style={{ width: "100%" }}
                onClick={postTrafficRegisterTrigger}
                disabled={postTrafficRegisterIsPending}
              >
                신청
              </Button>
            </Col>
          </Row>

        </Modal.Body>
      </Modal>

    </LayoutDefault>
  );
}