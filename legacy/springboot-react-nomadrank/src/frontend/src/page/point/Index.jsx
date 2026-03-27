import { Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import usePendingFunction from "../../use/usePendingFunction";
import { useEffect, useState } from "react";

export default function PointChargePage() {
  const [pointCharge, setPointCharge] = useState([]);

  const [getPointChargeTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/point`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
  
    const pointChargeData = dto.data.pointChargeList;

    setPointCharge(pointChargeData);
  });

  useEffect(() => {
    getPointChargeTrigger();
  }, []);

  return ( 
    <LayoutDefault>
      <Table striped>
      <thead>
          <tr>
            <th>사용자명</th>
            <th>일자</th>
            <th>변동포인트</th>
            <th>잔여포인트</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {pointCharge.map((item, index) => (
            <tr key={index}>
              <th>{item.name}</th>
              <th>{item.createDate.split(".")[0].replace("T", " ")}</th>
              <th>{item.amount}</th>
              <th>{item.balance}</th>
              <th>{item.status}</th>
            </tr>  
          ))}
        </tbody>
      </Table>
    </LayoutDefault>
  );
}