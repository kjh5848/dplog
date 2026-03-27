import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useCallback, useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useUtilStore } from "/src/store/StoreProvider.jsx";
import { Button, Card, FloatingLabel, Form, Table } from "react-bootstrap";
import NplaceKeywordRelationStyle from "/src/page/nplace/keyword/relation/Style.jsx";

export default function NplaceKeywordRelationPage() {

  const { isPc } = useUtilStore();

  const style = NplaceKeywordRelationStyle();

  const [keywordToolList, setKeywordToolList] = useState([]);

  const [keywordToolListByInfiniteScroll, setKeywordToolListByInfiniteScroll] = useState([]);

  const [nblogSearchInfoResultMap, setNblogSearchInfoResultMap] = useState(new Map());

  const keywordInputRef = useRef();
  const searchButton = useRef();

  const [getNplaceKeywordNsearchadKeywordstoolRelationTrigger, getNplaceKeywordNsearchadKeywordstoolRelationIsPending] = usePendingFunction(async () => {
    if (keywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      keywordInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nplace/keyword/nsearchad/keywordstool/relation?keywordList=${keywordInputRef.current.value}&requestType=RELATION`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setKeywordToolList(dto.data.keywordToolList);
    setKeywordToolListByInfiniteScroll(dto.data.keywordToolList.slice(0, 100));
    keywordInputRef.current.focus();
  });

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

  useEffect(() => {
    let stopper = false;
    const fetchGetNplaceKeywordNblogSearchInfo = async () => {
      for (const thisKeywordTool of keywordToolListByInfiniteScroll) {
        if (stopper) {
          break;
        }
        if (nblogSearchInfoResultMap.has(thisKeywordTool.relKeyword)) {
          continue;
        }
        await getNplaceKeywordNblogSearchInfo(thisKeywordTool.relKeyword);
      }
    }
    if (keywordToolListByInfiniteScroll.length > 0) {
      fetchGetNplaceKeywordNblogSearchInfo();
    }
    return () => {
      stopper = true;
    };
  }, [keywordToolListByInfiniteScroll]);

  const handleKeywordInputKeyUp = (event) => {
    if (event.key === "Enter") {
      searchButton.current.click();
    }
  };

  useEffect(() => {
    if (getNplaceKeywordNsearchadKeywordstoolRelationIsPending) {
      setKeywordToolList([]);
      setKeywordToolListByInfiniteScroll([]);
    }
  }, [getNplaceKeywordNsearchadKeywordstoolRelationIsPending]);

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (keywordToolListByInfiniteScroll.length < keywordToolList.length) {
        setKeywordToolListByInfiniteScroll(keywordToolListByInfiniteScroll.concat(keywordToolList.slice(keywordToolListByInfiniteScroll.length, keywordToolListByInfiniteScroll.length + 100)));
      }
    }
  }, [keywordToolListByInfiniteScroll, keywordToolList]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <LayoutDefault>
      <div>
        <div style={isPc ? style.searchContainerPc : style.searchContainerMobile}>
          <div></div>
          <FloatingLabel
            controlId="floatingKeywordInput"
            label={"키워드"}>
            <Form.Control ref={keywordInputRef} type="text" placeholder="키워드"
                          onKeyUp={handleKeywordInputKeyUp} />
          </FloatingLabel>
          <Button ref={searchButton} variant="primary" style={{ height: "56px" }}
                  onClick={getNplaceKeywordNsearchadKeywordstoolRelationTrigger}
                  disabled={getNplaceKeywordNsearchadKeywordstoolRelationIsPending}
          >
            {getNplaceKeywordNsearchadKeywordstoolRelationIsPending
              ? <span className="spinner-border" role="status" aria-hidden="true"></span>
              : "검색 시작"}
          </Button>
          <div></div>
        </div>
        <hr style={style.searchResultDivider} />
        <div>
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
                  keywordToolListByInfiniteScroll.map((thisKeywordTool, thisKeywordToolIndex) =>
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
        </div>
      </div>
    </LayoutDefault>
  );
}