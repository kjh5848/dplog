import { Button, Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useEffect, useState } from "react";
import usePendingFunction from "../../use/usePendingFunction";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "/src/store/StoreProvider.jsx";
import NoticeListStyle from "./Style";

export default function NoticePage() {

  const { loginUser } = useAuthStore();

  const navigate = useNavigate();

  const style = NoticeListStyle();

  const [searchResult, setSearchResult] = useState(undefined);

  const [getNoticeListTrigger, getNoticeListIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/notice`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setSearchResult(dto.data);
  });

  useEffect(() => {
    getNoticeListTrigger();
  }, []);

  useEffect(() => {
    if (getNoticeListIsPending) {
      setSearchResult(undefined);
    }
  }, [getNoticeListIsPending]);

  return (
    <LayoutDefault>
      {loginUser && (loginUser.user.authority.includes('ADMIN') || loginUser.user.authority.includes('DISTRIBUTOR_MANAGER')) && (
        <>
          <Button variant="primary" onClick={() => navigate(`/notice/add`)}>공지 등록</Button>
          <hr style={style.searchResultDivider} />
        </>
      )}
      
      <Table striped hover>
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성일자</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (searchResult === undefined) {
                return (
                  <tr>
                    <th colSpan={3}></th>
                  </tr>
                );
              }
              else if (!searchResult || searchResult.noticeList.length === 0) {
                return (
                  <tr>
                    <th colSpan={3}>공지가 존재하지 않습니다.</th>
                  </tr>
                );
              } else {
                return searchResult.noticeList.map((item, index) => {
                  return (
                    <tr style={style.cursorPointer} key={index} onClick={() => navigate(`/notice/${item.id}`)}>
                      <td>{item.id}</td>
                      <td>{item.category}</td>
                      <td>{item.subject}</td>
                      <td>{item.createDate.split(".")[0].replace("T", " ")}</td>
                    </tr>
                  );
                });
              }
            })()}
          </tbody>
        </Table>
    </LayoutDefault>
  );
}