import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Modal, Button, Form, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const ExcelUploadModal = ({ show, handleClose }) => {
  const [file, setFile] = useState(null);
  const [urlData, setUrlData] = useState([]);
  const [step, setStep] = useState(1); // 1: 파일 선택, 2: 테이블 표시

  useEffect(() => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const binaryData = e.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 배열로 변환
      console.log("전체 데이터:", jsonData);

      const filteredData = jsonData.slice(1).map((row) => row[0]); // A2부터 읽기
      console.log("A2부터의 데이터:", filteredData);
     
      setUrlData(filteredData);
      
    };

    reader.onerror = (error) => {
      console.error("파일 읽기 오류:", error);
    };

    // filterdData를 이용해서 플레이스 정보 호출 및 보여주기
    setStep(2);
  }, [file]);

  useEffect(() => {
    if (urlData.length === 0) {
      return;
    }
    
  }, [urlData]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".xlsx")) {
      setFile(selectedFile);
    } else {
      alert("엑셀(.xlsx) 파일만 업로드 가능합니다.");
      setFile(null);
    }

    

  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xlsx")) {
      setFile(droppedFile);
    } else {
      alert("엑셀(.xlsx) 파일만 업로드 가능합니다.");
      setFile(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }
    
    handleClose(); // 모달 닫기
  };

    // 모달 닫을 때 초기화
    const handleModalClose = () => {
      setFile(null);
      setUrlData([]);
      setStep(1);
      handleClose();
    };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>엑셀 업로드</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 ? (
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {file ? (
                <p>{file.name}</p>
              ) : (
                <p>파일을 여기에 드래그하거나 찾아보기를 클릭하세요.</p>
              )}
              <Form.Control
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="fileInput"
              />
              <label htmlFor="fileInput" className="btn btn-primary mt-2">
                찾아보기
              </label>
            </div>
          ) : (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0 }}
            >
              <Table striped bordered hover>
                <thead>
                  <tr>
                    URL
                  </tr>
                </thead>
                <tbody>
                  {urlData.map((url, index) => (
                    <tr key={index}>
                        <td key={index}>{url}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </motion.div>
          )}
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleUpload} disabled={!file}>
          업로드
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ExcelUploadModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ExcelUploadModal;
