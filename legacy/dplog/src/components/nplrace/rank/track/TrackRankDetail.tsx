// "use client";

// import { useState, useRef, useMemo, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import * as XLSX from 'xlsx';
// import { Menu, Grid as GridIcon, List } from 'lucide-react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, Form, Modal, Row, Table } from 'react-bootstrap';

// type TrackInfo = {
//   id: string;
//   keyword: string;
//   province: string;
//   rank: number;
//   rankChange: number;
//   nplaceRankTrackList: TrackData[];
// };

// type TrackData = {
//   id: string;
//   rank: number;
//   visitorReviewCount: number;
//   blogReviewCount: number;
//   saveCount: number;
//   scoreInfo: string;
//   chartDate: string;
// };

// type ShopData = {
//   nplaceRankShop: {
//     id: string;
//     shopId: string;
//     shopName: string;
//     shopImageUrl: string;
//     address: string;
//     roadAddress: string;
//     visitorReviewCount: number;
//     blogReviewCount: number;
//     category: string;
//     scoreInfo: string;
//     keywordList: string[];
//     businessSector: string;
//     createDate: string;
//     nplaceRankTrackInfoMap: {
//       [key: string]: TrackInfo;
//     };
//   };
// };

// type RankCheckData = {
//   rankInfo: {
//     rank: number;
//   };
//   trackInfo: {
//     shopName: string;
//     category: string;
//     scoreInfo: string;
//     visitorReviewCount: number;
//     blogReviewCount: number;
//     saveCount: number;
//   };
// };

// // React Bootstrap 컴포넌트 타입 정의
// type BadgeProps = {
//   bg: string;
//   text: string;
//   style: React.CSSProperties;
//   children: React.ReactNode;
//   onClick?: () => void;
//   onContextMenu?: (event: React.MouseEvent) => void;
// };

// type ButtonProps = {
//   variant: string;
//   className?: string;
//   style?: React.CSSProperties;
//   onClick?: () => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   size?: string;
// };

// // React Bootstrap 컴포넌트
// const Badge = (props: BadgeProps) => (
//   <span
//     className={`badge bg-${props.bg} text-${props.text}`}
//     style={props.style}
//     onClick={props.onClick}
//     onContextMenu={props.onContextMenu}
//   >
//     {props.children}
//   </span>
// );

// const Button = (props: ButtonProps) => (
//   <button
//     className={`btn btn-${props.variant} ${props.className || ''}`}
//     style={props.style}
//     onClick={props.onClick}
//     disabled={props.disabled}
//   >
//     {props.children}
//   </button>
// );

// const ButtonGroup = (props: { children: React.ReactNode }) => (
//   <div className="btn-group">{props.children}</div>
// );

// const Card = (props: { className?: string; children: React.ReactNode }) => (
//   <div className={`card ${props.className || ''}`}>{props.children}</div>
// );

// Card.Body = (props: { className?: string; children: React.ReactNode }) => (
//   <div className={`card-body ${props.className || ''}`}>{props.children}</div>
// );

// interface ShopApiResponse {
//   data: ShopData;
//   code: number;
//   message: string;
// }

// const fetcher = async (url: string): Promise<ShopApiResponse> => {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error('네트워크 요청이 실패했습니다');
//   }
//   return response.json();
// };

// export default function TrackDetail({ id }: { id: string }) {
//   const router = useRouter();
//   const queryClient = useQueryClient();
  
//   const { data: shopWithIdResult, error, isLoading } = useQuery<ShopApiResponse>({
//     queryKey: ['shop', id],
//     queryFn: () => fetcher(`/api/nplace/rank/shop/${id}`),
//     onError: (error) => {
//       alert((error as Error).message || "데이터를 불러오는데 실패했습니다.");
//       router.replace("/realtime");
//     }
//   });

