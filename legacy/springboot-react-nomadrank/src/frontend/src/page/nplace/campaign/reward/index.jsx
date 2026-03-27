import { useEffect } from "react";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Card } from "react-bootstrap";
import { usePlaceData } from "./hooks/usePlaceData";
import PlaceTable from "./components/PlaceTable";
import NotificationAlert from "./components/NotificationAlert";
import RegisterModal from "./components/RegisterModal";
import NplaceCampaignRewardStyle from "./Style";

export default function NplaceCampaignRewardPage() {

  const style = NplaceCampaignRewardStyle();

  const {
    placeList,
    notification,
    isModalOpen,
    handleModalOpen,
    handleModalClose,
    handlePlaceRegister,
    fetchData
  } = usePlaceData('reward'); // 'save' or 'traffic'

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
          <PlaceTable placeList={placeList} />
        </Card.Body>
      </Card>
      
      <RegisterModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onRegister={handlePlaceRegister}
      />
    </LayoutDefault>
  );
}