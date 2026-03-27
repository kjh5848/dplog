import { Button, Card } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useEffect, useState } from "react";
import GroupTable from "./GroupTable";
import GroupModal from "./GroupModal";
import ManageGroupModal from "./ManageGroupModal";
import usePendingFunction from "../../use/usePendingFunction";


export default function GroupPage() {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [groupList, setGroupList] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleManageGroup = () => {
    setShowManageGroupModal(true);
  }

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setShowGroupModal(true);
  }

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (data) => {
    const dto = await fetch(`/v1/group`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        group: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert(`삭제되었습니다.`);
      getGroupListTrigger();
    }
  }

  const [getGroupListTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/group/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setGroupList(dto.data.groupList);
  });

  useEffect(() => {
    getGroupListTrigger();
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
    const dto = await fetch(`/v1/group`, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        group: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert(`${mode === "add" ? "등록" : "수정"}되었습니다.`);
    }

    getGroupListTrigger();
    setShowGroupModal(false);
  };

  return (
    <LayoutDefault>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-start align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-end">
              <Button variant="primary" onClick={handleAddGroup}>
                그룹 추가
              </Button>
            </div>
            {/* <div className="d-flex align-items-center justify-content-end">
              <Button variant="primary" onClick={handleManageGroup}>
                그룹 관리
              </Button>
            </div> */}
          </div>
          <hr />
          <GroupTable groupList={groupList} onEdit={handleEditGroup} onDelete={handleDeleteGroup} />
        </Card.Body>
      </Card>
      <GroupModal show={showGroupModal} handleClose={() => setShowGroupModal(false)} onSave={handleSave} editData={selectedGroup} />
      <ManageGroupModal show={showManageGroupModal} handleClose={() => setShowManageGroupModal(false)} onSave={() => {}}/>
    </LayoutDefault>
  );

}