//   const [collapseShow, setCollapseShow] = useState(false);
//   const [showContextMenu, setShowContextMenu] = useState(false);
//   const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });
//   const [currentKeywordId, setCurrentKeywordId] = useState<string | null>(null);
//   const [selectedInfoEntryKey, setSelectedInfoEntryKey] = useState<string | null>(null);
//   const [view, setView] = useState("list");
//   const [showRankCheckModal, setShowRankCheckModal] = useState(false);
//   const [selectedPlace, setSelectedPlace] = useState<TrackData | null>(null);
//   const [rankCheckData, setRankCheckData] = useState<RankCheckData[] | null>(null);
//   const [isPosting, setIsPosting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const entryKeyContainerRef = useRef<HTMLDivElement>(null);
//   const trackAddProvinceSelectRef = useRef<HTMLSelectElement>(null);
//   const trackAddKeywordInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (shopWithIdResult?.data && Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap).length > 0) {
//       setSelectedInfoEntryKey(Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap)[0]);
//     }
//   }, [shopWithIdResult]);

//   const handleRankCheckModalShow = (trackInfo: TrackData) => {
//     setRankCheckData(null);
//     setSelectedPlace(trackInfo);
//     fetchRankCheckData(trackInfo);
//     setShowRankCheckModal(true);
//   };

//   const fetchRankCheckData = async (trackInfo: TrackData) => {
//     if (!selectedInfoEntryKey || !shopWithIdResult?.data) return;
    
//     try {
//       const response = await fetch(`/api/nplace/rank/realtime/list`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           nplaceRankCheckData: {
//             keyword: shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[selectedInfoEntryKey].keyword,
//             province: shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[selectedInfoEntryKey].province,
//             searchDate: trackInfo.chartDate
//           }
//         })
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         alert(dto.message);
//         return;
//       }
      
//       if (dto.data.nplaceRankDataList.length === 0) {
//         alert('순위 정보가 없습니다.');
//       } else {
//         setRankCheckData(dto.data.nplaceRankDataList);
//       }
//     } catch (error) {
//       logError('순위 정보를 불러오는데 실패했습니다', error);
//       alert('순위 정보를 불러오는데 실패했습니다');
//     }
//   };

//   const handleKeywordBadgeClick = (entryKey: string) => {
//     if (selectedInfoEntryKey !== entryKey) {
//       setSelectedInfoEntryKey(entryKey);
//     }
//   };

//   const addTrackMutation = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await fetch(`/api/nplace/rank/track`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         throw new Error(dto.message);
//       }
      
//       return dto;
//     },
//     onSuccess: () => {
//       if (trackAddKeywordInputRef.current) {
//         trackAddKeywordInputRef.current.value = "";
//       }
//       queryClient.invalidateQueries({ queryKey: ['shop', id] });
//       alert("키워드를 추가했습니다.");
//     },
//     onError: (error) => {
//       logError('키워드 추가 실패', error);
//       alert(`키워드 추가에 실패했습니다: ${(error as Error).message}`);
//     }
//   });

//   const handleAddTrack = async () => {
//     if (!shopWithIdResult?.data) return;
    
//     if (!trackAddKeywordInputRef.current?.value) {
//       alert("키워드를 입력해주세요.");
//       trackAddKeywordInputRef.current?.focus();
//       return;
//     }

//     addTrackMutation.mutate({
//       nplaceRankTrackInfo: {
//         keyword: trackAddKeywordInputRef.current.value,
//         province: trackAddProvinceSelectRef.current?.value || "서울시",
//         shopId: shopWithIdResult.data.nplaceRankShop.shopId,
//         businessSector: shopWithIdResult.data.nplaceRankShop.businessSector
//       }
//     });
//   };

//   const deleteShopMutation = useMutation({
//     mutationFn: async () => {
//       const response = await fetch(`/api/nplace/rank/shop/${id}`, {
//         method: "DELETE"
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         throw new Error(dto.message);
//       }
      
//       return dto;
//     },
//     onSuccess: () => {
//       alert("플레이스를 삭제했습니다.");
//       router.replace("/realtime");
//     },
//     onError: (error: Error) => {
//       logError('플레이스 삭제 실패', error);
//       alert(`플레이스 삭제에 실패했습니다: ${error.message}`);
//     }
//   });

