import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, FloatingLabel, Form, Button, Table } from 'react-bootstrap';
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import NplaceRewardPlaceStyle from '../Style';

const RegisterModal = ({ 
  isOpen, 
  onClose, 
  onRegister,
  type
}) => {
  const style = NplaceRewardPlaceStyle();
  const urlInputRef = useRef();
  const keywordInputRef = useRef();
  const searchButtonRef = useRef();
  const [searchResult, setSearchResult] = useState(null);

  // Modal 초기화 함수
  const handleClose = () => {
    urlInputRef.current.value = "";
    setSearchResult(null);
    onClose();
  };

  // URL 입력 시 엔터키 처리
  const handleUrlInputKeyUp = (event) => {
    if (event.key === "Enter") {
      searchButtonRef.current.click();
    }
  };

  // 검색 API 호출
  const [searchTrigger, isSearchPending] = usePendingFunction(async () => {
    if (urlInputRef.current.value === "") {
      alert("URL을 입력해주세요.");
      urlInputRef.current.focus();
      return;
    }

    try {
      const response = await fetch(
        `/v1/nplace/rank/trackable?url=${urlInputRef.current.value}`,
        { method: "GET" }
      );
      const dto = await response.json();

      if (dto.code === -8) {
        alert("검색 결과가 없습니다.");
        return;
      }
      
      if (dto.code !== 0) {
        alert(dto.message);
        return;
      }

      setSearchResult({
        nplaceRewardShop: dto.data.nplaceRankShop
      });
      urlInputRef.current.focus();
    } catch (error) {
      console.error('Search error:', error);
      alert('검색 중 오류가 발생했습니다.');
    }
  });

  // 등록 API 호출
  const [registerTrigger, isRegisterPending] = usePendingFunction(async () => {
    if (!searchResult) return;
    
    if (keywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      keywordInputRef.current.focus();
      return;
    }

    try {
      const registerData = {
        nplaceRewardShop: {
          ...searchResult.nplaceRewardShop,
          nplaceRewardProduct: type.toUpperCase()
        },
        nplaceRewardShopKeyword: {
          keyword: keywordInputRef.current.value,
        }
      };

      const success = await onRegister(registerData);
      if (success) {
        alert("등록되었습니다.");
        handleClose();
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  });

  // 검색 중일 때 결과 초기화
  useEffect(() => {
    if (isSearchPending) {
      setSearchResult(null);
    }
  }, [isSearchPending]);

  return (
    <Modal 
      show={isOpen} 
      onHide={handleClose}
      scrollable 
      size="lg" 
      backdrop="static"
    >
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
            controlId="floatingUrlInput"
            label="URL"
          >
            <Form.Control 
              ref={urlInputRef}
              type="text" 
              placeholder="URL"
              onKeyUp={handleUrlInputKeyUp}
              autoFocus 
            />
          </FloatingLabel>
          <Button 
            ref={searchButtonRef}
            variant="primary" 
            onClick={searchTrigger}
            style={{ height: "56px" }} 
            disabled={isSearchPending}
          >
            {isSearchPending ? (
              <span className="spinner-border" role="status" aria-hidden="true" />
            ) : "검색"}
          </Button>
        </div>

        <div style={style.trackableModalInputContainer}>
          <FloatingLabel
            controlId="floatingKeywordInput"
            label="목적 키워드"
          >
            <Form.Control 
              ref={keywordInputRef}
              type="text" 
              placeholder="목적 키워드" 
            />
          </FloatingLabel>
        </div>

        <hr />

        <div>
          <Table hover>
            <tbody>
              {searchResult && (
                <tr>
                  <td>
                    <div
                      style={{
                        ...style.tableImage,
                        backgroundImage: `url('${searchResult.nplaceRewardShop.shopImageUrl}')`
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: "bold" }}>
                      {searchResult.nplaceRewardShop.shopName}
                    </div>
                    <div style={{ marginTop: "5px" }}>
                      {searchResult.nplaceRewardShop.roadAddress || 
                       searchResult.nplaceRewardShop.address}
                    </div>
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Button 
                      variant="outline-primary" 
                      style={{ width: "58px" }}
                      onClick={registerTrigger}
                      disabled={isRegisterPending}
                    >
                      {isRegisterPending ? (
                        <span 
                          className="spinner-border spinner-border-sm" 
                          role="status" 
                          aria-hidden="true" 
                        />
                      ) : "등록"}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

RegisterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['save', 'traffic'])
};

RegisterModal.defaultProps = {
  type: 'reward'
};

export default RegisterModal;
