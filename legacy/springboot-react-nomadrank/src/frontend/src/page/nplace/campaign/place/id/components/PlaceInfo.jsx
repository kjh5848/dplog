import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import NplaceRewardPlaceWithIdStyle from '../Style';

const PlaceInfo = ({ placeData = false }) => {
  const style = NplaceRewardPlaceWithIdStyle();
  const handleCopyShopId = (shopId) => {
    window.navigator.clipboard.writeText(shopId);
    alert(`SHOP_ID ${shopId} 복사되었습니다.`);
  };

  if (!placeData) return null;

  const {
    shopImageUrl,
    shopName,
    roadAddress,
    address,
    shopId
  } = placeData.nplaceRewardShop;

  return (
    <div style={style.shopContainer}>
      {/* 이미지 섹션 */}
      <div>
        <div
          style={{
            ...style.shopImage,
            backgroundImage: `url('${shopImageUrl}')`
          }}
        />
      </div>

      {/* 정보 섹션 */}
      <div>
        <div style={style.shopName}>{shopName}</div>
        <div style={style.address}>
          {roadAddress || address}
        </div>
        <div style={style.reviewAndCategoryContainer}>
          <div>
            <Button
              variant="outline-primary"
              style={style.shopId}
              onClick={() => handleCopyShopId(shopId)}
            >
              SHOP_ID
            </Button>
          </div>
        </div>
      </div>

      {/* 삭제 버튼 섹션 */}
      {/* <div>
        <Button
          variant="outline-danger"
          style={{ float: "right" }}
          onClick={onDelete}
          disabled={isPending}
        >
          {isPending ? (
            <span 
              className="spinner-border spinner-border-sm" 
              role="status" 
              aria-hidden="true"
            />
          ) : "샵 삭제"}
        </Button>
      </div> */}
    </div>
  );
};

PlaceInfo.propTypes = {
  placeData: PropTypes.shape({
    nplaceRewardShop: PropTypes.shape({
      id: PropTypes.number.isRequired,
      shopId: PropTypes.string.isRequired,
      shopName: PropTypes.string.isRequired,
      shopImageUrl: PropTypes.string.isRequired,
      address: PropTypes.string,
      roadAddress: PropTypes.string
    }).isRequired
  }),
  onDelete: PropTypes.func.isRequired,
  isPending: PropTypes.bool
};

PlaceInfo.defaultProps = {
  placeData: null,
  isPending: false
};

export default PlaceInfo;