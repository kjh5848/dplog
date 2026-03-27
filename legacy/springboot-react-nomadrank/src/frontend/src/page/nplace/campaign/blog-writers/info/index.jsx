import { Button, Card } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useEffect, useState } from "react";
import usePendingFunction from "../../../../../use/usePendingFunction";
import BlogWritersTable from "./BlogWritersTable";
import BlogWritersModal from "./BlogWritersModal";

export default function NblogWritersRewardBlogWritersPage() {
  const [showBlogWritersModal, setShowBlogWritersModal] = useState(false);
  const [blogWritersList, setBlogWritersList] = useState(null);
  const [selectedBlogWriters, setSelectedBlogWriters] = useState(null);

  const handleAddBlogWriters = () => {
    setSelectedBlogWriters(null);
    setShowBlogWritersModal(true);
  }

  const handleEditBlogWriters = (blogWriters) => {
    setSelectedBlogWriters(blogWriters);
    setShowBlogWritersModal(true);
  };

  const [getBlogWritersListTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/nplace/reward/blog-writers/list`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    setBlogWritersList(dto.data.blogWritersList);
  });

  useEffect(() => {
    getBlogWritersListTrigger();
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
    const dto = await fetch(`/v1/nplace/reward/blog-writers`, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        blogWriters: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert(`${mode === "add" ? "등록" : "수정"}되었습니다.`);
    }

    getBlogWritersListTrigger();
    setShowBlogWritersModal(false);
  };

  return (
    <LayoutDefault>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-start align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-end">
              <Button variant="primary" onClick={handleAddBlogWriters}>
                블로그 기자단 추가
              </Button>
            </div>
          </div>
          <hr />
          <BlogWritersTable blogWritersList={blogWritersList} onEdit={handleEditBlogWriters} />
        </Card.Body>
      </Card>
      <BlogWritersModal show={showBlogWritersModal} handleClose={() => setShowBlogWritersModal(false)} onSave={handleSave} editData={selectedBlogWriters} />
    </LayoutDefault>
  );

}