//   const handleDeleteShop = async () => {
//     if (!confirm(`정말로 플레이스를 삭제 하시겠습니까?\n삭제 후 다시 등록할 경우 과거 차트 데이터는 복구되지 않습니다.`)) {
//       return;
//     }
    
//     deleteShopMutation.mutate();
//   };

//   const nplaceRankTrackList = useMemo(() => {
//     if (shopWithIdResult?.data && selectedInfoEntryKey != null) {
//       return [...shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[selectedInfoEntryKey].nplaceRankTrackList]
//         .sort((a, b) => a.chartDate > b.chartDate ? -1 : 1);
//     }
//     return [];
//   }, [shopWithIdResult, selectedInfoEntryKey]);

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert(`SHOP_ID ${text} 복사되었습니다.`);
//   };

//   const getRankString = (rank: number | null) => {
//     if (rank == null) {
//       return "추적 대기";
//     } else if (rank === -1) {
//       return "순위권 이탈";
//     } else {
//       return `${rank}위`;
//     }
//   };

//   const handleContextMenu = (event: React.MouseEvent, infoId: string) => {
//     event.preventDefault();
//     setCurrentKeywordId(infoId);
//     setShowContextMenu(true);
//     if (entryKeyContainerRef.current) {
//       setContextMenuPosition({
//         top: event.clientY - entryKeyContainerRef.current.getBoundingClientRect().top,
//         left: event.clientX - entryKeyContainerRef.current.getBoundingClientRect().left
//       });
//     }
//   };

//   const runRankTrack = async (event: React.MouseEvent) => {
//     event.preventDefault();
//     if (!shopWithIdResult?.data || !currentKeywordId) return;

//     const entryKey = Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap)
//       .find((key) => shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[key].id === currentKeywordId);

//     if (!entryKey) return;

//     try {
//       const response = await fetch(`/api/nplace/rank/track/${currentKeywordId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           nplaceRankTrackInfoStatus: {
//             status: "RUNNING",
//             id: currentKeywordId,
//           }
//         })
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         alert(dto.message);
//         return;
//       }
      
//       if (selectedInfoEntryKey === entryKey) {
//         setSelectedInfoEntryKey(null);
//       }
      
//       queryClient.invalidateQueries({ queryKey: ['shop', id] });
//       alert(`${entryKey} 추적이 재시작 되었습니다.`);
//     } catch (error) {
//       logError('추적 재시작 실패', error);
//       alert('추적 재시작에 실패했습니다');
//     }
//   };

//   const stopRankTrack = async (event: React.MouseEvent) => {
//     event.preventDefault();
//     if (!shopWithIdResult?.data || !currentKeywordId) return;

//     const entryKey = Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap)
//       .find((key) => shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[key].id === currentKeywordId);

//     if (!entryKey) return;

//     const userInput = prompt(`추적을 중단 하시려면 키워드(${entryKey})를 입력해주세요.\n중단 후 다시 추적할 경우 중단 기간 동안의 차트 데이터는 추적되지 않습니다.`);
//     if (userInput !== entryKey) return;

//     try {
//       const response = await fetch(`/api/nplace/rank/track/${currentKeywordId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           nplaceRankTrackInfoStatus: {
//             status: "STOP",
//             id: currentKeywordId,
//           }
//         })
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         alert(dto.message);
//         return;
//       }
      
//       if (selectedInfoEntryKey === entryKey) {
//         setSelectedInfoEntryKey(null);
//       }
      
//       queryClient.invalidateQueries({ queryKey: ['shop', id] });
//       alert(`${entryKey} 추적을 중단했습니다.`);
//     } catch (error) {
//       logError('추적 중단 실패', error);
//       alert('추적 중단에 실패했습니다');
//     }
//   };

