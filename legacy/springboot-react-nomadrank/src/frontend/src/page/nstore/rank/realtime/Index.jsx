import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useUtilStore } from "/src/store/StoreProvider.jsx";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import NstoreRankRealtimeStyle from "/src/page/nstore/rank/realtime/Style.jsx";
import { Alert, Button, Card, FloatingLabel, Form } from "react-bootstrap";

export default function StoreRankRealtimePage() {

  const { isPc } = useUtilStore();

  const style = NstoreRankRealtimeStyle();

  const authStore = useAuthStore();

  const [filterType, setFilterType] = useState("COMPANY_NAME");

  const [searchResult, setSearchResult] = useState(undefined);

  const keywordInputRef = useRef();
  const filterValueInputRef = useRef();
  const compareCheckBoxRef = useRef();
  const searchButton = useRef();

  const [getRealtimeTrigger, getRealtimeIsPending] = usePendingFunction(async () => {
    if (!authStore.loginUser) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if (filterValueInputRef.current.value === "") {
      alert("업체명 또는 MID를 입력해주세요.");
      filterValueInputRef.current.focus();
      return;
    }
    if (keywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      keywordInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nstore/rank/realtime?keyword=${keywordInputRef.current.value}&filterType=${filterType}&filterValue=${filterValueInputRef.current.value}&compare=${compareCheckBoxRef.current.checked}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSearchResult(dto.data);
    filterValueInputRef.current.focus();
  });

  const handleFilterTypeButtonClick = (filterType) => {
    filterValueInputRef.current.value = ``;
    setFilterType(filterType);
  };

  const handleFilterValueInputKeyUp = (event) => {
    if (event.key === "Enter") {
      keywordInputRef.current.focus();
    }
  };

  const handleKeywordInputKeyUp = (event) => {
    if (event.key === "Enter") {
      searchButton.current.click();
    }
  };

  const copyToClipboard = (text) => {
    window.navigator.clipboard.writeText(text);
    alert(`MID ${text} 복사되었습니다.`);
  };

  const openNewTabWithUrl = (url) => {
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (getRealtimeIsPending) {
      setSearchResult(undefined);
    }
  }, [getRealtimeIsPending]);

  return (
    <LayoutDefault>
      <Alert variant="primary">
        순위를 실시간으로 조회합니다
      </Alert>
      <div>
        <div>
          <Button variant={filterType !== "MID" ? "primary" : "outline-primary"}
                  onClick={() => handleFilterTypeButtonClick("COMPANY_NAME")}>
            업체명 검색
          </Button>
          <Button variant={filterType === "MID" ? "primary" : "outline-primary"} style={{ marginLeft: "5px" }}
                  onClick={() => handleFilterTypeButtonClick("MID")}>
            MID 검색
          </Button>
        </div>
        <div style={isPc ? style.searchContainerPc : style.searchContainerMobile}>
          <FloatingLabel
            controlId="floatingFilterValueInput"
            label={filterType === "MID" ? "MID" : "업체명"}>
            <Form.Control ref={filterValueInputRef} type="text"
                          placeholder={filterType === "MID" ? "MID" : "업체명"} onKeyUp={handleFilterValueInputKeyUp} />
          </FloatingLabel>
          <FloatingLabel
            controlId="floatingKeywordInput"
            label={"키워드"}>
            <Form.Control ref={keywordInputRef} type="text" placeholder="키워드"
                          onKeyUp={handleKeywordInputKeyUp} />
          </FloatingLabel>
          <div></div>
          <Button ref={searchButton} variant="primary" style={{ height: "56px" }} onClick={getRealtimeTrigger}
                  disabled={getRealtimeIsPending}>
            {getRealtimeIsPending
              ? <span className="spinner-border" role="status" aria-hidden="true"></span>
              : "검색 시작"}
          </Button>
        </div>
        <div style={style.searchCatalogCheckBoxContainer}>
          <Form.Check ref={compareCheckBoxRef} id={"compareCheckBox"} label={"카탈로그상품 포함하기"} defaultChecked={true} />
        </div>
        <hr style={style.searchResultDivider} />
        <div>
          {(() => {
            if (searchResult === undefined) {
              return <div></div>;
            } else if (searchResult === null || searchResult.nstoreRankSearchProductList.length === 0) {
              return <Card>
                <Card.Body style={style.noResult}>
                  <div>검색 결과가 없습니다. N스토어 실시간순위조회는 키워드 기준으로 300위 내의 업체가 검색됩니다.</div>
                  <div>카탈로그 상품을 검색하려면 체크박스에 체크해주세요.</div>
                </Card.Body>
              </ Card>;
            } else {
              return searchResult.nstoreRankSearchProductList.map((item, index) =>
                <Card key={index} className="m-2">
                  <Card.Body style={style.resultCardBody}>
                    <div style={style.resultImageRankContainer}>
                      <div>
                        <span style={style.resultRank}>{item.rankInfo.rank}위</span>
                        <span> / </span>
                        <span>{item.rankInfo.totalCount}개</span>
                      </div>
                      <div
                        style={{
                          ...style.resultImage,
                          backgroundImage: "url('" + item.trackInfo.productImageUrl + "')"
                        }}>
                      </div>
                    </div>
                    <div>
                      <div style={style.resultButtonContainer}>
                        <Button variant="primary"
                                onClick={() => openNewTabWithUrl(item.crUrl)}>
                          바로가기
                        </Button>
                        {/*<Button variant="outline-success"*/}
                        {/*        onClick={() => alert("준비 중입니다")}>*/}
                        {/*  추적하기*/}
                        {/*</Button>*/}
                      </div>
                      <div style={style.resultShopName}>{item.trackInfo.productName}</div>
                      <div style={style.resultAddress}>
                        {(item.trackInfo.mallName && item.trackInfo.mallName.length > 0) ? item.trackInfo.mallName : "카탈로그 상품"}
                      </div>
                      <div style={{ ...style.resultReviewAndCategoryContainer, fontSize: "15px" }}>
                        <div>리뷰({item.trackInfo.reviewCount})
                        </div>
                      </div>
                      <div style={style.resultReviewAndCategoryContainer}>
                        <div style={style.resultCategoryAndScore}>{item.trackInfo.category}</div>
                        <div style={style.resultCategoryAndScore}>{" "}평점({item.trackInfo.scoreInfo})</div>
                        <div>
                          <Button variant="outline-primary" style={style.resultMid}
                                  onClick={() => copyToClipboard(item.trackInfo.mid)}>
                            MID
                          </Button>
                        </div>
                      </div>
                    </div>
                    {item.lowMallList
                      && item.lowMallList.length > 0
                      && <div style={style.resultLowMallListContainer}>
                        <div style={style.resultLowMallListTitle}>쇼핑몰별 최저가</div>
                        {item.lowMallList.map((mall, index) => {
                          return <div key={index} style={style.resultLowMallContainer}>
                            <div style={style.resultLowMallName}>{mall.name}</div>
                            <div>{mall.price}원</div>
                          </div>;
                        })}
                      </div>}
                  </Card.Body>
                </Card>
              );
            }
          })()}
        </div>
      </div>
    </LayoutDefault>
  );
}