import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import NplaceRankRealtimeStyle from "/src/page/nplace/rank/realtime/Style.jsx";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useUtilStore } from "/src/store/StoreProvider.jsx";
import { Alert, Button, Card, FloatingLabel, Form } from "react-bootstrap";

export default function NplaceRankRealtimePage() {

  const { isPc } = useUtilStore();

  const style = NplaceRankRealtimeStyle();

  const authStore = useAuthStore();

  const [filterType, setFilterType] = useState("COMPANY_NAME");

  const [searchResult, setSearchResult] = useState(undefined);

  const provinceSelectRef = useRef();
  const keywordInputRef = useRef();
  const filterValueInputRef = useRef();
  const searchButton = useRef();

  const [getRealtimeTrigger, getRealtimeIsPending] = usePendingFunction(async () => {
    if (!authStore.loginUser) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if (filterValueInputRef.current.value === "") {
      alert("업체명 또는 SHOP_ID를 입력해주세요.");
      filterValueInputRef.current.focus();
      return;
    }
    if (keywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      keywordInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/realtime?keyword=${keywordInputRef.current.value}&filterType=${filterType}&filterValue=${filterValueInputRef.current.value}&province=${provinceSelectRef.current.value}`, {
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
    alert(`SHOP_ID ${text} 복사되었습니다.`);
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
          <Button variant={filterType !== "SHOP_ID" ? "primary" : "outline-primary"}
                  onClick={() => handleFilterTypeButtonClick("COMPANY_NAME")}>
            업체명 검색
          </Button>
          <Button variant={filterType === "SHOP_ID" ? "primary" : "outline-primary"} style={{ marginLeft: "5px" }}
                  onClick={() => handleFilterTypeButtonClick("SHOP_ID")}>
            SHOP_ID 검색
          </Button>
        </div>
        <div style={isPc ? style.searchContainerPc : style.searchContainerMobile}>
          <Form.Select ref={provinceSelectRef}>
            <option value="서울시">서울시</option>
            <option value="부산시">부산시</option>
            <option value="대구시">대구시</option>
            <option value="인천시">인천시</option>
            <option value="광주시">광주시</option>
            <option value="대전시">대전시</option>
            <option value="울산시">울산시</option>
            <option value="세종시">세종시</option>
            <option value="경기도">경기도</option>
            <option value="강원도">강원도</option>
            <option value="충청북도">충청북도</option>
            <option value="충청남도">충청남도</option>
            <option value="전라북도">전라북도</option>
            <option value="전라남도">전라남도</option>
            <option value="경상북도">경상북도</option>
            <option value="경상남도">경상남도</option>
            <option value="제주도">제주도</option>
          </Form.Select>
          <FloatingLabel
            controlId="floatingFilterValueInput"
            label={filterType === "SHOP_ID" ? "SHOP_ID" : "업체명"}>
            <Form.Control ref={filterValueInputRef} type="text"
                          placeholder={filterType === "SHOP_ID" ? "SHOP_ID" : "업체명"}
                          onKeyUp={handleFilterValueInputKeyUp} />
          </FloatingLabel>
          <FloatingLabel
            controlId="floatingKeywordInput"
            label={"키워드"}>
            <Form.Control ref={keywordInputRef} type="text" placeholder="키워드"
                          onKeyUp={handleKeywordInputKeyUp} />
          </FloatingLabel>
          <Button ref={searchButton} variant="primary" style={{ height: "56px" }} onClick={getRealtimeTrigger}
                  disabled={getRealtimeIsPending}>
            {getRealtimeIsPending
              ? <span className="spinner-border" role="status" aria-hidden="true"></span>
              : "검색 시작"}
          </Button>
        </div>
        <hr style={style.searchResultDivider} />
        <div>
          {(() => {
            if (searchResult === undefined) {
              return <div></div>;
            } else if (searchResult === null || searchResult.nplaceRankSearchShopList.length === 0) {
              return <Card>
                <Card.Body style={style.noResult}>
                  검색 결과가 없습니다. N플레이스 실시간순위조회는 지역과 키워드 기준으로 300위 내의 업체가 검색됩니다.
                </Card.Body>
              </Card>;
            } else {
              return searchResult.nplaceRankSearchShopList.map((item, index) => {
                return <Card key={index} className="m-2">
                  <Card.Body style={style.resultCardBody}>
                    <div style={style.resultImageRankContainer}>
                      <div>
                        <span style={style.resultRank}>{item.rankInfo.rank}위</span>
                        <span> / </span>
                        <span>{item.rankInfo.totalCount}개</span>
                      </div>
                      <div
                        style={{ ...style.resultImage, backgroundImage: "url('" + item.trackInfo.shopImageUrl + "')" }}>
                      </div>
                    </div>
                    <div>
                      <div style={style.resultButtonContainer}>
                        <Button variant="primary"
                                onClick={() => openNewTabWithUrl(`https://m.place.naver.com/place/${item.trackInfo.shopId}`)}>
                          바로가기
                        </Button>
                        {/*<Button variant="outline-success"*/}
                        {/*        onClick={() => alert("준비 중입니다")}>*/}
                        {/*  추적하기*/}
                        {/*</Button>*/}
                      </div>
                      <div style={style.resultShopName}>{item.trackInfo.shopName}</div>
                      <div style={style.resultAddress}>
                        {(item.trackInfo.roadAddress && item.trackInfo.roadAddress !== "null")
                          ? item.trackInfo.roadAddress
                          : item.trackInfo.address}
                      </div>
                      <div style={{ ...style.resultReviewAndCategoryContainer, fontSize: "15px" }}>
                        <div>방문자 리뷰({item.trackInfo.visitorReviewCount})
                        </div>
                        <div>블로그 리뷰({item.trackInfo.blogReviewCount})
                        </div>
                      </div>
                      <div style={style.resultReviewAndCategoryContainer}>
                        <div style={style.resultCategoryAndScore}>{item.trackInfo.category}</div>
                        <div style={style.resultCategoryAndScore}>{" "}평점({item.trackInfo.scoreInfo})</div>
                        <div>
                          <Button variant="outline-primary" style={style.resultShopId}
                                  onClick={() => copyToClipboard(item.trackInfo.shopId)}>
                            SHOP_ID
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>;
              });
            }
          })()}
        </div>
      </div>
    </LayoutDefault>
  );
}