//   const deleteKeyword = async (event: React.MouseEvent) => {
//     event.preventDefault();
//     if (!shopWithIdResult?.data || !currentKeywordId) return;

//     const entryKey = Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap)
//       .find((key) => shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[key].id === currentKeywordId);

//     if (!entryKey) return;

//     const userInput = prompt(`추적을 삭제 하시려면 키워드(${entryKey})를 입력해주세요.\n삭제 후 다시 추적할 경우 과거 차트 데이터는 복구되지 않습니다.`);
//     if (userInput !== entryKey) return;

//     try {
//       const response = await fetch(`/api/nplace/rank/track/${currentKeywordId}`, {
//         method: "DELETE"
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         alert(dto.message);
//         return;
//       }
      
//       if (selectedInfoEntryKey === entryKey) {
//         setSelectedInfoEntryKey(null);
//       }
      
//       queryClient.invalidateQueries({ queryKey: ['shop', id] });
//       alert(`${entryKey} 추적을 삭제했습니다.`);
//     } catch (error) {
//       logError('키워드 삭제 실패', error);
//       alert('키워드 삭제에 실패했습니다');
//     }
//   };

//   const handleClickOutside = () => {
//     setShowContextMenu(false);
//   };

//   const downloadExcel = async () => {
//     if (!shopWithIdResult?.data || !selectedInfoEntryKey) return;

//     const shopData = {
//       키워드: shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[selectedInfoEntryKey].keyword,
//       플레이스명: shopWithIdResult.data.nplaceRankShop.shopName,
//       등록일: shopWithIdResult.data.nplaceRankShop.createDate.split('.')[0].replace('T', ' ')
//     };

//     const tableData = [
//       nplaceRankTrackList.reduce((row, track) => {
//         row[track.chartDate.split('T')[0]] = `${track.saveCount}\n블 ${track.blogReviewCount}개\n방 ${track.visitorReviewCount}개`;
//         return row;
//       }, shopData)
//     ];

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(tableData, { skipHeader: true });
    
//     // 열 너비 및 스타일 설정
//     const columns = [
//       { width: 15 }, // 키워드
//       { width: 15 }, // 플레이스명
//       { width: 11 }, // 등록일
//       ...nplaceRankTrackList.map(() => ({ width: 11 }))
//     ];
    
//     worksheet['!cols'] = columns;
    
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'NplaceRankData');
//     XLSX.writeFile(workbook, 'NplaceRankData.xlsx');
//   };

//   const updateKeyword = async () => {
//     try {
//       const response = await fetch(`/api/nplace/rank/shop/${id}/keyword`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           nplaceRankShop: {
//             id
//           }
//         })
//       });
      
//       const dto = await response.json();
      
//       if (dto.code !== 0) {
//         alert(dto.message);
//         return;
//       }
      
//       queryClient.invalidateQueries({ queryKey: ['shop', id] });
//       alert("키워드 목록을 갱신했습니다.");
//     } catch (error) {
//       logError('키워드 갱신 실패', error);
//       alert('키워드 갱신에 실패했습니다');
//     }
//   };

//   const listContent = (
//     <Table hover className="text-center align-middle">
//       <thead>
//         <tr>
//           <th scope="col">순위</th>
//           <th scope="col">방문자 리뷰</th>
//           <th scope="col">블로그 리뷰</th>
//           <th scope="col">저장수</th>
//           <th scope="col">평점</th>
//           <th scope="col">일자</th>
//           <th scope="col">순위비교</th>
//         </tr>
//       </thead>
//       <tbody>
//         {nplaceRankTrackList.map((thisTrack, index) => (
//           <tr key={index}>
//             <td>
//               {thisTrack.rank > 0 ? thisTrack.rank : "순위권 이탈"}
//             </td>
//             <td>
//               {thisTrack.rank > 0 ? thisTrack.visitorReviewCount : ""}
//             </td>
//             <td>
//               {thisTrack.rank > 0 ? thisTrack.blogReviewCount : ""}
//             </td>
//             <td>
//               {thisTrack.rank > 0 ? thisTrack.saveCount : ""}
//             </td>
//             <td>
//               {thisTrack.rank > 0 ? thisTrack.scoreInfo : ""}
//             </td>
//             <td>
//               {thisTrack.chartDate.split(".")[0].replace("T", " ")}
//             </td>
//             <td>
//               <Button variant="outline-primary" size="sm" onClick={() => handleRankCheckModalShow(thisTrack)}>
//                 비교
//               </Button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   );

