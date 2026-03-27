import { useEffect, useState } from "react";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Card, Col, Container, Form, ListGroup, Modal, Row, Table } from "react-bootstrap";
import usePendingFunction from "../../../../use/usePendingFunction";
import NplaceCampaignBlogWritersStyle from "./Style";

export default function NplaceCampaignBlogWritersPage() {

  const style = NplaceCampaignBlogWritersStyle();

  const [blogWritersRegisterResult, setBlogWritersRegisterResult] = useState();
  const [blogWritersVerifiedResult, setBlogWritersVerifiedResult] = useState();
  const [blogWritersAiResult, setBlogWritersAiResult] = useState();
  const [getBlogWritersRegisterTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/reward/blog-writers/register`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setBlogWritersRegisterResult(dto.data);
  });

  const [getBlogWritersVerifiedTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/reward/blog-writers/verified`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setBlogWritersVerifiedResult(dto.data);
  });

  const [getBlogWritersAiTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/reward/blog-writers/ai`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setBlogWritersAiResult(dto.data);
  });


  useEffect(() => {
    getBlogWritersRegisterTrigger();
    getBlogWritersVerifiedTrigger();
    getBlogWritersAiTrigger();
  }, []);

  const applyInitData = {
    writersType: '',
    campaignName: '',
    placeAddress: '',
    contactInfo: '',
    linkUrl: '',
    mainKeyword: ['', '', ''],
    hashtags: ['', '', '', '', ''],
    description: '',
    noticeCheck: '',
    startDate: '',
    endDate: '',
    dailyOpenCount: 0,
    imageUrl: ''
  };

  const [isWritersSelectModalShow, setIsWritersSelectModalShow] = useState(false);
  const [isCampaignApplyModalShow, setIsCampaignApplyModalShow] = useState(false);
  const [isCampaignRecruitModalShow, setIsCampaignRecruitModalShow] = useState(false);
  const [applyFormData, setApplyFormData] = useState(applyInitData);

  const handleApplyChange = (e) => {
    const { name, value } = e.target;

    if (name === 'writersType' && value === 'AI') {
      alert('AI 블로그 기자단은 상담원 별도 문의 상품입니다.');
      return false;
    }

    setApplyFormData({ ...applyFormData, [name]: value });
  };

  const handleMainKeywordChange = (index, value) => {
    const newMainkeyword = [...applyFormData.mainKeyword];
    newMainkeyword[index] = value;
    setApplyFormData({ ...applyFormData, mainKeyword: newMainkeyword });
  };

  const handleHashtagChange = (index, value) => {
    const newHashtags = [...applyFormData.hashtags];
    newHashtags[index] = value;
    setApplyFormData({ ...applyFormData, hashtags: newHashtags });
  };

  const handleWritersSelectModalShow = () => {
    setApplyFormData(applyInitData);
    setIsWritersSelectModalShow(true);
  };

  const handleWritersSelectModalClose = () => {
    setIsWritersSelectModalShow(false);
  };

  const handleWritersSelectModalNext = () => {
    if (validateWritersType()) {
      handleWritersSelectModalClose();
      handleCampaignApplyModalShow();
    }
  };

  const handleCampaignApplyModalShow = () => {
    setIsCampaignApplyModalShow(true);
  };

  const handleCampaignApplyModalClose = () => {
    setIsCampaignApplyModalShow(false);
  };

  const handleCampaignApplyModalPrev = () => {
    setIsCampaignApplyModalShow(false);
    setIsWritersSelectModalShow(true);
  };

  const handleCampaignApplyModalNext = () => {
    if (validateApplyForm()) {
      handleCampaignApplyModalClose();
      handleCampaignRecruitModalShow();
    }
  };

  const handleCampaignRecruitModalShow = () => {
    setIsCampaignRecruitModalShow(true);
  };

  const handleCampaignRecruitModalClose = () => {
    setIsCampaignRecruitModalShow(false);
  };

  const handleCampaignRecruitModalPrev = () => {
    setIsCampaignApplyModalShow(true);
    setIsCampaignRecruitModalShow(false);
  };

  const validateWritersType = () => {
    if (!applyFormData.writersType.trim()) {
      alert('블로그 기자단을 선택해주세요.');
      return false;
    }
    return true;
  }

  const validateApplyForm = () => {
    if (!applyFormData.campaignName.trim()) {
      alert('캠페인 이름을 입력해주세요.');
      return false;
    }
    if (!applyFormData.placeAddress.trim()) {
      alert('매장 주소를 입력해주세요.');
      return false;
    }
    if (!applyFormData.contactInfo.trim()) {
      alert('문의 연락처를 입력해주세요.');
      return false;
    }
    if (!applyFormData.linkUrl.trim()) {
      alert('링크의 URL을 입력해주세요.');
      return false;
    }
    const filledMainkeyword = applyFormData.mainKeyword.filter(keyword => keyword.trim() !== '');
    if (filledMainkeyword.length < 3) {
      alert('3개 이상의 메인키워드를 입력해주세요.');
      return false;
    }
    
    const filledHashtags = applyFormData.hashtags.filter(tag => tag.trim() !== '');
    if (filledHashtags.length < 5) {
      alert('5개 이상의 해시태그를 입력해주세요.');
      return false;
    }
  
    if (!applyFormData.description.trim()) {
      alert('업체 소개를 입력해주세요.');
      return false;
    }
  
    return true;
  };

  const validateRecruitForm = () => {
    if (!applyFormData.startDate.trim() || !applyFormData.endDate.trim()) {
      alert('캠페인 모집기간을 입력해주세요.');
      return false;
    }

    return true;
  };

  const [postBlogWritersTrigger] = usePendingFunction(async () => {
    if (validateRecruitForm()) {
      const dto = await fetch(`/v1/nplace/reward/blog-writers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nplaceRewardBlogWritersRegister: applyFormData
        })
      }).then((response) => response.json());
      if (dto.code !== 0) {
        alert(dto.message);
        return;
      }
      alert("신청 완료되었습니다.");
      handleCampaignRecruitModalClose();
      getBlogWritersRegisterTrigger();
    }
  });
  
  const [totalPossibleCount, setTotalPossibleCount] = useState(0);
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1을 해서 시작일도 포함
  };
  useEffect(() => {
    const totalDays = calculateTotalDays(applyFormData.startDate, applyFormData.endDate);
    const total = totalDays * (parseInt(applyFormData.dailyOpenCount) || 0);
    setTotalPossibleCount(total);
    
  }, [applyFormData.startDate, applyFormData.endDate, applyFormData.dailyOpenCount]);

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (blogWritersVerifiedResult) {
      let price;
      if (applyFormData.writersType === "VERIFIED") {
        price = totalPossibleCount * blogWritersVerifiedResult.blogWriters.price * 1.1;
      } else {
        price = 0;
      }
      setTotalPrice(price);
    }
    
  }, [totalPossibleCount]);
  

  return (
    <LayoutDefault>
      <Card>
        <Card.Body>
          <Button variant="primary" className="me-3" onClick={handleWritersSelectModalShow}>캠페인 등록</Button>
          <hr />
          <Table hover>
            <thead>
            <tr>
            <th scope="col">기자단 종류</th>
              <th scope="col">캠페인 이름</th>
              <th scope="col">시작일자</th>
              <th scope="col">마감일자</th>
              <th scope="col">1일 개수</th>
              <th scope="col">총 개수</th>
            </tr>
            </thead>
            <tbody>
              {blogWritersRegisterResult && blogWritersRegisterResult.nplaceRewardBlogWritersRegisterList.length > 0? <>
                {blogWritersRegisterResult.nplaceRewardBlogWritersRegisterList.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.writersType}
                    </td>
                    <td>
                      {item.campaignName}
                    </td>
                    <td>
                      {item.startDate}
                    </td>
                    <td>
                      {item.endDate}
                    </td>
                    <td>
                      {item.dailyOpenCount}
                    </td>
                    <td>
                      {item.totalOpenCount}
                    </td>
                  </tr>
                ))}  
                </>
                : <>
                  <tr>
                    <td colSpan={2} className="text-center">등록된 캠페인이 없습니다.</td>
                  </tr>
                </>
              }
              
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={isWritersSelectModalShow} scrollable size={"lg"} backdrop="static" onHide={handleWritersSelectModalClose}>
      <Modal.Header closeButton>
          <Modal.Title>캠페인 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} md={2} className="g-4">
            <Col>
              <Card style={style.blogCard}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Form.Check
                    inline
                    label="실명 인증 참여 블로그 기자단"
                    name="writersType"
                    type="radio"
                    id="writersTypeA"
                    value="VERIFIED"
                    onChange={handleApplyChange}
                    checked={applyFormData.writersType === "VERIFIED"}
                  />
                  <span className="text-primary fw-bold">{blogWritersVerifiedResult ? blogWritersVerifiedResult.blogWriters.price : ""}원</span>
                </Card.Header>
                <Card.Body>
                  <ListGroup.Item className="border-0">
                    500글자 전후
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    이미지 5장~10장 랜덤
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    블로그 지수 준최2 70% 이상
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    [불법, 대출, 병원, 문신, 코인 불가]
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    [순위추적 상품 이용고객 할인]
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    [병원 블로그 기자단 상담원 별도 문의]
                  </ListGroup.Item>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Form.Check
                    inline
                    label="AI 블로그 기자단"
                    name="writersType"
                    type="radio"
                    id="writersTypeB"
                    value="AI"
                    onChange={handleApplyChange}
                    checked={applyFormData.writersType === "AI"}
                  />
                  <span className="text-primary fw-bold">{blogWritersAiResult ? blogWritersAiResult.blogWriters.price : ""}원</span>
                </Card.Header>
                <Card.Body>
                  <ListGroup.Item className="border-0">
                    700글자 전후
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    이미지 3장~7장 랜덤
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    블로그 지수 준최2 70% 이상
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    [상담원 별도 문의]
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    [순위추적 상품 이용고객 할인]
                  </ListGroup.Item>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>

        <Col className="mt-3 text-center d-flex justify-content-center gap-3">
          <Button variant="outline-secondary" onClick={handleWritersSelectModalClose}>취소</Button>
          <Button variant="primary" className="me-3" onClick={handleWritersSelectModalNext}>다음</Button>
        </Col>

      </Modal>
      
      <Modal show={isCampaignApplyModalShow} scrollable size={"lg"} backdrop="static" onHide={handleCampaignApplyModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>캠페인 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="campaignName">
            <Form.Label>업체명</Form.Label>
            <Form.Control
              type="text"
              placeholder="업체명을 입력해주세요."
              name="campaignName"
              value={applyFormData.campaignName}
              onChange={handleApplyChange}
            />
          </Form.Group>

          <Form.Group controlId="placeAddress" className="mt-3">
            <Form.Label>주소(지도반영)
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="주소를 입력해주세요"
              name="placeAddress"
              value={applyFormData.placeAddress}
              onChange={handleApplyChange}
            />
          </Form.Group>

          <Form.Group controlId="contactInfo" className="mt-3">
            <Form.Label>업체 전화번호
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="전화번호를 입력해주세요"
              name="contactInfo"
              value={applyFormData.contactInfo}
              onChange={handleApplyChange}
            />
          </Form.Group>

          <Form.Group controlId="linkUrl" className="mt-3">
            <Form.Label>플레이스주소(URL)
            </Form.Label>
            <Form.Control
              type="url"
              placeholder="링크의 URL을 입력해주세요"
              name="linkUrl"
              value={applyFormData.linkUrl}
              onChange={handleApplyChange}
            />
          </Form.Group>

          <Form.Group controlId="mainKeyword" className="mt-3">
            <Form.Label>메인 키워드 (3~5개)</Form.Label>
            <Row className="g-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <Col key={index} xs={6} md={3}>
                  <Form.Control
                    type="text"
                    value={applyFormData.mainKeyword[index]}
                    onChange={(e) => handleMainKeywordChange(index, e.target.value)}
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          <Form.Label className="mt-3">해시태그 입력 (5~10개)</Form.Label>
          <Row className="g-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => (
              <Col key={index} xs={6} md={3}>
                <Form.Control
                  type="text"
                  placeholder={index === 0 ? `#해시태그` : ''}
                  value={applyFormData.hashtags[index]}
                  onChange={(e) => handleHashtagChange(index, e.target.value)}
                />
              </Col>
            ))}
          </Row>

          <Form.Group controlId="description" className="mt-3">
            <Form.Label>업체 소개 (300자 이상)
              <Form.Text className="text-muted d-block">
                업체 소개는 리뷰어분들이 본문 작성시 참고하는 부분입니다.<br/>
                장점, 영업시간, 가격, 후기, 특이사항 등 업체 소개를 구체적으로 입력해주시면<br/>
                다양하고 풍성한 내용이 작성될 수 있습니다.<br/>
              </Form.Text>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="캠페인 내용을 등록해주세요"
              name="description"
              value={applyFormData.description}
              onChange={handleApplyChange}
            />
          </Form.Group>

          <hr/>

          <Container className="mt-4">
            <Card>
              <Card.Body>
                <Card.Title>필독 사항</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="border-0">
                    1. 블로거가 가이드로 통해 포스팅하기 때문에, 내용 및 이미지가 중복될 수 있습니다.
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    2. 블로거가 포스팅을 진행하면, 내용, 이미지, 수정 및 추가 삭제 불가.<br />
                    (삭제는 담당자에게 별도 요청)
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0">
                    3. 법적 문제가 발생할 수 있는 이미지, 내용 전달로 인해 문제 발생 시<br />
                    [모든 책임은 블로그 기자단 신청자에게 있습니다.]
                  </ListGroup.Item>
                </ListGroup>
                <Form.Check
                  type="checkbox"
                  label="동의합니다."
                  className="mt-3"
                  name="noticeCheck"
                  value="Y"
                  onChange={handleApplyChange}
                  checked={applyFormData.noticeCheck === "Y"}
                />
              </Card.Body>
            </Card>
          </Container>

          <Col className="mt-3 text-center d-flex justify-content-center gap-3">
            <Button variant="outline-secondary" onClick={handleCampaignApplyModalPrev}>이전</Button>
            <Button variant="primary" className="me-3" onClick={handleCampaignApplyModalNext}>다음</Button>
          </Col>
          
        </Modal.Body>
      </Modal>

      <Modal show={isCampaignRecruitModalShow} scrollable size={"lg"} backdrop="static" onHide={handleCampaignRecruitModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>캠페인 모집 정보 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form.Group className="mb-3">
            <Form.Label>캠페인 모집기간
              <Form.Text muted>
                (최소 3일 ~ 7일 권장)
              </Form.Text>
            </Form.Label>
            <Row>
              <Col sm={4}>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={applyFormData.startDate}
                  onChange={handleApplyChange}
                />
              </Col>
              <Col sm={1} className="align-content-center text-center">~</Col>
              <Col sm={4}>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={applyFormData.endDate}
                  onChange={handleApplyChange}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>캠페인 진행기간
              <Form.Text muted>
                (익일 진행, 주말 및 공휴일 신청X)
              </Form.Text>
            </Form.Label>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>1일 오픈 건수</Form.Label>
            <Row>
              <Col sm={2}>
                <Form.Control
                  type="number"
                  name="dailyOpenCount"
                  value={applyFormData.dailyOpenCount}
                  onChange={handleApplyChange}
                />
              </Col>
              <Col className="ps-0 align-content-center">
                <Form.Label>건</Form.Label>
              </Col>
            </Row>
            <Form.Text className="d-block text-danger">*1일 오픈 최소 건수는 5건이며, 최대 건수는 50건 입니다. ( 예외의 경우 별도 상담 신청 )</Form.Text>
            <Form.Text className="d-block text-danger">*캠페인 참여하는 블로그 지수는 준최2 블로그가 70% 이상이며, 네이버 환경에 따라 변경될수 있습니다.</Form.Text>
            <Form.Text className="d-block text-danger">*캠페인 진행시 참여자의 상황과 주말 및 공휴일의 경우에 따라 목표한 1일 개수가 미달 될수 있습니다.<br/>( 단, 캠페인 마감일자에 맞춰 모든 기자단 총진행 개수는 95% 이상 맞추어 마감 됩니다.)</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>진행 가능 건 수</Form.Label>
            {/* <Form.Label className="d-block">1건</Form.Label> */}
            <div className="d-flex align-items-center">
              <h6 className="mb-0 text-primary">{totalPossibleCount}</h6>
              <span className="ms-2">건</span>
            </div>
            <Form.Text className="d-block text-danger">*해당 수치는 캠페인 진행 기간에 맞춰 자동 계산 됩니다.</Form.Text>
          </Form.Group>

          <Form.Group controlId="imageUrl" className="mt-3">
            <Form.Label>블로그 기자단 이미지 업로드</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="추가 이미지 URL을 입력해주세요."
              name="imageUrl"
              value={applyFormData.imageUrl}
              onChange={handleApplyChange}
            />
            <Form.Text className="d-block text-danger">*구글 드라이브 링크 클릭하여 이미지 업로드 방법에 맞게 업로드 합니다.</Form.Text>
            <Card className="mt-2 bg-light">
            <Card.Body>
              <h6 className="fw-bold">▶사진 업로드 구글드라이브</h6>
              <div className="ms-2">
                <a 
                  href="https://drive.google.com/drive/folders/1FmcGpxO-DlobZDuwmp6By7nqUqItFmfQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  구글드라이브 샘플 보기
                </a>
              </div>
              
              <h6 className="mt-3 fw-bold">※ 사진 업로드시 방법</h6>
              <ul className="list-unstyled ms-2">
                <li>- 사진 최소 200장 이상 (최대 1.8mb 이하)</li>
                <li>- 아래 기준으로 세부 폴더로 사진 정리후</li>
                <li>- 메인 폴더0 을 드래그 하여 업로드</li>
                <li className="text-danger">  (알집 하지 않고 폴더 그대로 드래그 업로드)</li>
              </ul>

              <div className="ms-2 mt-2">
                <div className="fw-bold">폴더0 플레이스명</div>
                <ul className="list-unstyled ms-3">
                  <li>ㄴ폴더1 외부 사진</li>
                  <li>ㄴ폴더2 내부 사진</li>
                  <li>ㄴ폴더3 음식 사진 (상품사진 or 서비스 진행 사진)</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
          </Form.Group>

          <hr></hr>
          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>총 금액</label>
            </Col>
            <Col xs={8}>
              <div className="text-end me-3">
                <span className="fw-bold fs-5">{totalPrice.toLocaleString()}</span>
                <span>원</span>
              </div>
            </Col>
          </Row>
          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>입금 계좌</label>
            </Col>
            <Col xs={8}>
              <div className="text-end me-3">
                {
                  applyFormData.writersType === "VERIFIED" && blogWritersVerifiedResult ? `${blogWritersVerifiedResult.blogWriters.bankName} ${blogWritersVerifiedResult.blogWriters.accountNumber} ${blogWritersVerifiedResult.blogWriters.deposit}` : "등록된 계좌정보가 없습니다."
                }
              </div>
            </Col>
          </Row>

          <Col className="mt-3 text-center d-flex justify-content-center gap-3">
            <Button variant="outline-secondary" onClick={handleCampaignRecruitModalPrev}>이전</Button>
            <Button variant="primary" onClick={postBlogWritersTrigger}>등록</Button>
          </Col>



        </Modal.Body>
      </Modal>
    </LayoutDefault>
  );
}