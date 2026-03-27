import { Button, Card } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useEffect, useState } from "react";
import usePendingFunction from "../../../../../use/usePendingFunction";
import PlaceTable from "./PlaceTable";
import PlaceModal from "./PlaceModal";

export default function NplaceCampaignRewardPlacePage() {
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [placeList, setPlaceList] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleAddPlace = () => {
    setSelectedPlace(null);
    setShowPlaceModal(true);
  }

  const handleEditPlace = (place) => {
    setSelectedPlace(place);
    setShowPlaceModal(true);
  };

  const [getPlaceListTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/reward/place/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setPlaceList(dto.data.placeList);
  });

  useEffect(() => {
    getPlaceListTrigger();
  }, [])

  const handleSave = async (data, mode) => {
    let method;
    if (mode === "add") {
      method = "POST";
    } else if (mode === "edit") {
      method = "PATCH";
    } else {
      alert("잘못된 경로입니다.");
      return;
    }
    const dto = await fetch(`/v1/nplace/reward/place`, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        place: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert(`${mode === "add" ? "등록" : "수정"}되었습니다.`);
    }

    getPlaceListTrigger();
    setShowPlaceModal(false);
  };

  return (
    <LayoutDefault>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-start align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-end">
              <Button variant="primary" onClick={handleAddPlace}>
                플레이스 추가
              </Button>
            </div>
          </div>
          <hr />
          <PlaceTable placeList={placeList} onEdit={handleEditPlace} />
        </Card.Body>
      </Card>
      <PlaceModal show={showPlaceModal} handleClose={() => setShowPlaceModal(false)} onSave={handleSave} editData={selectedPlace} />
    </LayoutDefault>
  );

}