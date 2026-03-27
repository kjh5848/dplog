import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Alert, Badge, Button, Card, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import NplaceRankTrackStyle from "/src/page/nplace/rank/track/Style.jsx";
import { useForm } from "react-hook-form";
import ExcelUploadModal from "./ExcelUploadModal";

export default function NplaceRankTrackPage() {

  const { loginUser } = useAuthStore();

  const navigate = useNavigate();

  const style = NplaceRankTrackStyle();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [nplaceRankShopList, setNplaceRankShopList] = useState([]);

  const [keywordToolList, setKeywordToolList] = useState([]);

  const [nblogSearchInfoResultMap, setNblogSearchInfoResultMap] = useState(new Map());

  // const [nplaceKeywordSingleList, setNplaceKeywordSingleList] = useState([]);

  const [getShopTableTrigger] = usePendingFunction(async () => {
    if (loginUser === null) {
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/shop`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setNplaceRankShopList(dto.data.nplaceRankShopList);
  });

  const getNplaceKeywordNsearchadKeywordstool = async (keywordsByJoin) => {
    const dto = await fetch(`/v1/nplace/keyword/nsearchad/keywordstool/relatioin?keywordList=${keywordsByJoin}&requestType=TRACK`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      return;
    }
    setKeywordToolList(prevState => [...prevState, ...dto.data.keywordToolList]);
  };

  useEffect(() => {
    let stopper = false;
    const fetchGetNplaceKeywordNsearchadKeywordstool = async () => {
      const keywordList = [];
      nplaceRankShopList.forEach((thisNplaceRankShop) => {
        thisNplaceRankShop.nplaceRankTrackInfoList.forEach((thisNplaceRankTrackInfo) => {
          if (keywordList.includes(thisNplaceRankTrackInfo.keyword)) {
            return;
          }
          keywordList.push(thisNplaceRankTrackInfo.keyword);
        });
      });
      let start = 0;
      while (start < keywordList.length) {
        if (stopper) {
          break;
        }
        const keywordListForRequest = keywordList.slice(start, start + 5);
        if (keywordListForRequest.length > 0) {
          await getNplaceKeywordNsearchadKeywordstool(keywordListForRequest.join(","));
        }
        start += 5;
      }
    };
    if (nplaceRankShopList.length > 0) {
      fetchGetNplaceKeywordNsearchadKeywordstool();
    }
    return () => {
      stopper = true;
    };
  }, [nplaceRankShopList]);

  const getNplaceKeywordNblogSearchInfo = async (keyword) => {
    if (nblogSearchInfoResultMap.has(keyword)) {
      return;
    }
    const dto = await fetch(`/v1/nplace/keyword/nblog/search/info?keyword=${keyword}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      return;
    }
    setNblogSearchInfoResultMap(prevState => new Map(prevState).set(keyword, dto.data.result));
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(searchParams.get("type") || "all");

  useEffect(() => {
    // 필터 값을 URL에 저장
    setSearchParams({type : selectedGroup});
  }, [selectedGroup, setSearchParams]);

  const fetchGroupList = async () => {
    try {
      const dto = await fetch(`/v1/group/list`, {
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
      setGroupList(dto.data.groupList);
    } catch (error) {
      console.error('그룹 목록을 불러오는데 실패했습니다:', error);
    }
  };
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  useEffect(() => {
    let stopper = false;
    const fetchGetNplaceKeywordNblogSearchInfo = async () => {
      for (const thisKeywordTool of keywordToolList) {
        if (stopper) {
          break;
        }
        if (nblogSearchInfoResultMap.has(thisKeywordTool.relKeyword)) {
          continue;
        }
        await getNplaceKeywordNblogSearchInfo(thisKeywordTool.relKeyword);
      }
    }
    if (keywordToolList.length > 0) {
      fetchGetNplaceKeywordNblogSearchInfo();
    }
    return () => {
      stopper = true;
    };
  }, [keywordToolList]);

  useEffect(() => {
    getShopTableTrigger();
    fetchGroupList();
  }, []);

  const trackableModalUrlInputRef = useRef();
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
    setTrackableResult(dto.data);
    trackableModalUrlInputRef.current.focus();
  });

  useEffect(() => {
    if (getTrackableIsPending) {
      setTrackableResult(null);
    }
  }, [getTrackableIsPending]);

  const [selectedTrackable, setSelectedTrackable] = useState(null);

  const [postShopTrigger, postShopIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/rank/shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankShop: {
          ...selectedTrackable
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
    }
    setNplaceRankShopList(dto.data.nplaceRankShopList);
    setSelectedTrackable(null);
    handleTrackableModalClose();
  });

  useEffect(() => {
    if (selectedTrackable != null) {
      postShopTrigger();
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

  const [selectedShopList, setSelectedShopList] = useState(new Set());

  const handleShopSelect = (shopId) => {
    setSelectedShopList(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(shopId)) {
        newSelected.delete(shopId);
      } else {
        newSelected.add(shopId);
      }
      return newSelected;
    });
  };

  const filteredShopList = selectedGroup === 'all' 
  ? nplaceRankShopList 
  : nplaceRankShopList.filter(shop => {
    const groupNames = shop.groupName.split(', ');
    return groupNames.includes(selectedGroup);
  });

  const [isGroupChangeModalShow, setIsGroupChangeModalShow] = useState(false);
  const handleGroupChangeModalShow = () => {
    if (selectedShopList.size === 0) {
      alert("플레이스를 1개 이상 선택해주세요.");
      return;
    }
    setIsGroupChangeModalShow(true);
  };
  const handleChangeGroupModalClose = () => {
    reset();
    setIsGroupChangeModalShow(false);
  };
  const onChangeGroupModalSubmit = async (data) => {
    const dto = await fetch(`/v1/nplace/rank/shop/group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankShopList: Array.from(selectedShopList),
        group: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert(`변경 되었습니다.`);
    }
    getShopTableTrigger();
    setSelectedShopList(new Set());
    handleChangeGroupModalClose();

  };

  const [isExcelUploadModalShow, setIsExcelUploadModalShow] = useState(false);
  const handleUploadModalShow = () => {
    setIsExcelUploadModalShow(true);
  };
  const handleExcelUploadModalClose = () => {
    setIsExcelUploadModalShow(false);
  };


  return (
    <LayoutDefault>
      <Alert variant="primary">
        매일 오후 1시에 순차적으로 순위를 추적합니다
      </Alert>
      <Card>
        <Card.Body>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="d-flex gap-3">
              <Form.Select 
                style={{ width: '100px' }}
                value={selectedGroup}
                onChange={handleGroupChange}
              >
                <option value="all">전체</option>
                <option value="기본">기본</option>
                {groupList.map((group) => (
                  <option key={group.id} value={group.groupName}>
                    {group.groupName}
                  </option>
                ))}
              </Form.Select>
              <Button variant="primary" onClick={handleGroupChangeModalShow}>
                그룹 변경
              </Button>
            </div>
            

            <div style={style.trackableButtonContainer}>
              <Button variant="primary" onClick={handleTrackableModalShow} className="me-2">
                추적가능 플레이스 검색
              </Button>
              {/* <Button variant="primary" onClick={handleUploadModalShow}>
                업로드
              </Button> */}
            </div>
          </div>
          <hr />
          <Table hover>
            <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col" style={{ minWidth: "100px"}}>그룹</th>
              <th scope="col">이미지</th>
              <th scope="col">
                <div>플레이스 / 순위</div>
              </th>
            </tr>
            </thead>
            <tbody>
            {
              filteredShopList.map((thisShop, thisShopIndex) =>
                <tr 
                  key={thisShopIndex} 
                  onDoubleClick={() => navigate(`/nplace/rank/track/${thisShop.id}`)}
                  onClick={() => handleShopSelect(thisShop.id)}
                  className={selectedShopList.has(thisShop.id) ? "table-success" : ""}
                  style={{cursor: "pointer"}}
                >
                  <th scope="row">{thisShop.id}</th>
                  <th scope="row">{thisShop.groupName}</th>
                  <td>
                    <div style={{
                      ...style.tableImage,
                      backgroundImage: `url('${thisShop.shopImageUrl}')`
                    }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{thisShop.shopName}</div>
                    <div>
                      {thisShop.nplaceRankTrackInfoList.length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          추적 중인 지역 및 키워드가 없습니다
                        </Badge>
                        : thisShop.nplaceRankTrackInfoList.map((thisInfo, thisInfoIndex) =>
                          <Badge key={thisInfoIndex} bg="warning" text="dark" style={{ margin: "0 2px" }}>
                            <span>{`[${thisInfo.province}]${thisInfo.keyword}`}</span>
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
                        backgroundImage: `url('${trackableResult.nplaceRankShop.shopImageUrl}')`
                      }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{trackableResult.nplaceRankShop.shopName}</div>
                    <div
                      style={{ marginTop: "5px" }}>{trackableResult.nplaceRankShop.roadAddress ? trackableResult.nplaceRankShop.roadAddress : trackableResult.nplaceRankShop.address}</div>
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Button variant="outline-primary" style={{ width: "58px" }}
                            onClick={() => setSelectedTrackable(trackableResult.nplaceRankShop)}
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

      <Modal show={isGroupChangeModalShow} scrollable size={"lg"} backdrop="static" onHide={handleChangeGroupModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>그룹 변경</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onChangeGroupModalSubmit)}>
            <Form.Group className="mb-3">
                <Form.Label>그룹</Form.Label>
                <Form.Select {...register("id", { required: "그룹을 선택하세요" })}>
                    {groupList.map((group, index) => (
                        <option key={index} value={group.id}>{group.groupName}</option>
                    ))}
                </Form.Select>
                {errors.id && <p className="text-danger">{errors.id.message}</p>}
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleChangeGroupModalClose}>취소</Button>
              <Button variant="primary" type="submit">변경</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <ExcelUploadModal show={isExcelUploadModalShow} handleClose={handleExcelUploadModalClose} />
    </LayoutDefault>
  );
}