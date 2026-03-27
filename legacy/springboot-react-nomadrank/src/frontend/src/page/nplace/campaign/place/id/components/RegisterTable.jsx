import PropTypes from 'prop-types';
import { Badge, Table } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import RegisterDetailModal from './RegisterDetailModal';

const RegisterTable = ({ 
  registerData, 
  priceData,
  selectedKeywordIndex,
  showStatus = true 
}) => {
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedRegisterList = useMemo(() => {
    if (!registerData || selectedKeywordIndex === null) return [];
    const keywordRegisterList = registerData;

    return [...keywordRegisterList].sort((a, b) => 
      new Date(b.createDate) - new Date(a.createDate)
    );
  }, [registerData, selectedKeywordIndex]);

  const getStatusBadge = (status, startDate, endDate) => {
    const now = new Date();
    const start = new Date(`${startDate} 00:00:00`);
    const end = new Date(`${endDate} 23:59:59`);

    if (status === 'REQUESTED') {
      return <Badge bg="success">신청</Badge>;
    } else if (status === 'APPROVED') {
      if (now < start) {
        return <Badge bg="primary">승인</Badge>;
      } else if (now > end) {
        return <Badge bg="secondary">완료</Badge>;
      } else {
        return <Badge bg="info">진행중</Badge>;
      }
    }
  };

  if (!sortedRegisterList.length) {
    return (
      <div className="text-center py-4 text-muted">
        등록된 트래픽 데이터가 없습니다.
      </div>
    );
  }

  const handleRowClick = (register) => {
    setSelectedRegister(register);
    setIsModalOpen(true);
  };

  return (
    <>
      <Table hover responsive>
        <thead>
          <tr>
            <th className="text-center">검색어</th>
            <th className="text-center">시작일자</th>
            <th className="text-center">종료일자</th>
            <th className="text-center">총 작업기간</th>
            <th className="text-center">유입목표</th>
            <th className="text-center">상태</th>
          </tr>
        </thead>
        <tbody>
          {sortedRegisterList.map((register, index) => {
            return (
              <tr key={index} onClick={() => handleRowClick(register)} style={{ cursor: "pointer" }}>
                <td className="text-center">
                  {register.search}
                </td>
                <td className="text-center">
                  {register.startDate}
                </td>
                <td className="text-center">
                  {register.endDate}
                </td>
                <td className="text-center">
                  {register.workingPeriod}
                </td>
                <td className="text-center">
                  {register.goal.toLocaleString()}
                </td>
                {showStatus && (
                  <td className="text-center">
                    {getStatusBadge(register.status, register.startDate, register.endDate)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      {selectedRegister && (
        <RegisterDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          register={selectedRegister}
          priceData={priceData}
        />
      )}
    </>
  );
};

RegisterTable.propTypes = {
  registerData: PropTypes.shape({
    nplaceRewardShop: PropTypes.shape({
      nplaceRewardShopKeywordList: PropTypes.arrayOf(
        PropTypes.shape({
          nplaceRewardShopKeywordRegisterList: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.number.isRequired,
              keywordTraffic: PropTypes.number.isRequired,
              createDate: PropTypes.string.isRequired,
              nplaceCampaignRegister: PropTypes.shape({
                startDate: PropTypes.string.isRequired,
                endDate: PropTypes.string.isRequired,
                goal: PropTypes.number.isRequired,
                workingPeriod: PropTypes.number.isRequired
              }).isRequired
            })
          ).isRequired
        })
      ).isRequired
    }).isRequired
  }),
  selectedKeywordIndex: PropTypes.number,
  sortable: PropTypes.bool,
  showStatus: PropTypes.bool,
  priceData: PropTypes.shape({
    place: PropTypes.shape({
      accountNumber: PropTypes.string.isRequired,
      bankName: PropTypes.string.isRequired,
      deposit: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      nplaceRewardProduct: PropTypes.string.isRequired,
      accountnplaceRewardProductValueNumber: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired
    })
  })
};

export default RegisterTable;