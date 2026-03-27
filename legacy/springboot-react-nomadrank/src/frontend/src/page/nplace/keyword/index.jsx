import { Button, Card, Col, Form, Row, Stack, Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import NplaceKeywordStyle from "./Style";
import { useRef, useState } from "react";
import usePendingFunction from "../../../use/usePendingFunction";

export default function NplaceKeywordPage() {
  const style = NplaceKeywordStyle();

  const keywordInputRef = useRef();
  const [keywordToolList, setKeywordToolList] = useState([]);
  const [nblogSearchInfoResultMap, setNblogSearchInfoResultMap] = useState(new Map());

  const [getNplaceKeywordNsearchadKeywordstoolTrigger, getNplaceKeywordNsearchadKeywordstoolIsPending] = usePendingFunction(async () => {
    if (keywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      keywordInputRef.current.focus();
      return;
    }
    const dto = await fetch(`/v1/nplace/keyword/nsearchad/keywordstool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceKeywordNsearchadKeywordstoolKeyword: {
          keywordString: keywordInputRef.current.value
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setKeywordToolList(dto.data.keywordToolList);
    for (let index = 0; index < dto.data.keywordToolList.length; index++) {
      const keywordTool = dto.data.keywordToolList[index];
      getNplaceKeywordNblogSearchInfo(keywordTool.relKeyword);
    }
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

  const resetData = () => {
    if (confirm('입력값을 지우시곘습니까?')) {
      setKeywordToolList([]);
      setNblogSearchInfoResultMap(new Map());
      keywordInputRef.current.value = "";
    }
  };

  return (
    <LayoutDefault>
      <Card style={style.card}>
        <Row className="p-3">
          <Col xs={8}>
            <Form.Control as="textarea" rows={5} style={style.textarea} ref={keywordInputRef} placeholder="한 줄에 하나씩 입력하세요." />
          </Col>
          <Col xs={4}>
            <Stack gap={2} className="h-100">
              <Button variant="primary" className="h-50" onClick={getNplaceKeywordNsearchadKeywordstoolTrigger} disabled={getNplaceKeywordNsearchadKeywordstoolIsPending}>조회하기</Button>
              <Button variant="outline-primary" className="h-50" onClick={resetData}>입력값지우기</Button>
            </Stack>
          </Col>
        </Row>        
      </Card>
      <br/>
      <Card style={style.card}>
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
    </LayoutDefault>
  );
}