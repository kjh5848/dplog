import PropTypes from 'prop-types';
import { Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NplaceCampaignPlaceStyle from '../Style';

const PlaceTable = ({ placeList, type }) => {
  const navigate = useNavigate();
  const style = NplaceCampaignPlaceStyle();
  const handleRowDoubleClick = (shopId) => {
    navigate(`/nplace/reward/place/${type}/${shopId}`);
  };

  const renderKeywordBadges = (keywords) => {
    if (!keywords || keywords.length === 0) {
      return (
        <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
          키워드가 없습니다
        </Badge>
      );
    }

    return keywords.map((keyword, index) => (
      <Badge 
        key={index} 
        bg="warning" 
        text="dark" 
        style={{ margin: "0 2px" }}
      >
        <span>{keyword.keyword}</span>
      </Badge>
    ));
  };

  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th scope="col">No.</th>
          <th scope="col">이미지</th>
          <th scope="col">
            <div>플레이스 / 키워드</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {placeList.map((shop) => (
          <tr 
            key={shop.id}
            onDoubleClick={() => handleRowDoubleClick(shop.id)}
            style={{ cursor: 'pointer' }}
          >
            <th scope="row">{shop.id}</th>
            <td>
              <div 
                style={{
                  ...style.tableImage,
                  backgroundImage: `url('${shop.shopImageUrl}')`
                }}
              />
            </td>
            <td>
              <div style={{ fontWeight: "bold" }}>
                {shop.shopName}
              </div>
              <div>
                {renderKeywordBadges(shop.nplaceRewardShopKeywordList)}
              </div>
            </td>
          </tr>
        ))}
        {placeList.length === 0 && (
          <tr>
            <td colSpan={3} className="text-center py-4">
              등록된 플레이스가 없습니다.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

PlaceTable.propTypes = {
  placeList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      shopName: PropTypes.string.isRequired,
      shopImageUrl: PropTypes.string.isRequired,
      nplaceRewardShopKeywordList: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          keyword: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  type: PropTypes.oneOf(['save', 'traffic'])
};

export default PlaceTable;
