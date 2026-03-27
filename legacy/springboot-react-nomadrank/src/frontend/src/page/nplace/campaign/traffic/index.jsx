import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Alert, Badge, Button, Card, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useNavigate } from "react-router-dom";
import NplaceCampaignTrafficStyle from "./Style";

export default function NplaceCampaignTrafficPage() {

  const { loginUser } = useAuthStore();

  const navigate = useNavigate();

  const style = NplaceCampaignTrafficStyle();

  const [nplaceCampaignTrafficShopList, setNplaceCampaignTrafficShopList] = useState([]);
  const [notification, setNotification] = useState(null);

  const [getShopTableTrigger] = usePendingFunction(async () => {
    if (loginUser === null) {
      return;
    }
    const dto = await fetch(`/v1/nplace/campaign/traffic/shop`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setNplaceCampaignTrafficShopList(dto.data.nplaceCampaignTrafficShopList);
  });

  const fetchNotification = async () => {
    try {
        const response = await fetch('/v1/nplace/campaign/traffic/notification', {
            method: 'GET'
        });
        const dto = await response.json();
        
        if (dto.code !== 0) {
            alert(dto.message);
            return;
        }
        setNotification(dto.data.nplaceCampaignTrafficNotificationList);
    } catch (error) {
        console.error('Error fetching notification:', error);
    }
  };

  useEffect(() => {
    getShopTableTrigger();
    fetchNotification();
  }, []);



  const trackableModalUrlInputRef = useRef();
  const trackableModalKeywordInputRef = useRef();
  const trackableModalSearchButtonRef = useRef();

  const [isTrackableModalShow, setIsTrackableModalShow] = useState(false);
  const handleTrackableModalClose = () => {
    trackableModalUrlInputRef.current.value = "";
    setTrackableResult(null);
    setIsTrackableModalShow(false);
  };
  const handleTrackableModalShow = () => {
    setIsTrackableModalShow(true);
  };

  const handleTrackableModalUrlInputKeyUp = (event) => {
    if (event.key === "Enter") {
      trackableModalSearchButtonRef.current.click();
    }
  };

  const [trackableResult, setTrackableResult] = useState(null);

  const [getTrackableTrigger, getTrackableIsPending] = usePendingFunction(async () => {
    if (trackableModalUrlInputRef.current.value === "") {
      alert("URL를 입력해주세요.");
      trackableModalUrlInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/trackable?url=${trackableModalUrlInputRef.current.value}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code === -8) {
      alert("검색 결과가 없습니다.");
      return;
    }
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setTrackableResult({
      nplaceCampaignTrafficShop: dto.data.nplaceRankShop
    });
    trackableModalUrlInputRef.current.focus();
  });

  useEffect(() => {
    if (getTrackableIsPending) {
      setTrackableResult(null);
    }
  }, [getTrackableIsPending]);

  const [selectedTrackable, setSelectedTrackable] = useState(null);

  const [postShopTrigger, postShopIsPending] = usePendingFunction(async () => {
    if (trackableModalKeywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      trackableModalKeywordInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/nplace/campaign/traffic/shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceCampaignTrafficShop: {
          ...selectedTrackable
        },
        nplaceCampaignTrafficKeyword: {
          keyword: trackableModalKeywordInputRef.current.value,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
    }
    // setNplaceCampaignTrafficShopList(dto.data.nplaceCampaignTrafficShopList);
    getShopTableTrigger();
    setSelectedTrackable(null);
    handleTrackableModalClose();
  });

  useEffect(() => {
    if (selectedTrackable != null) {
      postShopTrigger();
    }
  }, [selectedTrackable]);

  return (
    <LayoutDefault>
      {notification ? (
            <Alert variant="primary">
                {notification[0].content}
            </Alert>
        ) : null}
      <Card>
        <Card.Body>
          <div>
            <div style={style.trackableButtonContainer}>
              <Button variant="primary" onClick={handleTrackableModalShow}>
                플레이스 등록
              </Button>
            </div>
          </div>
          <hr />
          <Table hover>
            <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">이미지</th>
              <th scope="col">
                <div>플레이스 / 키워드</div>
              </th>
            </tr>
            </thead>
            <tbody>
            {
              nplaceCampaignTrafficShopList.map((thisShop, thisShopIndex) =>
                <tr key={thisShopIndex} onDoubleClick={() => navigate(`/nplace/campaign/traffic/${thisShop.id}`)}>
                  <th scope="row">{thisShop.id}</th>
                  <td>
                    <div style={{
                      ...style.tableImage,
                      backgroundImage: `url('${thisShop.shopImageUrl}')`
                    }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{thisShop.shopName}</div>
                    <div>
                      {thisShop.nplaceCampaignTrafficKeywordList.length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          키워드가 없습니다
                        </Badge>
                        : thisShop.nplaceCampaignTrafficKeywordList.map((thisKeyword, thisKeywordIndex) =>
                          <Badge key={thisKeywordIndex} bg="warning" text="dark" style={{ margin: "0 2px" }}>
                            <span>{`${thisKeyword.keyword}`}</span>
                          </Badge>)}
                    </div>
                  </td>
                </tr>)
            }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <Modal show={isTrackableModalShow} scrollable size={"lg"} backdrop="static" onHide={handleTrackableModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>추적가능 플레이스 검색</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>URL을 입력해주세요</div>
          <div style={style.trackableModalExampleContainer}>
            <div>검색 주소 예시) https://map.naver.com/p/search/홍철책빵/place/1203311506</div>
            <div>엔트리 주소 예시) https://map.naver.com/p/entry/place/1203311506</div>
            <div>모바일 주소 예시) https://m.place.naver.com/restaurant/1203311506/home</div>
            <div>플레이스 ID 예시) 1203311506</div>
          </div>
          <div style={style.trackableModalInputContainer}>
            <FloatingLabel
              controlId="floatingTrackbaleModalUrlInput"
              label="URL"
            >
              <Form.Control ref={trackableModalUrlInputRef} type="text" placeholder="URL"
                            onKeyUp={handleTrackableModalUrlInputKeyUp} autoFocus />
            </FloatingLabel>
            <Button ref={trackableModalSearchButtonRef} variant="primary" onClick={getTrackableTrigger}
                    style={{ height: "56px" }} disabled={getTrackableIsPending}>
              {getTrackableIsPending
                ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                : "검색"}
            </Button>
          </div>
          <div style={style.trackableModalInputContainer}>
            <FloatingLabel
              controlId="floatingTrackbaleModalKeywordInput"
              label="목적 키워드"
            >
              <Form.Control ref={trackableModalKeywordInputRef} type="text" placeholder="목적 키워드" />
            </FloatingLabel>
          </div>
          <hr />
          <div>
            <Table hover>
              <tbody>
              {trackableResult &&
                <tr>
                  <td>
                    <div
                      style={{
                        ...style.tableImage,
                        backgroundImage: `url('${trackableResult.nplaceCampaignTrafficShop.shopImageUrl}')`
                      }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{trackableResult.nplaceCampaignTrafficShop.shopName}</div>
                    <div
                      style={{ marginTop: "5px" }}>{trackableResult.nplaceCampaignTrafficShop.roadAddress ? trackableResult.nplaceCampaignTrafficShop.roadAddress : trackableResult.nplaceCampaignTrafficShop.address}</div>
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Button variant="outline-primary" style={{ width: "58px" }}
                            onClick={() => setSelectedTrackable(trackableResult.nplaceCampaignTrafficShop)}
                            disabled={postShopIsPending}>
                      {postShopIsPending
                        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        : "등록"}
                    </Button>
                  </td>
                </tr>
              }
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </LayoutDefault>
  );
}