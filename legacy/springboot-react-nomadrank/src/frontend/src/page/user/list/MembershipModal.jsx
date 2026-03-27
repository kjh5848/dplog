// MembershipModal.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import PropTypes from 'prop-types';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const MembershipModal = ({ show, handleClose, user }) => {
  const { loginUser } = useAuthStore();
  const [membershipList, setMembershipList] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  
  // 현재 활성화된 멤버십 정보 가져오기
  const currentMembership = user.membershipList && user.membershipList.length > 0
  ? user.membershipList.find(membership => membership.membershipState === 'ACTIVATE') || null
  : null;
  
  useEffect(() => {
    const fetchMembershipList = async () => {
      try {
        const response = await fetch('/v1/membership/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAuthoritySort: loginUser.user.authority[0]
          })
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setMembershipList(result.data.membershipList);
      } catch (error) {
        console.error('멤버십 목록 조회 실패:', error);
      }
    };

    fetchMembershipList();
  }, []);

  const getMembershipStateText = (state) => {
    switch (state) {
      case 'ACTIVATE':
        return '활성화';
      case 'READY':
        return '준비';
      case 'EXPIRED':
        return '만료';
      default:
        return '알 수 없음';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMembership) {
      alert('멤버십을 선택해주세요.');
      return;
    }
  
    try {
      const response = await fetch(`/v1/user/${user.userId}/membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membership: {
            membershipId: parseInt(selectedMembership),
            startDate: formatDateToKoreanTime(startDate),
            endDate: formatDateToKoreanTime(endDate),
          }
        })
      });

      const result = await response.json();
      if (result.code !== 0) {
        alert(result.message);
        return;
      }
  
      // 성공 메시지 표시
      alert('멤버십이 성공적으로 저장되었습니다.');
      
      // 모달 닫기
      handleClose();
      
      // 필요한 경우 페이지 새로고침이나 상태 업데이트
      window.location.reload();
      
    } catch (error) {
      console.error('멤버십 저장 중 오류 발생:', error);
      alert('멤버십 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const toggleMembership = async (membership) => {
    if (!membership.membershipState === 'ACTIVATE' && !membership.membershipState === 'EXPIRED') {
      alert('활성화 혹은 만료된 멤버십만 변경 가능합니다.');
      return;
    }

    if (confirm(`해당 멤버십을 ${membership.membershipState === 'ACTIVATE' ? '비활성화' : '활성화'} 하시겠습니까?`)) {
      try {
        const response = await fetch(`/v1/user/${user.userId}/membership/${membership.membershipUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('멤버십 변경에 실패했습니다.');
        }
    
        // 성공 메시지 표시
        alert(`멤버십이 ${membership.membershipState === 'ACTIVATE' ? '비활성화' : '활성화'} 되었습니다.`);
        
        // 모달 닫기
        handleClose();
        
        // 필요한 경우 페이지 새로고침이나 상태 업데이트
        window.location.reload();
        
      } catch (error) {
        console.error('멤버십 저장 중 오류 발생:', error);
        alert('멤버십 변경에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const formatDateToKoreanTime = (date) => {
    const koreaDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return koreaDate.toISOString().split('T')[0];
  };

  const statePriority = {
    ACTIVATE: 1,
    READY: 2,
    EXPIRED: 3
  };
  
  const sortedMembershipList = [...user.membershipList].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
  
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
  
    const priorityA = statePriority[a.membershipState] || 999;
    const priorityB = statePriority[b.membershipState] || 999;
  
    return priorityA - priorityB;
  });
  

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>멤버십 관리 - {user.username}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          <h6 className="fw-bold">현재 멤버십 상태</h6>
          {currentMembership ? (
            <p className="mb-0">
              {currentMembership.name} ({currentMembership.startDate}~{currentMembership.endDate})
            </p>
          ) : (
            <p className="mb-0">현재 활성화된 멤버십이 없습니다.</p>
          )}
        </div>

        <div className="mb-4">
          <h6 className="fw-bold">멤버십 수정</h6>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>멤버십 선택</Form.Label>
              <Form.Select 
                value={selectedMembership}
                onChange={(e) => setSelectedMembership(e.target.value)}
              >
                <option>선택</option>
                {membershipList.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {membership.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>시작일</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  // 시작일이 변경되면 종료일도 한 달 뒤로 자동 설정
                  const newEndDate = new Date(date);
                  newEndDate.setMonth(date.getMonth() + 1);
                  setEndDate(newEndDate);
                }}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                minDate={new Date()} // 오늘 이전 날짜 선택 불가
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>종료일</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                minDate={startDate} // 시작일 이전 선택 불가
              />
            </Form.Group>
          </Form>
        </div>

        <div>
          <h6 className="fw-bold">멤버십 이력</h6>
          <ListGroup>
            {user.membershipList && user.membershipList.length > 0 ? (
              sortedMembershipList.map((membership, index) => (
                <ListGroup.Item key={index}>
                  {membership.startDate} ~ {membership.endDate} : {membership.name}{' '}
                  <span className={`badge ${
                      membership.membershipState === 'ACTIVATE' ? 'bg-success' :
                      membership.membershipState === 'READY' ? 'bg-info' : 'bg-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {toggleMembership(membership)}}
                  >
                    {getMembershipStateText(membership.membershipState)}
                  </span>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>멤버십 이력이 없습니다.</ListGroup.Item>
            )}
          </ListGroup>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          저장하기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

MembershipModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    membershipList: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      membershipState: PropTypes.string
    }))
  }).isRequired
};

export default MembershipModal;