//   const gridContent = (
//     <Container>
//       {Array.from({ length: Math.ceil(nplaceRankTrackList.slice(0, 30).length / 10) }).map((_, rowIndex) => (
//         <Row key={rowIndex} className="">
//           {nplaceRankTrackList.slice(0, 30).slice(rowIndex * 10, rowIndex * 10 + 10).map((thisTrack) => (
//             <Col key={thisTrack.id} className="p-1 text-center" style={{ border: '1px solid #dee2e6' }}>
//               <div className="small">
//                 <div>{thisTrack.chartDate.slice(5, 10)} {thisTrack.chartDate.slice(11, 16)}</div>
//                 <div><strong>{thisTrack.rank > 0 ? `${thisTrack.rank}위` : "순위권 이탈"}</strong></div>
//                 <div className="text-success"><strong>{thisTrack.rank > 0 ? thisTrack.saveCount : ""}</strong></div>
//                 <div className="text-secondary">블 {thisTrack.blogReviewCount}개</div>
//                 <div className="text-secondary">방 {thisTrack.visitorReviewCount}개</div>
//               </div>
//             </Col>
//           ))}
//         </Row>
//       ))}
//     </Container>
//   );

//   const RankCheckModal = ({ show, handleClose }: { show: boolean; handleClose: () => void }) => {
//     return rankCheckData && rankCheckData.length > 0 ? (
//       <Modal show={show} onHide={handleClose} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>플레이스 순위</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Table striped bordered hover>
//             <thead>
//               <tr>
//                 <th>순위</th>
//                 <th>업체명</th>
//                 <th>카테고리</th>
//                 <th>평점</th>
//                 <th>방문자리뷰</th>
//                 <th>블로그리뷰</th>
//                 <th>저장수</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rankCheckData.map((place) => (
//                 <tr
//                   key={place.rankInfo.rank}
//                   className={selectedPlace && place.rankInfo.rank === selectedPlace.rank ? "table-warning" : ""}
//                 >
//                   <td>{place.rankInfo.rank}</td>
//                   <td>{place.trackInfo.shopName}</td>
//                   <td>{place.trackInfo.category}</td>
//                   <td>{place.trackInfo.scoreInfo}</td>
//                   <td>{place.trackInfo.visitorReviewCount.toLocaleString()}</td>
//                   <td>{place.trackInfo.blogReviewCount.toLocaleString()}</td>
//                   <td>{place.trackInfo.saveCount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Modal.Body>
//       </Modal>
//     ) : null;
//   };

//   // 스타일 객체
//   const styles = {
//     shopContainer: {
//       display: 'flex',
//       gap: '20px',
//       alignItems: 'center',
//       flexWrap: 'wrap' as const
//     },
//     shopImage: {
//       width: '120px',
//       height: '120px',
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       borderRadius: '8px'
//     },
//     shopName: {
//       fontSize: '1.5rem',
//       fontWeight: 'bold',
//       marginBottom: '5px',
//       display: 'flex',
//       alignItems: 'center'
//     },
//     shopId: {
//       fontSize: '0.875rem',
//       padding: '0.25rem 0.5rem'
//     },
//     address: {
//       color: '#666',
//       marginBottom: '5px'
//     },
//     reviewAndCategoryContainer: {
//       display: 'flex',
//       gap: '15px',
//       marginBottom: '5px'
//     },
//     resultCategoryAndScore: {
//       color: '#0066cc',
//       fontWeight: 'bold'
//     },
//     categoryAndScore: {
//       display: 'flex',
//       alignItems: 'center'
//     },
//     entryKeyContainer: {
//       position: 'relative' as const,
//       display: 'flex',
//       flexDirection: 'column' as const,
//       gap: '10px'
//     }
//   };

