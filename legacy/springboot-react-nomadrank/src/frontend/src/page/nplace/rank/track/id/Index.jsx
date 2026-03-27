import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, FloatingLabel, Form, Modal, Row, Spinner, Stack, Table } from "react-bootstrap";
import { ArrowBarDown, ArrowBarUp } from 'react-bootstrap-icons';
import NplaceRankTrackWithIdStyle from "/src/page/nplace/rank/track/id/Style.jsx";
import ExcelJS from "exceljs";
import ListIcon from "/src/asset/list-task.svg"
import GridIcon from "/src/asset/grid.svg"
import PropTypes from "prop-types";

export default function NplaceRankTrackWithIdPage() {

  const { loginUser } = useAuthStore();

  const style = NplaceRankTrackWithIdStyle();

  const { id } = useParams();

  const navigate = useNavigate();

  const [shopWithIdResult, setShopWithIdResult] = useState();

  const [showContextMenu, setShowContextMenu] = useState(false);

  const contextMenuRef = useRef(null);

  const entryKeyContainerRef = useRef(null);
  
  const [currentKeywordId, setCurrentKeywordId] = useState(null);

  const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });

  const [view, setView] = useState("list");

  const [showRankCheckModal, setShowRankCheckModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [rankCheckData, setRankCheckData] = useState(null);
  const [rankCheckDataLoading, setRankCheckDataLoading] = useState(false);

  const handleRankCheckModalShow = (trackInfo, entryKey) => {
    setShowRankCheckModal(true);
    setSelectedPlace(trackInfo);
    fetchRankCheckData(trackInfo, entryKey);
  };

  const handleRankCheckModalClose = () => {
    setRankCheckData(null);
    setShowRankCheckModal(false);
  };

  const fetchRankCheckData = async(trackInfo, entryKey) => {
    setRankCheckDataLoading(true);
    const keyword = shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey].keyword;
    const province = shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey].province;
    const dto = await fetch(`/v1/nplace/rank/realtime/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankCheckData: {
          keyword: keyword,
          province: province,
          searchDate: trackInfo.chartDate
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    
    if (dto.data.nplaceRankDataList.length == 0) {
      alert('순위 정보가 없습니다.');
    } else {
      setRankCheckData(dto.data.nplaceRankDataList);
    }
    setRankCheckDataLoading(false);
  };

  const [getShopWithIdTrigger] = usePendingFunction(async () => {

    const dto = await fetch(`/v1/nplace/rank/shop/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      navigate(`/nplace/rank/track`, { replace: true });
      return;
    }
    setShopWithIdResult(dto.data);
    if (Object.keys(dto.data.nplaceRankShop.nplaceRankTrackInfoMap).length > 0) {
      setSelectedInfoEntryKeyList([Object.keys(dto.data.nplaceRankShop.nplaceRankTrackInfoMap)[0]]);
    }
  });

  useEffect(() => {
    getShopWithIdTrigger();
  }, []);

  const trackAddProvinceSelectRef = useRef();
  const trackAddKeywordInputRef = useRef();

  const [postTrackTrigger, postTrackIsPending] = usePendingFunction(async () => {
    if (trackAddKeywordInputRef.current.value === "") {
      alert("키워드를 입력해주세요.");
      trackAddKeywordInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/nplace/rank/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankTrackInfo: {
          keyword: trackAddKeywordInputRef.current.value,
          province: trackAddProvinceSelectRef.current.value,
          shopId: shopWithIdResult ? shopWithIdResult.nplaceRankShop.shopId : "",
          businessSector: shopWithIdResult ? shopWithIdResult.nplaceRankShop.businessSector : ""
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    getShopWithIdTrigger();
    trackAddKeywordInputRef.current.value = "";
    alert("키워드를 추가했습니다.");
  });

  // const [selectedInfoEntryKey, setSelectedInfoEntryKey] = useState(null);
  const [selectedInfoEntryKeyList, setSelectedInfoEntryKeyList] = useState([]);
  const [expandedStates, setExpandedStates] = useState(
    selectedInfoEntryKeyList.reduce((acc, entryKey) => {
      acc[entryKey] = false; // 초기 상태는 모두 펼쳐지지 않은 상태
      return acc;
    }, {})
  );

  const toggleExpanded = (entryKey) => {
    setExpandedStates((prevStates) => ({
      ...prevStates,
      [entryKey]: !prevStates[entryKey],
    }));
  };

  const handleKeywordBadgeClick = (entryKey) => {
    setSelectedInfoEntryKeyList((prevKeyList) => {
      if (prevKeyList.includes(entryKey)) {
        return prevKeyList.filter((item) => item !== entryKey);
      } else {
        return [...prevKeyList, entryKey];
      }
    });
  };

  const selectKeywordAll = () => {
    if (shopWithIdResult) {
      setSelectedInfoEntryKeyList(Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap));
    }
  };

  const initKeyword = () => {
    if (shopWithIdResult) {
      setSelectedInfoEntryKeyList([Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap)[0]]);
    }
  };

  // const handleKeywordBadgeRightClick = async (event, infoId, entryKey) => {
  //   event.preventDefault();
  //   if (prompt(`추적을 중단 하시려면 키워드(${entryKey})를 입력해주세요.\n중단 후 다시 추적할 경우 과거 차트 데이터는 복구되지 않습니다.`) !== entryKey) {
  //     return;
  //   }
  //   const dto = await fetch(`/v1/nplace/rank/track/${infoId}`, {
  //     method: "DELETE"
  //   }).then((response) => response.json());
  //   if (dto.code !== 0) {
  //     alert(dto.message);
  //     return;
  //   }
  //   if (selectedInfoEntryKey === entryKey) {
  //     setSelectedInfoEntryKey(null);
  //   }
  //   getShopWithIdTrigger();
  //   alert(`${entryKey} 추적을 중단했습니다.`);
  // };

  const [deleteShopTrigger, deleteShopIsPending] = usePendingFunction(async () => {
    if (!confirm(`정말로 플레이스를 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 차트 데이터는 복구되지 않습니다.`)) {
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/shop/${id}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("상품을 삭제했습니다.");
    navigate(`/nplace/rank/track`, { replace: true });
  });


  // const handleProductDeleteButtonClick = () => {
  //   if (confirm(`정말로 상품을 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 차트 데이터는 복구되지 않습니다.`)) {
  //     alert("삭제");
  //   }
  // };

  // productWithIdResult.nstoreRankProduct.nplaceRankTrackInfoMap[selectedInfoEntryKey].nstoreRankTrackList
  // const nplaceRankTrackList = useMemo(() => {
  //   if (shopWithIdResult && selectedInfoEntryKey != null) {
  //     return shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[selectedInfoEntryKey].nplaceRankTrackList
  //       .toSorted((a, b) => a.chartDate > b.chartDate ? -1 : 1);
  //   }
  //   return [];
  // }, [shopWithIdResult, selectedInfoEntryKey]);

  const copyToClipboard = (text) => {
    window.navigator.clipboard.writeText(text);
    alert(`SHOP_ID ${text} 복사되었습니다.`);
  };

  const getRankString = (rank) => {
    if (rank == null) {
      return "추적 대기";
    } else if (rank === -1) {
      return "순위권 이탈";
    } else {
      return `${rank}위`;
    }
  }

  if (loginUser === null) {
    navigate(`/nplace/rank/track`, { replace: true });
    return <></>;
  }

  const handleContextMenu = (event, infoId) => {
    event.preventDefault();
    setCurrentKeywordId(infoId);
    setShowContextMenu(true);
    setContextMenuPosition({
      top: event.clientY - entryKeyContainerRef.current.getBoundingClientRect().top,
      left: event.clientX - entryKeyContainerRef.current.getBoundingClientRect().left
    });
  };

  const runRankTrack = async (event) => {
    event.preventDefault();
    const entryKey = Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap)
      .filter((entryKey) => shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey].id === currentKeywordId)[0];

    const dto = await fetch(`/v1/nplace/rank/track/${currentKeywordId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankTrackInfoStatus: {
          status: "RUNNING",
          id: currentKeywordId,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    // if (selectedInfoEntryKey === entryKey) {
    //   setSelectedInfoEntryKey(null);
    // }
    getShopWithIdTrigger();
    alert(`${entryKey} 추적이 재시작 되었습니다.`);
  };

  const stopRankTrack = async (event) => {
    event.preventDefault();
    const entryKey = Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap)
      .filter((entryKey) => shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey].id === currentKeywordId)[0];

    if (prompt(`추적을 중단 하시려면 키워드(${entryKey})를 입력해주세요.\n중단 후 다시 추적할 경우 중단 기간 동안의 차트 데이터는 추적되지 않습니다.`) !== entryKey) {
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/track/${currentKeywordId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankTrackInfoStatus: {
          status: "STOP",
          id: currentKeywordId,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    // if (selectedInfoEntryKey === entryKey) {
    //   setSelectedInfoEntryKey(null);
    // }
    getShopWithIdTrigger();
    alert(`${entryKey} 추적을 중단했습니다.`);
  };

  const deleteKeyword = async (event) => {
    event.preventDefault();
    const entryKey = Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap)
      .filter((entryKey) => shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey].id === currentKeywordId)[0];

    if (prompt(`추적을 삭제 하시려면 키워드(${entryKey})를 입력해주세요.\n삭제 후 다시 추적할 경우 과거 차트 데이터는 복구되지 않습니다.`) !== entryKey) {
      return;
    }
    const dto = await fetch(`/v1/nplace/rank/track/${currentKeywordId}`, {
      method: "DELETE"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    // if (selectedInfoEntryKey === entryKey) {
    //   setSelectedInfoEntryKey(null);
    // }
    getShopWithIdTrigger();
    alert(`${entryKey} 추적을 삭제했습니다.`);
  };

  const handleClickOutside = () => {
    setShowContextMenu(false);
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("NplaceRankData");

    const allTrackDates = new Set();

    selectedInfoEntryKeyList.forEach(entryKey => {
      const trackList = shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.nplaceRankTrackList || [];
      trackList.forEach(track => {
        const dateKey = `${track.chartDate.split("T")[0]}\n${track.chartDate.split("T")[1].split(".")[0].split(":")[0]}`;
        allTrackDates.add(dateKey); // 날짜+시간 조합 기준으로 중복 제거됨
      });
    });

    const sortedDateKeys = Array.from(allTrackDates).sort((a, b) => {
      const dateA = new Date(`${a.replace("\n", "T")}:00:00`);
      const dateB = new Date(`${b.replace("\n", "T")}:00:00`);
      return dateB - dateA; // 최신순
    });

    // 열 정의
    const columns = [
      { header: "키워드", key: "키워드", width: 15 },
      { header: "플레이스명", key: "플레이스명", width: 15 },
      { header: "등록일", key: "등록일", width: 20 },
      ...sortedDateKeys.map((dateKey) => ({
        header: dateKey.split("\n")[0],
        key: dateKey,
        width: 20,
      })),
    ];

    worksheet.columns = columns;

    // 각 키워드의 데이터 행 추가
    selectedInfoEntryKeyList.forEach((entryKey) => {
      const trackList = shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.nplaceRankTrackList || [];
      const shopData = {
        키워드: shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.keyword || "",
        플레이스명: shopWithIdResult.nplaceRankShop.shopName || "",
        등록일: shopWithIdResult.nplaceRankShop.createDate?.split(".")[0]?.replace("T", " ") || "",
      };

      // 날짜별 정보 매핑
      const rowData = { ...shopData };
      trackList.forEach((track) => {
        const dateKey = `${track.chartDate.split("T")[0]}\n${track.chartDate.split("T")[1].split(".")[0].split(":")[0]}`;
        rowData[dateKey] = `${track.rank}위\n저 ${track.saveCount}\n블 ${track.blogReviewCount}개\n방 ${track.visitorReviewCount}개`;
      });

      worksheet.addRow(rowData);
    });

    // 스타일 지정
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.font = { size: 10 };
      });
    });

    // 다운로드 처리
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    link.download = `${shopWithIdResult.nplaceRankShop.shopName}_${formattedDate}.xlsx`;

    link.click();
  };


  const updateKeyword = async () => {
    const dto = await fetch(`/v1/nplace/rank/shop/${id}/keyword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankShop: {
          id: id
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    getShopWithIdTrigger();
    alert("키워드 목록을 갱신했습니다.");
  };

  const firtViewCount = 30;
  const listContent = (
    <>
      {selectedInfoEntryKeyList.map((entryKey) => {
        const nplaceRankTrackList =
          shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.nplaceRankTrackList
            ?.toSorted((a, b) => (a.chartDate > b.chartDate ? -1 : 1)) || [];

        const displayedList = expandedStates[entryKey] ? nplaceRankTrackList : nplaceRankTrackList.slice(0, firtViewCount);

        return (
          <>
            <div className="mb-1"><strong>{entryKey}</strong></div>
            <Table hover key={entryKey} style={{ verticalAlign: "middle", textAlign: "center" }}>
              <thead>
                <tr>
                  <th scope="col">순위</th>
                  <th scope="col">방문자 리뷰</th>
                  <th scope="col">블로그 리뷰</th>
                  <th scope="col">저장수</th>
                  <th scope="col">평점</th>
                  <th scope="col">일자</th>
                  <th scope="col">순위비교</th>
                </tr>
              </thead>
              <tbody>
              {displayedList.map((thisTrack, index) => (
                <tr key={index}>
                  <td>
                    {thisTrack.rank > 0 ? thisTrack.rank : "순위권 이탈"}
                  </td>
                  <td>
                    {thisTrack.rank > 0 ? thisTrack.visitorReviewCount : ""}
                  </td>
                  <td>
                    {thisTrack.rank > 0 ? thisTrack.blogReviewCount : ""}
                  </td>
                  <td>
                    {thisTrack.rank > 0 ? thisTrack.saveCount : ""}
                  </td>
                  <td>
                    {thisTrack.rank > 0 ? thisTrack.scoreInfo : ""}
                  </td>
                  <td>
                    {thisTrack.chartDate.split(".")[0].replace("T", " ")}
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => handleRankCheckModalShow(thisTrack, entryKey)}>비교</Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
            {nplaceRankTrackList.length > firtViewCount && (
              <div className="text-center mb-5">
                <div onClick={() => toggleExpanded(entryKey)} style={{cursor: "pointer"}} >
                  {expandedStates[entryKey] ? <ArrowBarUp size={20} color="#0d6efd" /> : <ArrowBarDown size={20} color="#0d6efd" />}
                </div>
              </div>
            )}
          </>
        );
      })}
    </>
  );

  const gridContent = (
    <>
      {selectedInfoEntryKeyList.map((entryKey) => {
        const nplaceRankTrackList =
        shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.nplaceRankTrackList || [];

        const nplaceRankTrackListWithDiff = nplaceRankTrackList.map((item, index, arr) => {
          if (index === 0) {
            return {
              ...item,
              rankDiff: 0,
              scoreInfoDiff: 0,
              visitorReviewCountDiff: 0,
              blogReviewCountDiff: 0,
              saveCountDiff: 0
            }; // 첫 번째 항목은 비교 대상 없음
          }

          // 숫자 추출 함수
          const extractNumber = (val) => {
            const num = String(val).replace(/[^\d]/g, "");
            return num ? Number(num) : 0;
          };

          const prevRank = arr[index - 1].rank;
          let rankDiff = null;
          if (item.rank === -1 && prevRank !== -1) {
            rankDiff = "이탈";
          } else if (item.rank !== -1 && prevRank === -1) {
            rankDiff = "진입";
          } else if (!isNaN(item.rank) && !isNaN(prevRank)) {
            rankDiff = Number(item.rank) - Number(prevRank);
          }

          const prevScoreInfo = arr[index - 1].scoreInfo === "-" ? 0 : arr[index - 1].scoreInfo;
          const scoreInfoDiff = item.scoreInfo - prevScoreInfo;

          const prevVisitorReviewCount = arr[index - 1].visitorReviewCount;
          const visitorReviewCountDiff = extractNumber(item.visitorReviewCount) - extractNumber(prevVisitorReviewCount);

          const prevBlogReviewCount= arr[index - 1].blogReviewCount;
          const blogReviewCountDiff = extractNumber(item.blogReviewCount) - extractNumber(prevBlogReviewCount);

          const prevSaveCount= arr[index - 1].saveCount;
          const saveCountDiff = extractNumber(item.saveCount) - extractNumber(prevSaveCount);

          return {
            ...item,
            rankDiff,
            scoreInfoDiff,
            visitorReviewCountDiff,
            blogReviewCountDiff,
            saveCountDiff
          };
        }).toSorted((a, b) => (a.chartDate > b.chartDate ? -1 : 1));

        // const nplaceRankTrackList =
        //   shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey]?.nplaceRankTrackList
        //     ?.toSorted((a, b) => (a.chartDate > b.chartDate ? -1 : 1)) || [];

        return (
          <Container key={entryKey} className="mb-4">
            <div className="mb-1"><strong>{entryKey}</strong></div>
            <Row style={{padding: "inherit"}} lg={5}>
              {nplaceRankTrackListWithDiff.slice(0, 30).map((thisTrack) => {
                const chartDate = new Date(thisTrack.chartDate);
                const dateStr = chartDate.toLocaleDateString("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                });
                const timeStr = chartDate.toTimeString().slice(0, 5);
                const dateTimeStr = `${dateStr} ${timeStr}`;

                return (
                  <Col
                    key={thisTrack.id}
                    className="p-1 small"
                    style={{ border: '1px solid #dee2e6', textAlign: 'left' }}
                    >
                  <div className="fw-bold ps-1">{dateTimeStr}</div>
                  <table className="table table-sm mb-0 mt-1 small">
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ width: "30%" }}>순위</td>
                        <td>
                          {thisTrack.rank > 0 ? `${thisTrack.rank}위` : "이탈"} (
                          {thisTrack.rankDiff === "진입" ? (
                            <span className="text-danger fw-bold">진입</span>
                          ) : thisTrack.rankDiff === "이탈" ? (
                            <span className="text-primary fw-bold">이탈</span>
                          ) : thisTrack.rankDiff < 0 ? (
                            <span className="text-danger">▲ {Math.abs(thisTrack.rankDiff)}</span>
                          ) : thisTrack.rankDiff > 0 ? (
                            <span className="text-primary">▼ {Math.abs(thisTrack.rankDiff)}</span>
                          ) : (
                            "-"
                          )}
                          )
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">평점</td>
                        <td>
                          {thisTrack.scoreInfo ?? 0} (
                          {thisTrack.scoreInfoDiff > 0 ? (
                            <span className="text-danger fw-bold">▲ {thisTrack.scoreInfoDiff.toFixed(2)}</span>
                          ) : thisTrack.scoreInfoDiff < 0 ? (
                            <span className="text-primary fw-bold">▼ {Math.abs(thisTrack.scoreInfoDiff).toFixed(2)}</span>
                          ) : (
                            "-"
                          )}
                          )
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">방문자</td>
                        <td>
                          {thisTrack.visitorReviewCount} (
                          {thisTrack.visitorReviewCountDiff > 0 ? (
                            <span className="text-danger fw-bold">▲ {thisTrack.visitorReviewCountDiff}</span>
                          ) : thisTrack.visitorReviewCountDiff < 0 ? (
                            <span className="text-primary fw-bold">▼ {Math.abs(thisTrack.visitorReviewCountDiff)}</span>
                          ) : (
                            "-"
                          )}
                          )
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">블로그</td>
                        <td>
                          {thisTrack.blogReviewCount} (
                          {thisTrack.blogReviewCountDiff > 0 ? (
                            <span className="text-danger fw-bold">▲ {thisTrack.blogReviewCountDiff}</span>
                          ) : thisTrack.blogReviewCountDiff < 0 ? (
                            <span className="text-primary fw-bold">▼ {Math.abs(thisTrack.blogReviewCountDiff)}</span>
                          ) : (
                            "-"
                          )}
                          )
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">저장수</td>
                        <td>
                          {thisTrack.saveCount ?? 0} (
                          {thisTrack.saveCountDiff > 0 ? (
                            <span className="text-danger fw-bold">▲ {thisTrack.saveCountDiff}</span>
                          ) : thisTrack.saveCountDiff < 0 ? (
                            <span className="text-primary fw-bold">▼ {Math.abs(thisTrack.saveCountDiff)}</span>
                          ) : (
                            "-"
                          )}
                          )
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
                );
              })}
            </Row>
          </Container>
        );
      })}
    </>
  );

  const RankCheckModal = ({ show, handleClose, selectedPlace }) => {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>플레이스 순위</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{height: rankCheckDataLoading ? "85vh" : "auto"}}>
          {rankCheckDataLoading ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>업체명</th>
                  <th>카테고리</th>
                  <th>평점</th>
                  <th>방문자리뷰</th>
                  <th>블로그리뷰</th>
                  <th>저장수</th>
                </tr>
              </thead>
              <tbody>
                {rankCheckData && rankCheckData.map((place) => {
                  return (
                    <tr
                      key={place.rankInfo.rank}
                      className={
                        place.rankInfo.rank == selectedPlace.rank
                          ? "table-warning"
                          : ""
                      }
                    >
                      <td>{place.rankInfo.rank}</td>
                      <td>{place.trackInfo.shopName}</td>
                      <td>{place.trackInfo.category}</td>
                      <td>{place.trackInfo.scoreInfo}</td>
                      <td>{place.trackInfo.visitorReviewCount.toLocaleString()}</td>
                      <td>{place.trackInfo.blogReviewCount.toLocaleString()}</td>
                      <td>{place.trackInfo.saveCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    )
  };

  const handleListView = () => {
    setView("list");
  };

  const handleGridView = () => {
    setView("grid");
  };

  RankCheckModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    selectedPlace: PropTypes.object
  };

  return (
    <LayoutDefault>
      <div onClick={handleClickOutside}>
        <Card>
          <Card.Body>
            {
              shopWithIdResult
                ? <>
                  <div style={style.shopContainer}>
                    <div>
                      <div
                        style={{
                          ...style.shopImage,
                          backgroundImage: `url('${shopWithIdResult.nplaceRankShop.shopImageUrl}')`
                        }}>
                      </div>
                    </div>
                    <div>
                      <div style={style.shopName}>
                        {shopWithIdResult.nplaceRankShop.shopName}
                        <Button variant="outline-primary" style={style.shopId} className="mx-2"
                                onClick={() => copyToClipboard(shopWithIdResult.nplaceRankShop.shopId)}>
                          SHOP_ID
                        </Button>
                        </div>
                      <div style={style.address}>
                        {(shopWithIdResult.nplaceRankShop.roadAddress && shopWithIdResult.nplaceRankShop.roadAddress.length > 0) ? shopWithIdResult.nplaceRankShop.roadAddress : shopWithIdResult.nplaceRankShop.address }
                      </div>
                      <div style={{ ...style.reviewAndCategoryContainer, fontSize: "15px" }}>
                        <div>방문자 리뷰({shopWithIdResult.nplaceRankShop.visitorReviewCount})
                        </div>
                        <div>블로그 리뷰({shopWithIdResult.nplaceRankShop.blogReviewCount})
                        </div>
                      </div>
                      <div style={style.reviewAndCategoryContainer}>
                        <div style={style.resultCategoryAndScore}>{shopWithIdResult.nplaceRankShop.category}</div>
                        <div
                          style={style.categoryAndScore}>{" "}평점({shopWithIdResult.nplaceRankShop.scoreInfo})
                        </div>
                      </div>
                      <div style={style.categoryAndScore}>
                          [ {shopWithIdResult.nplaceRankShop.keywordList.length === 0 ? "키워드 목록이 없습니다." : shopWithIdResult.nplaceRankShop.keywordList.join(" ")} ]
                          <Button variant="outline-primary" style={style.shopId} className="mx-2"
                                onClick={() => updateKeyword()}>
                          갱신
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline-danger" style={{ float: "right" }} onClick={deleteShopTrigger}
                              disabled={deleteShopIsPending}>
                        {deleteShopIsPending
                          ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                          : "플레이스 삭제"}
                      </Button>
                    </div>
                  </div>
                  <hr />
                  <div className="mb-1">
                    <Stack direction="horizontal" gap={2}>
                      <Badge pill bg="primary" onClick={selectKeywordAll} style={{cursor: "pointer"}}>
                        전체선택
                      </Badge>
                      <Badge pill bg="secondary" onClick={initKeyword} style={{cursor: "pointer"}}>
                        초기화
                      </Badge>
                    </Stack>
                  </div>
                  <div style={style.entryKeyContainer} ref={entryKeyContainerRef}>
                    <div>
                      {Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap).length === 0
                        ? <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
                          추적 중인 지역 및 키워드가 없습니다
                        </Badge>
                        : Object.keys(shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap).map((entryKey, thisInfoIndex) => {
                          const thisInfo = shopWithIdResult.nplaceRankShop.nplaceRankTrackInfoMap[entryKey];
                          return <Badge key={thisInfoIndex}
                                        bg={selectedInfoEntryKeyList.includes(entryKey) ? "warning" : "secondary"}
                                        text={selectedInfoEntryKeyList.includes(entryKey) ? "dark" : "white"}
                                        style={{ margin: "0 2px", cursor: "pointer" }}
                                        onClick={() => handleKeywordBadgeClick(entryKey)}
                                        onContextMenu={(event) => handleContextMenu(event, thisInfo.id)}
                          >
                            <span>{entryKey}</span>
                            <span>{" / "}{getRankString(thisInfo.rank)}{"("}</span>
                            <span>{(() => {
                              if (thisInfo.rankChange === 0) {
                                return "-";
                              } else if (thisInfo.rankChange < 0) {
                                return "▲";
                              } else {
                                return "▽";
                              }
                            })()}</span>
                            <span>{`${thisInfo.rankChange !== 0 ? Math.abs(thisInfo.rankChange) : ""})`}</span>
                          </Badge>;
                        })}
                        {showContextMenu && (
                          <div
                            ref={contextMenuRef}
                            style={{
                              position: 'absolute',
                              top: `${contextMenuPosition.top}px`,
                              left: `${contextMenuPosition.left}px`,
                              backgroundColor: '#fff',
                              border: '1px solid #ccc',
                              zIndex: 10,
                            }}
                          >
                            <Dropdown.Menu show style={{ display: 'block' }}>
                              {}
                              <Dropdown.Item onClick={runRankTrack}>순위 추적 재시작</Dropdown.Item>
                              <Dropdown.Item onClick={stopRankTrack}>순위 추적 중단</Dropdown.Item>
                              <Dropdown.Item onClick={deleteKeyword}>키워드 삭제</Dropdown.Item>
                            </Dropdown.Menu>
                          </div>
                        )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 58px", gap: "5px" }}>
                      <Form.Select ref={trackAddProvinceSelectRef} disabled={postTrackIsPending}>
                        <option value="서울시">서울시</option>
                        <option value="부산시">부산시</option>
                        <option value="대구시">대구시</option>
                        <option value="인천시">인천시</option>
                        <option value="광주시">광주시</option>
                        <option value="대전시">대전시</option>
                        <option value="울산시">울산시</option>
                        <option value="세종시">세종시</option>
                        <option value="경기도">경기도</option>
                        <option value="강원도">강원도</option>
                        <option value="충청북도">충청북도</option>
                        <option value="충청남도">충청남도</option>
                        <option value="전라북도">전라북도</option>
                        <option value="전라남도">전라남도</option>
                        <option value="경상북도">경상북도</option>
                        <option value="경상남도">경상남도</option>
                        <option value="제주도">제주도</option>
                      </Form.Select>
                      <FloatingLabel
                        controlId="floatingTrackAddInput"
                        label="키워드">
                        <Form.Control ref={trackAddKeywordInputRef} type="text" placeholder="키워드"
                                      disabled={postTrackIsPending} />
                      </FloatingLabel>
                      <Button variant="primary" style={{ height: "56px" }} onClick={postTrackTrigger}
                              disabled={postTrackIsPending}>
                        {postTrackIsPending
                          ? <span className="spinner-border" role="status" aria-hidden="true"></span>
                          : "추가"}
                      </Button>
                    </div>
                  </div>
                </>
                : <div>로딩중...</div>
            }
          </Card.Body>
        </Card>
        <br />
        <Card>
          <Card.Body>
            {
              shopWithIdResult
              && selectedInfoEntryKeyList.length > 0
              && <>
                  <div className="d-flex justify-content-between mb-2">
                    <Button variant="outline-primary" size="sm" className="mb-2" onClick={downloadExcel}>다운로드</Button>
                    <ButtonGroup className="ml-3">
                      <Button variant="outline-secondary" onClick={handleListView}>
                        <img src={ListIcon} alt="리스트 보기" />
                      </Button>
                      <Button variant="outline-secondary" onClick={handleGridView}>
                        <img src={GridIcon} alt="그리드 보기" />
                      </Button>
                    </ButtonGroup>
                  </div>
                  {view === "list" ? listContent : gridContent}
                </>
            }
          </Card.Body>
        </Card>
        <RankCheckModal show={showRankCheckModal} handleClose={handleRankCheckModalClose} selectedPlace={selectedPlace}></RankCheckModal>
      </div>
    </LayoutDefault>
  );
}

