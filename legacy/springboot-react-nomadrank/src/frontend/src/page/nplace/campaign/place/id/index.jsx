import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Stack } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";

import PlaceInfo from "./components/PlaceInfo";
import KeywordBadges from "./components/KeywordBadges";
import RegisterModal from "./components/RegisterModal";
import PropTypes from "prop-types";
import { usePlaceId } from "./hooks/usePlaceId";
import RegisterTable from "./components/RegisterTable";

export default function NplaceCampaignRewardWithIdPage() {
  const { loginUser } = useAuthStore();
  const navigate = useNavigate();
  const { id, type } = useParams();
  const {
    placeData,
    priceData,
    selectedKeywordIndex,
    isLoading,
    handleKeywordSelect,
    handleKeywordDelete,
    handlePlaceDelete,
    handleRegister,
    modalState,
    setModalState
  } = usePlaceId({id, type});

  useEffect(() => {
    if (!loginUser) {
      navigate('/', { replace: true });
    }
  }, [loginUser]);

  if (!loginUser) return null;
  if (isLoading) return <LayoutDefault>로딩중...</LayoutDefault>;

  return (
    <LayoutDefault>
      <Card>
        <Card.Body>
          <PlaceInfo 
            placeData={placeData} 
            onDelete={handlePlaceDelete} 
          />
          <hr />
          <KeywordBadges 
            keywords={placeData?.nplaceRewardShop.nplaceRewardShopKeywordList}
            selectedIndex={selectedKeywordIndex}
            onSelect={handleKeywordSelect}
            onDelete={handleKeywordDelete}
          />
        </Card.Body>
      </Card>
      <br />
      {selectedKeywordIndex != null && (
        <>
          <Stack direction="horizontal" gap={3} className="mb-3">
            <Button 
              variant="primary" 
              onClick={() => setModalState({ isOpen: true, type: type })}
            >
              리워드 {type === 'save' ? '저장하기' : '트래픽'} 추가
            </Button>
          </Stack>

          <Card>
            <Card.Body>
              <RegisterTable 
                registerData={placeData?.nplaceRewardShop.nplaceRewardShopKeywordList[0].nplaceRewardShopKeywordRegisterList}
                priceData={priceData}
                selectedKeywordIndex={selectedKeywordIndex}

              />
            </Card.Body>
          </Card>
        </>
      )}

      <RegisterModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        placeData={placeData}
        priceData={priceData}
        selectedKeywordIndex={selectedKeywordIndex}
        onClose={() => setModalState({ isOpen: false, type: null })}
        onSubmit={handleRegister}
      />
    </LayoutDefault>
  );
}

NplaceCampaignRewardWithIdPage.propTypes = {
  type: PropTypes.oneOf(['save', 'traffic'])
};