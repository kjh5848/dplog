import LayoutDefault from "/src/component/layout/default/Index.jsx";
import NstoreRankTrackStyle from "/src/page/nstore/rank/track/Style.jsx";
import { Alert, Badge, Button, Card, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function NstoreRankTrackPage() {

  const { loginUser } = useAuthStore();

  const navigate = useNavigate();

  const style = NstoreRankTrackStyle();

  const [nstoreRankProductList, setNstoreRankProductList] = useState([]);

  const [keywordToolList, setKeywordToolList] = useState([]);

  const [nblogSearchInfoResultMap, setNblogSearchInfoResultMap] = useState(new Map());

  const [getProductTableTrigger] = usePendingFunction(async () => {
    if (loginUser === null) {
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/product`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }

    setNstoreRankProductList(dto.data.nstoreRankProductList);
  });

  const getNstoreKeywordNsearchadKeywordstool = async (keywordsByJoin) => {
    const dto = await fetch(`/v1/nstore/keyword/nsearchad/keywordstool?keywordList=${keywordsByJoin}&requestType=TRACK`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      return;
    }
    setKeywordToolList(prevState => [...prevState, ...dto.data.keywordToolList]);
  };

  useEffect(() => {
    let stopper = false;
    const fetchGetNstoreKeywordNsearchadKeywordstool = async () => {
      const keywordList = [];
      nstoreRankProductList.forEach((thisNstoreRankProduct) => {
        thisNstoreRankProduct.nstoreRankTrackInfoList.forEach((thisNstoreRankTrackInfo) => {
          if (keywordList.includes(thisNstoreRankTrackInfo.keyword)) {
            return;
          }
          keywordList.push(thisNstoreRankTrackInfo.keyword);
        });
      });
      let start = 0;
      while (start < keywordList.length) {
        if (stopper) {
          break;
        }
        const keywordListForRequest = keywordList.slice(start, start + 5);
        if (keywordListForRequest.length > 0) {
          await getNstoreKeywordNsearchadKeywordstool(keywordListForRequest.join(","));
        }
        start += 5;
      }
    };
    if (nstoreRankProductList.length > 0) {
      fetchGetNstoreKeywordNsearchadKeywordstool();
    }
    return () => {
      stopper = true;
    };
  }, [nstoreRankProductList]);

  const getNstoreKeywordNblogSearchInfo = async (keyword) => {
    if (nblogSearchInfoResultMap.has(keyword)) {
      return;
    }
    const dto = await fetch(`/v1/nstore/keyword/nblog/search/info?keyword=${keyword}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      return;
    }
    setNblogSearchInfoResultMap(prevState => new Map(prevState).set(keyword, dto.data.result));
  };

  useEffect(() => {
    let stopper = false;
    const fetchGetNstoreKeywordNblogSearchInfo = async () => {
      for (const thisKeywordTool of keywordToolList) {
        if (stopper) {
          break;
        }
        if (nblogSearchInfoResultMap.has(thisKeywordTool.relKeyword)) {
          continue;
        }
        await getNstoreKeywordNblogSearchInfo(thisKeywordTool.relKeyword);
      }
    }
    if (keywordToolList.length > 0) {
      fetchGetNstoreKeywordNblogSearchInfo();
    }
    return () => {
      stopper = true;
    };
  }, [keywordToolList]);

  useEffect(() => {
    getProductTableTrigger();
  }, []);

  const trackableModalUrlInputRef = useRef();
  const trackableModalSearchButtonRef = useRef();

  const [isTrackableModalShow, setIsTrackableModalShow] = useState(false);
  const handleTrackableModalClose = () => {
    trackableModalUrlInputRef.current.value = "";
    setTrackableResult({ list: [], isCatalog: false });
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

  const [trackableResult, setTrackableResult] = useState({ list: [], isCatalog: false });

  const [getTrackableTrigger, getTrackableIsPending] = usePendingFunction(async () => {
    if (trackableModalUrlInputRef.current.value === "") {
      alert("URL를 입력해주세요.");
      trackableModalUrlInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/trackable?url=${trackableModalUrlInputRef.current.value}`, {
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
    if (Object.keys(dto.data).includes("nstoreRankProduct")) {
      setTrackableResult({ list: [dto.data.nstoreRankProduct], isCatalog: false });
    } else if (Object.keys(dto.data).includes("nstoreRankMallProductList")) {
      setTrackableResult({ list: dto.data.nstoreRankMallProductList, isCatalog: false });
    } else if (Object.keys(dto.data).includes("nstoreRankCatalogProductList")) {
      setTrackableResult({ list: dto.data.nstoreRankCatalogProductList, isCatalog: true });
    } else {
      alert("다시 시도해주세요.");
      return;
    }
    trackableModalUrlInputRef.current.focus();
  });

  useEffect(() => {
    if (getTrackableIsPending) {
      setTrackableResult({ list: [], isCatalog: false });
    }
  }, [getTrackableIsPending]);

  const [selectedTrackable, setSelectedTrackable] = useState(null);

  const [postProductTrigger, postProductIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nstore/rank/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nstoreRankProduct: {
          ...selectedTrackable,
          isCatalog: trackableResult.isCatalog
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      setSelectedTrackable(null);
      return;
    } else {
      alert("등록되었습니다.");
    }
    // setNstoreKeywordSingleList([]);
    setNstoreRankProductList(dto.data.nstoreRankProductList);
    setSelectedTrackable(null);
    handleTrackableModalClose();
  });

  useEffect(() => {
    if (selectedTrackable != null) {
      postProductTrigger();
    }
  }, [selectedTrackable]);

  const getRankString = (rank) => {
    if (rank == null) {
      return "추적 대기";
    } else if (rank === -1) {
      return "순위권 이탈";
    } else {
      return `${rank}위`;
    }
  };

  return (
    <LayoutDefault>
      <Alert variant="primary">
        매일 오전 8시, 오후 5시에 순차적으로 순위를 추적합니다
      </Alert>
      <Card>
        <Card.Body>
          <div>
            <div style={style.trackableButtonContainer}>
              <Button variant="primary" onClick={handleTrackableModalShow}>
                추적가능 상품 검색
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
                <div>상품 / 순위</div>
              </th>
              <th scope="col">
                <div>업체명</div>
              </th>
            </tr>
            </thead>
            <tbody>
            {
              nstoreRankProductList.map((thisProduct, thisProductIndex) =>
                <tr key={thisProductIndex} onDoubleClick={() => navigate(`/nstore/rank/track/${thisProduct.id}`)}>
                  <th scope="row">{thisProduct.id}</th>
                  <td>
                    <div style={{
                      ...style.tableImage,
                      backgroundImage: `url('${thisProduct.productImageUrl}')`
                    }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{thisProduct.productName}</div>
                    <div>
                      {thisProduct.nstoreRankTrackInfoList.length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          추적 중인 키워드가 없습니다
                        </Badge>
                        : thisProduct.nstoreRankTrackInfoList.map((thisInfo, thisInfoIndex) =>
                          <Badge key={thisInfoIndex} bg="warning" text="dark" style={{ margin: "0 2px" }}>
                            <span>{thisInfo.keyword}</span>
                            <span>{" / "}{getRankString(thisInfo.rank)}{"("}</span>
                            <span>{(() => {
                              if (thisInfo.rankChange === 0) {
                                return "-";
                              } else if (thisInfo.rankChange < 0) {
                                return "▲";
                              } else {
                                return "▽";
                              }
                            })()}</span>
                            <span>{`${thisInfo.rankChange !== 0 ? Math.abs(thisInfo.rankChange) : ""})`}</span>
                          </Badge>)}
                    </div>
                  </td>
                  {/*<td>{thisProduct.mallName}</td>*/}
                  <td>{thisProduct.isCatalog ? "카탈로그 상품" : thisProduct.mallName}</td>
                </tr>)
            }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <br />
      <Card>
        <Card.Body>
          <Table bordered hover style={{ fontSize: "11px", textAlign: "center" }}>
            <thead>
            <tr>
              <th rowSpan="2">키워드</th>
              <th colSpan="2">월간검색수</th>
              <th rowSpan="2">검색수합계</th>
              <th colSpan="2">월간 블로그 발행</th>
              <th colSpan="2">월평균클릭수</th>
              <th colSpan="2">월평균클릭율</th>
              <th rowSpan="2">경쟁정도</th>
              <th rowSpan="2">월평균노출광고수</th>
            </tr>
            <tr>
              <th>PC</th>
              <th>Mobile</th>
              <th>수량</th>
              <th>포화도</th>
              <th>PC</th>
              <th>Mobile</th>
              <th>PC</th>
              <th>Mobile</th>
            </tr>
            </thead>
            <tbody>
            {
              keywordToolList.map((thisKeywordTool, thisKeywordToolIndex) =>
                <tr key={thisKeywordToolIndex}>
                  <td>{thisKeywordTool.relKeyword}</td>
                  <td>{thisKeywordTool.monthlyPcQcCnt}</td>
                  <td>{thisKeywordTool.monthlyMobileQcCnt}</td>
                  <td>{thisKeywordTool.monthlyPcQcCnt + thisKeywordTool.monthlyMobileQcCnt}</td>
                  <td>{
                    nblogSearchInfoResultMap.get(thisKeywordTool.relKeyword) != null
                      ? nblogSearchInfoResultMap.get(thisKeywordTool.relKeyword).totalCount
                      : ""
                  }</td>
                  <td>{
                    nblogSearchInfoResultMap.get(thisKeywordTool.relKeyword) != null
                      ? `${Math.round((nblogSearchInfoResultMap.get(thisKeywordTool.relKeyword).totalCount / (thisKeywordTool.monthlyPcQcCnt + thisKeywordTool.monthlyMobileQcCnt)) * 1000) / 10}%`
                      : ""
                  }</td>
                  <td>{thisKeywordTool.monthlyAvePcClkCnt}</td>
                  <td>{thisKeywordTool.monthlyAveMobileClkCnt}</td>
                  <td>{thisKeywordTool.monthlyAvePcCtr}</td>
                  <td>{thisKeywordTool.monthlyAveMobileCtr}</td>
                  <td>{thisKeywordTool.compIdx}</td>
                  <td>{thisKeywordTool.plAvgDepth}</td>
                </tr>
              )
            }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Modal show={isTrackableModalShow} scrollable size={"lg"} backdrop="static" onHide={handleTrackableModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>추적가능 상품 검색</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>URL을 입력해주세요</div>
          <div style={style.trackableModalExampleContainer}>
            <div>상품 주소 예시) https://smartstore.naver.com/itschool/products/9205573121 또는 9205573121</div>
            <div>가격비교상품 주소 예시) https://search.shopping.naver.com/catalog/5639964597</div>
            <div>업체 주소 예시) https://smartstore.naver.com/itschool 또는 itschool</div>
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
          <hr />
          <div>
            <Table hover>
              <tbody>
              {trackableResult.list.map((thisItem, index) => (
                <tr key={index}>
                  <td>
                    <div
                      style={{ ...style.tableImage, backgroundImage: `url('${thisItem.productImageUrl}')` }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{thisItem.productName}</div>
                    <div style={{ marginTop: "5px" }}>{trackableResult.isCatalog ? "카탈로그 상품" : thisItem.mallName}</div>
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Button variant="outline-primary" style={{ width: "58px" }}
                            onClick={() => setSelectedTrackable(thisItem)}
                            disabled={postProductIsPending}>
                      {postProductIsPending
                        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        : "등록"}
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </LayoutDefault>
  );
}