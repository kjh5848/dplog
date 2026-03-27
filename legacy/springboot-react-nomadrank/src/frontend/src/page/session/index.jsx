import { Button, Card, Spinner } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import DataTable from 'react-data-table-component';
import SessionStyle from "./Style";
import { useEffect, useState } from "react";
import usePendingFunction from "../../use/usePendingFunction";

export default function SessionPage() {

  const style = SessionStyle();
  const [sessionData, setSessionData] = useState([]);

  const [getSessionDataTrigger, getSessionDataIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/auth/session`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSessionData(dto.data.sessionList);
  });

  useEffect(() => {
    getSessionDataTrigger();
  }, []);


  const removeSession = async (row) => {
    if (confirm(`${row.username}의 세션을 삭제하시겠습니까?`)) {
      const dto = await fetch(`/v1/auth/session/${row.username}`, {
        method: "DELETE"
      }).then((response) => response.json());
      if (dto.code !== 0) {
        alert(dto.message);
      } else {
        alert(`${row.username}의 세션이 삭제되었습니다.`);
        getSessionDataTrigger();
      }
    }
  };

  const columns = [
    {
      name: '아이디',
      selector: row => row.username,
    },
    {
      name: '생성일자',
      selector: row => row.creationTime,
      sortable: true,
    },
    {
      name: '최근접속일자',
      selector: row => row.lastAccessedTime,
      sortable: true,
    },
    {
      name: '삭제',
      cell: (row) => 
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => {removeSession(row)}}
        >삭제</Button>
    }
  ];
  
  // const data = [
  //     {
  //     username: 'Beetlejuice',
  //     creationTime: '2024-10-17 21:12:12',
  //     lastAccessedTime: '2024-12-13 11:31:22',
  //   },
  //   {
  //     username: 'Ghostbusters',
  //     creationTime: '2024-10-11 21:12:12',
  //     lastAccessedTime: '2024-12-14 11:31:22',
  //   },
  // ];

  return (
    <LayoutDefault>
      <Card style={style.card}>
        <Card.Header style={style.cardHeader}>세션관리</Card.Header>
        <Card.Body>
        <DataTable
            columns={columns}
            data={sessionData}
            progressPending={getSessionDataIsPending}
            progressComponent={<Spinner animation="border" role="status" />}
          />
        </Card.Body>
      </Card>
      
    </LayoutDefault>
  );
}