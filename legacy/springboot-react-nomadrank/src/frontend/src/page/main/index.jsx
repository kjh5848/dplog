import { Button, Card, Col, Container, Form, Nav, Navbar, Row } from "react-bootstrap";
import MainImage from "/src/asset/main.png"
import MapImage from "/src/asset/map.png"
import MainStyle from "./Style";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "/src/store/StoreProvider.jsx";

export default function MainPage() {
  const style = MainStyle();
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const loginHandler = () => {
    if (authStore.loginUser) {
      navigate("/nplace/rank/realtime");
    } else {
      navigate(`/login`);  
    }
  };

  const cities = ["서울", "대전", "대구", "부산", "광주", "울산", "인천", "제주도", "경기도"];

  const plans = [
    {
      discount: "51% 할인",
      title: "A 요금제",
      originalPrice: "20,000원",
      discountedPrice: "10,000원",
      description: "소규모 사업용 베이직",
      features: [
        { text: "플레이스 순위추적 키워드", value: "10개" },
        { text: "플레이스 실시간 순위조회", value: "1일 50회" },
        { text: "N사 키워드 월간 조회수 분석", value: "1일 50회" },
        { text: "플레이스 순위추적 등록시 태그 분석 서비스", value: "" },
      ],
      popular: false,
    },
    {
      discount: "50% 할인",
      title: "B 요금제",
      originalPrice: "40,000원",
      discountedPrice: "20,000원",
      description: "중소규모 사업용 스타터",
      features: [
        { text: "플레이스 순위추적 키워드", value: "50개" },
        { text: "플레이스 실시간 순위조회", value: "1일 100회" },
        { text: "N사 키워드 월간 조회수 분석", value: "1일 100회" },
        { text: "플레이스 순위추적 등록시 태그 분석 서비스", value: "" },
      ],
      popular: true,
    },
    {
      discount: "40% 할인",
      title: "C 요금제",
      originalPrice: "60,000원",
      discountedPrice: "36,000원",
      description: "기업용 프로",
      features: [
        { text: "플레이스 순위추적 키워드", value: "100개" },
        { text: "플레이스 실시간 순위조회", value: "1일 200회" },
        { text: "N사 키워드 월간 조회수 분석", value: "1일 200회" },
        { text: "플레이스 순위추적 등록시 태그 분석 서비스", value: "" },
      ],
      popular: false,
    },
    {
      discount: "30% 할인",
      title: "D 요금제",
      originalPrice: "80,000원",
      discountedPrice: "56,000원",
      description: "대기업용 프리미엄",
      features: [
        { text: "플레이스 순위추적 키워드", value: "200개" },
        { text: "플레이스 실시간 순위조회", value: "1일 500회" },
        { text: "N사 키워드 월간 조회수 분석", value: "1일 500회" },
        { text: "플레이스 순위추적 등록시 태그 분석 서비스", value: "" },
      ],
      popular: true,
    },
  ];

  const handleTrackBtnClick = () => {
    navigate(`/login`);
  };

  return (
    
    <Container className="text-center vh-100 d-flex flex-column bg-white" style={style.container}>
      <Navbar bg="white" className="justify-content-end pe-3 pb-3 border-bottom">
        <Nav>
          <Button variant="outline-primary" className="me-3" onClick={() => navigate(`/sign-up`)}>회원가입</Button>
          <Button variant="primary" onClick={loginHandler}>로그인</Button>
        </Nav>
      </Navbar>
      <Row className="pt-3">
        <Col className="text-center">
          <img
            src={MainImage}
            alt="Centered"
            className="img-fluid"
          />
        </Col>
      </Row>

      <Row className="bg-white mt-5">
        <Col md={6}>
          <img
            src={MapImage}
            alt="Left"
            className="img-fluid"
          />
        </Col>
        <Col md={6}>
          <Container style={{ maxWidth: "600px" }} className="mt-5 text-center">
            {/* 헤더 텍스트 */}
            <h3 className="fw-bold mb-4" style={style.largeText}>대한민국 어느 지역이든 내순위 추적 가능!</h3>

            {/* 도시 버튼 리스트 */}
            <Row className="justify-content-center mb-4">
              {cities.map((city, index) => (
                <Col key={index} xs="auto" className="mb-2">
                  <Button variant="light" className="city-button" style={style.cityButton}>
                    {city}
                  </Button>
                </Col>
              ))}
            </Row>

            {/* 검색 폼 */}
            <div className="search-box p-4" style={style.searchBox}>
              <Row className="mb-3">
                <Col>
                  <Form.Control type="text" placeholder="위치" className="input-box" style={style.inputBox} />
                </Col>
                <Col>
                  <Form.Control type="text" placeholder="업체명" className="input-box" style={style.inputBox} />
                </Col>
              </Row>
              <Form.Control type="text" placeholder="키워드" className="input-box mb-3" style={style.inputBox} />

              {/* 버튼 */}
              <Button variant="dark" className="track-button" style={style.trackButton} onClick={handleTrackBtnClick}>
                내순위 추적하기
              </Button>
            </div>
          </Container>
        </Col>
      </Row>

      <Row>
        <Container style={style.container}>
          {/* 상단 헤더 */}
          <div className="d-flex justify-content-between align-items-center mt-5">
            <div>
              <h2 style={style.headerText}>가입 없이도 사용할 수 있어요!</h2>
              <p style={style.subText} className="text-start">누구나 누릴 수 있는 무료 서비스</p>
            </div>
            <Button style={style.trackButton} onClick={handleTrackBtnClick}>내 순위 추적하기</Button>
          </div>

          {/* 혜택 카드 */}
          <Row className="mt-4">
            <Col md={6}>
              <Card style={style.card}>
                <Card.Body>
                  <h5 className="fw-bold text-start">비회원 혜택</h5>
                  <hr></hr>
                  <ul className="mt-3 text-start">
                    <li style={style.listItem}>실시간순위조회: 1일 1회</li>
                    <li style={style.listItem}>키워드 분석: 1일 10회</li>
                    <ul>
                      <li style={style.listItem}>키워드조회: 5회</li>
                      <li style={style.listItem}>연관 키워드: 5회</li>
                    </ul>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card style={style.card}>
                <Card.Body>
                  <h5 className="fw-bold text-start">무료 회원 혜택</h5>
                  <hr></hr>
                  <ul className="mt-3 text-start">
                    <li style={style.listItem}>플레이스 실시간 순위조회: 1일 3회</li>
                    <li style={style.listItem}>키워드 분석: 1일 10회</li>
                    <li style={style.listItem}>플레이스 순위추적:</li>
                    <ul>
                      <li style={style.listItem}>플레이스 1개 등록</li>
                      <li style={style.listItem}>키워드 1개 (1슬롯)</li>
                      <li style={style.listItem}>7일간 서비스</li>
                      <li style={style.listItem}>등록시 플레이스내 태그 분석 서비스</li>
                      <li style={style.listItem}>1일 1회 순위체크 (오후 1시경)</li>
                      <li style={style.listItem}>저장하기 개수, 방문자 리뷰 개수 업데이트</li>
                    </ul>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Row>

      <Row className="mt-5 bg-white">
        {/* 상단 헤더 */}
        <div className="d-flex justify-content-between align-items-center pt-5">
          <div>
            <h2 style={style.headerText}>가입하면 더욱 커지는 혜택!!</h2>
            <p style={style.subText} className="text-start">실시간 조회수 Up! 분석도 Up!</p>
          </div>
        </div>
        <Row className="justify-content-center mt-4">
          {plans.map((plan, index) => (
            <Col key={index} md={6} lg={6} className="mb-4">
              <Card className={`h-100`} style={plan.popular ? style.popularMembershipCard : style.membershipCard}>
                <Card.Body className="text-start">
                {plan.popular && (
                      <Button
                        style={style.popularButton}
                      >
                        인기
                      </Button>
                    )}
                  <Card.Subtitle className="text-muted">{plan.discount}</Card.Subtitle>
                  <h4 className="mt-2 fw-bold">{plan.title}</h4>
                  <Card.Text className="text-decoration-line-through text-muted">
                    {plan.originalPrice}/월
                  </Card.Text>
                  <Card.Text className="fs-4 fw-bold" style={style.moneyText}>
                    {plan.discountedPrice}/월
                  </Card.Text>
                  <Card.Text className="text-muted">{plan.description}</Card.Text>
                  <hr></hr>
                  <ul>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="mb-3">
                        <span>{feature.text}</span>
                        {feature.value && (
                          <Button className="float-end btn-sm fw-bold" style={style.countButton}>{feature.value}</Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" className="mt-3 w-100" style={style.subscribeButton} onClick={() => {navigate("/notice/5");}}>
                    구독하기
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Row>

      <Row className="pt-3 pb-5 bg-white">
        <Col>
        <Button style={style.trackButton} onClick={handleTrackBtnClick}>내 순위 추적하기</Button>       
        </Col>
        
      </Row>

    </Container>
  );
}