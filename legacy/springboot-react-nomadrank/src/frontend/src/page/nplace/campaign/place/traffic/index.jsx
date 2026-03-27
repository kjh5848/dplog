import { useEffect } from "react";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Card } from "react-bootstrap";
import { usePlaceData } from "../hooks/usePlaceData";
import NplaceCampaignPlaceStyle from "../Style";
import NotificationAlert from "../components/NotificationAlert";
import PlaceTable from "../components/PlaceTable";
import RegisterModal from "../components/RegisterModal";

export default function NplaceCampaignRewardTrafficPage() {

  const style = NplaceCampaignPlaceStyle();
  const PRODUCT_TYPE = 'traffic';

  const {
    placeList,
    notification,
    isModalOpen,
    handleModalOpen,
    handleModalClose,
    handlePlaceRegister,
    fetchData
  } = usePlaceData(PRODUCT_TYPE);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LayoutDefault>
      <NotificationAlert notification={notification} />
      <Card>
        <Card.Body>
          <div>
            <div style={style.registerButtonContainer}>
              <Button variant="primary" onClick={handleModalOpen}>
                플레이스 등록
              </Button>
            </div>
          </div>
          <hr />
          <PlaceTable placeList={placeList} type={PRODUCT_TYPE} />
        </Card.Body>
      </Card>
      
      <RegisterModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onRegister={handlePlaceRegister}
        type={PRODUCT_TYPE}
      />
    </LayoutDefault>
  );
}