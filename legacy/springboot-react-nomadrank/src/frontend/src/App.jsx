import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NplaceRankRealtimePage from "/src/page/nplace/rank/realtime/Index.jsx";
import NplaceRankTrackPage from "/src/page/nplace/rank/track/Index.jsx";
import StoreRankRealtimePage from "/src/page/nstore/rank/realtime/Index.jsx";
import NstoreRankTrackPage from "/src/page/nstore/rank/track/Index.jsx";
import NstoreRankTrackWithIdPage from "/src/page/nstore/rank/track/id/Index.jsx";
import NplaceRankTrackWithIdPage from "/src/page/nplace/rank/track/id/Index.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import NplaceKeywordRelationPage from "/src/page/nplace/keyword/relation/Index.jsx";
import NstoreKeywordRelationPage from "/src/page/nstore/keyword/relation/Index.jsx";
import DistributorListPage from "./page/distributor/list";
import DistributorAddPage from "./page/distributor/add";
import UserListPage from "./page/user/list";
import UserAddPage from "./page/user/add";
import NplaceCampaignTrafficPage from "./page/nplace/campaign/traffic";
import ProductPage from "./page/product";
import NplaceCampaignTrafficWithIdPage from "./page/nplace/campaign/traffic/id/Index";
import NoticePage from "./page/notice/Index";
import NoticeWithIdPage from "./page/notice/id/Index";
import NoticeAddPage from "./page/notice/add";
import PointChargePage from "./page/point/Index";
import PointApplyPage from "./page/point/apply/Index";
import NplaceCampaignBlogWritersPage from "./page/nplace/campaign/blog-writers";
import DistributorIdPage from "./page/distributor/id";
import NplaceKeywordPage from "./page/nplace/keyword";
import UserIdPage from "./page/user/id";
import NoticeEditPage from "./page/notice/edit";
import LoginPage from "./page/login";
import SignUpPage from "./page/sign_up";
import SessionPage from "./page/session";
import NplaceCampaignRewardSavePage from "./page/nplace/campaign/place/save";
import NplaceCampaignRewardTrafficPage from "./page/nplace/campaign/place/traffic";
import NplaceCampaignRewardWithIdPage from "./page/nplace/campaign/place/id";
import GroupPage from "./page/group";
import NplaceCampaignRewardPlacePage from "./page/nplace/campaign/place/info";
import TestPage from "./page/test";
import NblogWritersRewardBlogWritersPage from "./page/nplace/campaign/blog-writers/info";
import MainPage from "./page/main";


function App() {
  const authStore = useAuthStore();
  return (
    <>
      {authStore.loginUser !== undefined && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate replace={true} to={"/main"} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/nplace" element={<Navigate replace={true} to={"/nplace/rank/track"} />} />
            <Route path="/nplace/rank" element={<Navigate replace={true} to={"/nplace/rank/track"} />} />
            <Route path="/nplace/rank/realtime" element={<NplaceRankRealtimePage />} />
            <Route path="/nplace/rank/track" element={<NplaceRankTrackPage />} />
            <Route path="/nplace/rank/track/:id" element={<NplaceRankTrackWithIdPage />} />
            <Route path="/nplace/keyword" element={<NplaceKeywordPage />} />
            <Route path="/nplace/keyword/relation" element={<NplaceKeywordRelationPage />} />
            <Route path="/nplace/campaign/traffic" element={<NplaceCampaignTrafficPage />} />
            <Route path="/nplace/campaign/traffic/:id" element={<NplaceCampaignTrafficWithIdPage />} />
            <Route path="/nplace/reward/place/info" element={<NplaceCampaignRewardPlacePage />} />
            <Route path="/nplace/reward/traffic" element={<NplaceCampaignTrafficPage />} />
            <Route path="/nplace/reward/place/save" element={<NplaceCampaignRewardSavePage />} />
            <Route path="/nplace/reward/place/traffic" element={<NplaceCampaignRewardTrafficPage />} />
            <Route path="/nplace/reward/place/:type/:id" element={<NplaceCampaignRewardWithIdPage />} />
            <Route path="/nplace/reward/blog-writers/info" element={<NblogWritersRewardBlogWritersPage />} />
            <Route path="/nplace/campaign/blog-writers" element={<NplaceCampaignBlogWritersPage />} />
            <Route path="/nstore" element={<Navigate replace={true} to={"/nstore/rank/realtime"} />} />
            <Route path="/nstore/rank" element={<Navigate replace={true} to={"/nstore/rank/realtime"} />} />
            <Route path="/nstore/rank/realtime" element={<StoreRankRealtimePage />} />
            <Route path="/nstore/rank/track" element={<NstoreRankTrackPage />} />
            <Route path="/nstore/rank/track/:id" element={<NstoreRankTrackWithIdPage />} />
            <Route path="/nstore/keyword/relation" element={<NstoreKeywordRelationPage />} />
            <Route path="/distributor/list" element={<DistributorListPage />} />
            <Route path="/distributor/add" element={<DistributorAddPage />} />
            <Route path="/user/list" element={<UserListPage />} />
            <Route path="/user/add" element={<UserAddPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/notice" element={<NoticePage />} />
            <Route path="/notice/:id" element={<NoticeWithIdPage />} />
            <Route path="/notice/add" element={<NoticeAddPage />} />
            <Route path="/notice/edit/:id" element={<NoticeEditPage />} />
            <Route path="/point" element={<PointChargePage />} />
            <Route path="/point/apply" element={<PointApplyPage />} />
            <Route path="/distributor" element={<DistributorIdPage />} />
            <Route path="/user" element={<UserIdPage />} />
            <Route path="/group" element={<GroupPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="*" element={<Navigate replace={true} to={"/main"} />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
