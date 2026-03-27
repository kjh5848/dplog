import { useNavigate, useParams } from "react-router-dom";
import NStoreRankTrackWithIdStyle from "/src/page/nstore/rank/track/id/Style.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Badge, Button, Card, FloatingLabel, Form, Table } from "react-bootstrap";


export default function NstoreRankTrackWithIdPage() {

  const { loginUser } = useAuthStore();

  const style = NStoreRankTrackWithIdStyle();

  const { id } = useParams();

  const navigate = useNavigate();

  const [productWithIdResult, setProductWithIdResult] = useState();

  const [getProductWithIdTrigger] = usePendingFunction(async () => {

    const dto = await fetch(`/v1/nstore/rank/product/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      navigate(`/nstore/rank/track`, { replace: true });
      return;
    }
    setProductWithIdResult(dto.data);
    if (Object.keys(dto.data.nstoreRankProduct.nstoreRankTrackInfoMap).length > 0) {
      // 차트 겹치는 용도면 리스트
      // setSelectedInfoIdList([dto.data.nstoreRankProduct.nstoreRankTrackInfoMap[Object.keys(dto.data.nstoreRankProduct.nstoreRankTrackInfoMap)[0]].id]);
      setSelectedInfoEntryKey(Object.keys(dto.data.nstoreRankProduct.nstoreRankTrackInfoMap)[0]);
    }
  });

  useEffect(() => {
    getProductWithIdTrigger();
  }, []);

  const trackAddKeywordInputRef = useRef();

  const [postTrackTrigger, postTrackIsPending] = usePendingFunction(async () => {
    if (trackAddKeywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      trackAddKeywordInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nstoreRankTrackInfo: {
          keyword: trackAddKeywordInputRef.current.value,
          mid: productWithIdResult ? productWithIdResult.nstoreRankProduct.mid : "",
          productId: productWithIdResult ? productWithIdResult.nstoreRankProduct.productId : ""
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    getProductWithIdTrigger();
    trackAddKeywordInputRef.current.value = "";
    alert("키워드를 추가했습니다.");
  });

  // useEffect(() => {
  //   if (trackAddKeyword != null) {
  //     postTrackTrigger();
  //   }
  // }, [trackAddKeyword]);

  // 차트 겹치는 용도면 리스트
  // const [selectedInfoIdList, setSelectedInfoIdList] = useState([]);
  //
  // const handleKeywordBadgeClick = (nomadscrapNstoreRankTrackInfoId) => {
  //   if (selectedInfoIdList.includes(nomadscrapNstoreRankTrackInfoId)) {
  //     setSelectedInfoIdList(selectedInfoIdList.filter((thisInfoId) => thisInfoId !== nomadscrapNstoreRankTrackInfoId));
  //   } else {
  //     setSelectedInfoIdList([...selectedInfoIdList, nomadscrapNstoreRankTrackInfoId]);
  //   }
  // };

  const [selectedInfoEntryKey, setSelectedInfoEntryKey] = useState(null);

  const handleKeywordBadgeClick = (entryKey) => {
    if (selectedInfoEntryKey !== entryKey) {
      setSelectedInfoEntryKey(entryKey);
    }
  };

  const handleKeywordBadgeRightClick = async (event, infoId, entryKey) => {
    event.preventDefault();
    if (prompt(`추적을 중단 하시려면 키워드(${entryKey})를 입력해주세요.\n중단 후 다시 추적할 경우 과거 차트 데이터는 복구되지 않습니다.`) !== entryKey) {
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/track/${infoId}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    if (selectedInfoEntryKey === entryKey) {
      setSelectedInfoEntryKey(null);
    }
    getProductWithIdTrigger();
    alert(`${entryKey} 추적을 중단했습니다.`);
  };

  const [deleteProductTrigger, deleteProductIsPending] = usePendingFunction(async () => {
    if (!confirm(`정말로 상품을 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 차트 데이터는 복구되지 않습니다.`)) {
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/product/${id}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("상품을 삭제했습니다.");
    navigate(`/nstore/rank/track`, { replace: true });
  });


  // const handleProductDeleteButtonClick = () => {
  //   if (confirm(`정말로 상품을 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 차트 데이터는 복구되지 않습니다.`)) {
  //     alert("삭제");
  //   }
  // };

  // productWithIdResult.nstoreRankProduct.nstoreRankTrackInfoMap[selectedInfoEntryKey].nstoreRankTrackList
  const nstoreRankTrackList = useMemo(() => {
    if (productWithIdResult && selectedInfoEntryKey != null) {
      return productWithIdResult.nstoreRankProduct.nstoreRankTrackInfoMap[selectedInfoEntryKey].nstoreRankTrackList
        .toSorted((a, b) => a.chartDate > b.chartDate ? -1 : 1);
    }
    return [];
  }, [productWithIdResult, selectedInfoEntryKey]);

  const copyToClipboard = (text) => {
    window.navigator.clipboard.writeText(text);
    alert(`MID ${text} 복사되었습니다.`);
  };

  const getRankString = (rank) => {
    if (rank == null) {
      return "추적 대기";
    } else if (rank === -1) {
      return "순위권 이탈";
    } else {
      return `${rank}위`;
    }
  }

  // const openNewTabWithUrl = (url) => {
  //   window.open(url, "_blank");
  // };

  if (loginUser === null) {
    navigate(`/nstore/rank/track`, { replace: true });
    return <></>;
  }

  return (
    <LayoutDefault>
      <div>
        <Card>
          <Card.Body>
            {
              productWithIdResult
                ? <>
                  <div style={style.productContainer}>
                    <div>
                      <div
                        style={{
                          ...style.productImage,
                          backgroundImage: `url('${productWithIdResult.nstoreRankProduct.productImageUrl}')`
                        }}>
                      </div>
                    </div>
                    <div>
                      <div style={style.productName}>{productWithIdResult.nstoreRankProduct.productName}</div>
                      <div style={style.mallName}>
                        {(productWithIdResult.nstoreRankProduct.mallName && productWithIdResult.nstoreRankProduct.mallName.length > 0) ? productWithIdResult.nstoreRankProduct.mallName : "카탈로그 상품"}
                      </div>
                      <div style={{ ...style.reviewAndCategoryContainer, fontSize: "15px" }}>
                        <div>리뷰({productWithIdResult.nstoreRankProduct.reviewCount})
                        </div>
                      </div>
                      <div style={style.reviewAndCategoryContainer}>
                        <div style={style.resultCategoryAndScore}>{productWithIdResult.nstoreRankProduct.category}</div>
                        <div
                          style={style.categoryAndScore}>{" "}평점({productWithIdResult.nstoreRankProduct.scoreInfo})
                        </div>
                        <div>
                          <Button variant="outline-primary" style={style.mid}
                                  onClick={() => copyToClipboard(productWithIdResult.nstoreRankProduct.mid)}>
                            MID
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline-danger" style={{float: "right"}} onClick={deleteProductTrigger} disabled={deleteProductIsPending}>
                        {deleteProductIsPending
                          ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                          : "상품 삭제"}
                      </Button>
                    </div>
                  </div>
                  <hr />
                  <div style={style.entryKeyContainer}>
                    <div>
                      {Object.keys(productWithIdResult.nstoreRankProduct.nstoreRankTrackInfoMap).length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          추적 중인 키워드가 없습니다
                        </Badge>
                        : Object.keys(productWithIdResult.nstoreRankProduct.nstoreRankTrackInfoMap).map((entryKey, thisInfoIndex) => {
                          const thisInfo = productWithIdResult.nstoreRankProduct.nstoreRankTrackInfoMap[entryKey];
                          return <Badge key={thisInfoIndex}
                                        bg={selectedInfoEntryKey === entryKey ? "warning" : "secondary"}
                                        text={selectedInfoEntryKey === entryKey ? "dark" : "white"}
                                        style={{ margin: "0 2px", cursor: "pointer" }}
                                        onClick={() => handleKeywordBadgeClick(entryKey)}
                                        onContextMenu={(event) => handleKeywordBadgeRightClick(event, thisInfo.id, entryKey)}
                          >
                            <span>{entryKey}</span>
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
                          </Badge>;
                        })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 58px", gap: "5px" }}>
                      <FloatingLabel
                        controlId="floatingTrackAddKeywordInput"
                        label="키워드">
                        <Form.Control ref={trackAddKeywordInputRef} type="text" placeholder="키워드"
                                      disabled={postTrackIsPending} />
                      </FloatingLabel>
                      <Button variant="primary" style={{ height: "56px" }} onClick={postTrackTrigger}
                              disabled={postTrackIsPending}>
                        {postTrackIsPending
                          ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                          : "추가"}
                      </Button>
                    </div>
                  </div>
                </>
                : <div>로딩중...</div>
            }
          </Card.Body>
        </Card>
        <br />
        <Card>
          <Card.Body>
            {
              productWithIdResult
              && selectedInfoEntryKey != null
              && <>
                <Table hover style={{ verticalAlign: "middle", textAlign: "center" }}>
                  <thead>
                  <tr>
                    <th scope="col">순위</th>
                    <th scope="col">리뷰</th>
                    <th scope="col">평점</th>
                    <th scope="col">일자</th>
                  </tr>
                  </thead>
                  <tbody>
                  {nstoreRankTrackList.map((thisTrack, index) => (
                    <tr key={index}>
                      <td>
                        {thisTrack.rank > 0 ? thisTrack.rank : "순위권 이탈"}
                      </td>
                      <td>
                        {thisTrack.rank > 0 ? thisTrack.reviewCount : ""}
                      </td>
                      <td>
                        {thisTrack.rank > 0 ? thisTrack.scoreInfo : ""}
                      </td>
                      <td>
                        {thisTrack.chartDate.split(".")[0].replace("T", " ")}
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </>
            }
          </Card.Body>
        </Card>
      </div>
    </LayoutDefault>
  );
}