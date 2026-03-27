import { useNavigate, useParams } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "../../use/usePendingFunction";

export default function ProductPage() {

  const navigate = useNavigate();
  const { id } = useParams();
  const [searchResult, setSearchResult] = useState(undefined);
  const [nplaceCampaignTraffic, setNplaceCampaignTraffic] = useState(""); // 입력 값 상태 추가

  const nplaceCampaignTrafficInputRef = useRef();

  const [getProductTrigger, getProductIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/product/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSearchResult(dto.data);
  });

  useEffect(() => {
    getProductTrigger();
  }, []);

  useEffect(() => {
    if (getProductIsPending) {
      setSearchResult(undefined);
    }
  }, [getProductIsPending]);

  useEffect(() => {
    if (searchResult) {
      setNplaceCampaignTraffic(searchResult.product.nplaceCampaignTrafficPoint || ""); // searchResult가 변경될 때 입력 값을 초기화
    }
  }, [searchResult]);

  const handleNplaceCampaignTrafficChange = (event) => {
    setNplaceCampaignTraffic(event.target.value); // 입력 값 상태 업데이트
  };

  const [postProductTrigger] = usePendingFunction(async () => {
    if (nplaceCampaignTraffic.trim() === "") {
      alert("N 플레이스 유저유입 포인트를 입력해주세요.");
      return;
    }

    const dto = await fetch(`/v1/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product: {
          nplaceCampaignTrafficPoint: nplaceCampaignTraffic // 상태값 사용
        },
        distributor: {
          id: id
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
      navigate(`/distributor/list`);
    }
  });

  return (
    <LayoutDefault>
      <Form>
        {(() => {
          if (searchResult === undefined) {
            return <div></div>;
          } else {
            return searchResult.map((item, index) => {
              return (
                <Form.Group as={Row} className="mb-3" controlId="nplaceCampaignTraffic" key={index}>
                  <Form.Label column sm={3}>
                    {item.name}
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      placeholder="N 플레이스 유저유입"
                      name="nplaceCampaignTraffic"
                      ref={nplaceCampaignTrafficInputRef}
                      value={nplaceCampaignTraffic} // 상태를 사용
                      onChange={handleNplaceCampaignTrafficChange} // 변경 이벤트 핸들러 추가
                    />
                  </Col>
                </Form.Group>
              );
            });
          }
        })()}

        <Form.Group as={Row} className="mb-3">
          <Col sm={{ span: 9, offset: 3 }}>
            <Button className="me-3" onClick={postProductTrigger}>수정</Button>
            <Button variant="outline-secondary" onClick={() => navigate(`/distributor/list`)}>취소</Button>
          </Col>
        </Form.Group>
      </Form>
    </LayoutDefault>
  );
}