//   if (isLoading || !shopWithIdResult?.data) {
//     return (
//       <Card className="mb-4">
//         <Card.Body className="text-center py-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">로딩중...</span>
//           </div>
//           <p className="mt-3">데이터를 불러오는 중입니다...</p>
//         </Card.Body>
//       </Card>
//     );
//   }

//   return (
//     <div onClick={handleClickOutside}>
//       <Card className="mb-4">
//         <Card.Body>
//           <div style={styles.shopContainer}>
//             <div>
//               <div
//                 style={{
//                   ...styles.shopImage,
//                   backgroundImage: `url('${shopWithIdResult.data.nplaceRankShop.shopImageUrl}')`
//                 }}
//               />
//             </div>
//             <div>
//               <div style={styles.shopName}>
//                 {shopWithIdResult.data.nplaceRankShop.shopName}
//                 <Button 
//                   variant="outline-primary" 
//                   className="mx-2" 
//                   style={styles.shopId}
//                   onClick={() => copyToClipboard(shopWithIdResult.data.nplaceRankShop.shopId)}
//                 >
//                   SHOP_ID
//                 </Button>
//               </div>
//               <div style={styles.address}>
//                 {(shopWithIdResult.data.nplaceRankShop.roadAddress && shopWithIdResult.data.nplaceRankShop.roadAddress.length > 0) 
//                   ? shopWithIdResult.data.nplaceRankShop.roadAddress 
//                   : shopWithIdResult.data.nplaceRankShop.address}
//               </div>
//               <div style={{ ...styles.reviewAndCategoryContainer, fontSize: "15px" }}>
//                 <div>방문자 리뷰({shopWithIdResult.data.nplaceRankShop.visitorReviewCount})</div>
//                 <div>블로그 리뷰({shopWithIdResult.data.nplaceRankShop.blogReviewCount})</div>
//               </div>
//               <div style={styles.reviewAndCategoryContainer}>
//                 <div style={styles.resultCategoryAndScore}>{shopWithIdResult.data.nplaceRankShop.category}</div>
//                 <div style={styles.categoryAndScore}>평점({shopWithIdResult.data.nplaceRankShop.scoreInfo})</div>
//               </div>
//               <div style={styles.categoryAndScore}>
//                 [ {shopWithIdResult.data.nplaceRankShop.keywordList.length === 0 
//                     ? "키워드 목록이 없습니다." 
//                     : shopWithIdResult.data.nplaceRankShop.keywordList.join(" ")} ]
//                 <Button 
//                   variant="outline-primary" 
//                   className="mx-2" 
//                   style={styles.shopId}
//                   onClick={updateKeyword}
//                 >
//                   갱신
//                 </Button>
//               </div>
//             </div>
//             <div className="ms-auto">
//               <Button 
//                 variant="outline-danger" 
//                 onClick={handleDeleteShop}
//                 disabled={isDeleting}
//               >
//                 {isDeleting
//                   ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                   : "플레이스 삭제"}
//               </Button>
//             </div>
//           </div>
//           <hr />
//           <div style={styles.entryKeyContainer} ref={entryKeyContainerRef}>
//             <div>
//               {Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap).length === 0 ? (
//                 <Badge bg="secondary" text="white" style={{ margin: "0 2px" }}>
//                   추적 중인 지역 및 키워드가 없습니다
//                 </Badge>
//               ) : (
//                 Object.keys(shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap).map((entryKey, index) => {
//                   const thisInfo = shopWithIdResult.data.nplaceRankShop.nplaceRankTrackInfoMap[entryKey];
//                   return (
//                     <Badge 
//                       key={index}
//                       bg={selectedInfoEntryKey === entryKey ? "warning" : "secondary"}
//                       text={selectedInfoEntryKey === entryKey ? "dark" : "white"}
//                       style={{ margin: "0 2px", cursor: "pointer" }}
//                       onClick={() => handleKeywordBadgeClick(entryKey)}
//                       onContextMenu={(event) => handleContextMenu(event, thisInfo.id)}
//                     >
//                       <span>{entryKey}</span>
//                       <span>{" / "}{getRankString(thisInfo.rank)}{"("}</span>
//                       <span>
//                         {thisInfo.rankChange === 0 
//                           ? "-" 
//                           : thisInfo.rankChange < 0 
//                             ? "▲" 
//                             : "▽"}
//                       </span>
//                       <span>{`${thisInfo.rankChange !== 0 ? Math.abs(thisInfo.rankChange) : ""})`}</span>
//                     </Badge>
//                   );
//                 })
//               )}
//               {showContextMenu && (
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: `${contextMenuPosition.top}px`,
//                     left: `${contextMenuPosition.left}px`,
//                     zIndex: 10,
//                   }}
//                 >
//                   <Dropdown.Menu show>
//                     <Dropdown.Item onClick={runRankTrack}>순위 추적 재시작</Dropdown.Item>
//                     <Dropdown.Item onClick={stopRankTrack}>순위 추적 중단</Dropdown.Item>
//                     <Dropdown.Item onClick={deleteKeyword}>키워드 삭제</Dropdown.Item>
//                   </Dropdown.Menu>
//                 </div>
//               )}
//             </div>
//             <div className="d-grid gap-2" style={{ gridTemplateColumns: "120px 1fr 58px" }}>
//               <Form.Select ref={trackAddProvinceSelectRef} disabled={isPosting}>
//                 <option value="서울시">서울시</option>
//                 <option value="부산시">부산시</option>
//                 <option value="대구시">대구시</option>
//                 <option value="인천시">인천시</option>
//                 <option value="광주시">광주시</option>
//                 <option value="대전시">대전시</option>
//                 <option value="울산시">울산시</option>
//                 <option value="세종시">세종시</option>
//                 <option value="경기도">경기도</option>
//                 <option value="강원도">강원도</option>
//                 <option value="충청북도">충청북도</option>
//                 <option value="충청남도">충청남도</option>
//                 <option value="전라북도">전라북도</option>
//                 <option value="전라남도">전라남도</option>
//                 <option value="경상북도">경상북도</option>
//                 <option value="경상남도">경상남도</option>
//                 <option value="제주도">제주도</option>
//               </Form.Select>
//               <Form.Control 
//                 ref={trackAddKeywordInputRef as React.RefObject<HTMLInputElement>}
//                 type="text" 
//                 placeholder="키워드"
//                 disabled={isPosting} 
//               />
//               <Button 
//                 variant="primary" 
//                 style={{ height: "38px" }} 
//                 onClick={handleAddTrack}
//                 disabled={isPosting}
//               >
//                 {isPosting ? (
//                   <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                 ) : "추가"}
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       <Card>
//         <Card.Body>
//           {selectedInfoEntryKey != null && (
//             <>
//               <div className="d-flex justify-content-between mb-2">
//                 <Button variant="outline-primary" size="sm" onClick={downloadExcel}>다운로드</Button>
//                 <ButtonGroup>
//                   <Button 
//                     variant={view === "list" ? "primary" : "outline-primary"} 
//                     onClick={() => setView("list")}
//                   >
//                     <List size={16} />
//                   </Button>
//                   <Button 
//                     variant={view === "grid" ? "primary" : "outline-primary"} 
//                     onClick={() => setView("grid")}
//                   >
//                     <GridIcon size={16} />
//                   </Button>
//                 </ButtonGroup>
//               </div>
//               {view === "list" ? listContent : gridContent}
//             </>
//           )}
//         </Card.Body>
//       </Card>
      
//       <RankCheckModal show={showRankCheckModal} handleClose={() => setShowRankCheckModal(false)} />
//     </div>
//   );
// } 