from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import jwt
import hashlib
import os
import shutil
from sqlmodel import select, delete
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_db
from domains.stores.model import BlacklistedLicense, Store, KeywordTask

router = APIRouter(tags=["auth"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
KEYS_DIR = os.path.join(BASE_DIR, "core", "auth_keys")
PUBLIC_KEY_PATH = os.path.join(KEYS_DIR, "public_key.pem")

# keygen.py와 동일한 솔트
DELETE_SALT = "DPLOG_DELETE_SUPER_SALT_X91"

class LicenseVerifyRequest(BaseModel):
    license_key: str

class LicenseBurnRequest(BaseModel):
    license_key: str
    delete_code: str

def get_public_key():
    if not os.path.exists(PUBLIC_KEY_PATH):
        raise HTTPException(status_code=500, detail="서버에 공개키가 없습니다.")
    with open(PUBLIC_KEY_PATH, "rb") as f:
        return f.read()

@router.post("/verify-license")
async def verify_license(req: LicenseVerifyRequest, session: AsyncSession = Depends(get_db)):
    """
    공개키를 이용해 RSA 라이선스 유효성 검사 및 블랙리스트 여부를 확인합니다.
    """
    key = req.license_key.strip()
    
    # [개발용 우회 로직]
    app_mode = os.environ.get("NEXT_PUBLIC_APP_MODE", "saas")
    if app_mode == "local" and key in ("dev", "dev-bypass-token"):
        return {
            "status": "success", 
            "message": "[개발모드] 라이선스가 자동 통과되었습니다.",
            "license_info": {"license_id": "DEV-TEST-ID", "plan": "developer"}
        }
    
    try:
        public_key = get_public_key()
        payload = jwt.decode(key, public_key, algorithms=["RS256"])
        
        license_id = payload.get("license_id")
        
        # 1. 블랙리스트 검사 (이미 삭제/교체된 라이선스인가?)
        stmt = select(BlacklistedLicense).where(BlacklistedLicense.license_id == license_id)
        res = await session.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="이 라이선스는 이미 폐기(초기화)되어 더 이상 사용할 수 없습니다. 새로운 코드를 발급받아 주세요.")
        
        return {
            "status": "success", 
            "message": "라이선스가 정상적으로 인증되었습니다.",
            "license_info": payload
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="라이선스 키가 만료되었습니다.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="사장님이 발급한 유효한 라이선스 키가 아닙니다.")


@router.post("/burn-license")
async def burn_license(req: LicenseBurnRequest, session: AsyncSession = Depends(get_db)):
    """
    고객이 삭제 코드를 입력하여 현재 가게를 폭파하고, 해당 라이선스를 영구 폐기합니다.
    """
    app_mode = os.environ.get("NEXT_PUBLIC_APP_MODE", "saas")
    is_dev_bypass = (app_mode == "local" and req.license_key.strip() in ("dev", "dev-bypass-token"))
    
    try:
        if is_dev_bypass:
            license_id = "DEV-TEST-ID"
            expected_delete_code = "dev"
        else:
            public_key = get_public_key()
            payload = jwt.decode(req.license_key.strip(), public_key, algorithms=["RS256"])
            license_id = payload.get("license_id")
            
            # 1. 삭제 코드(Pair) 검증
            raw_str = f"{license_id}:{DELETE_SALT}"
            hashed = hashlib.sha256(raw_str.encode()).hexdigest()
            expected_delete_code = f"DEL-{hashed[:8].upper()}"
        
        if req.delete_code.strip() != expected_delete_code:
            raise HTTPException(status_code=400, detail="삭제 코드가 일치하지 않습니다. 복사하신 코드를 다시 확인해주세요.")
            
        # 2. 이미 블랙리스트인지 확인
        stmt = select(BlacklistedLicense).where(BlacklistedLicense.license_id == license_id)
        res = await session.execute(stmt)
        existing_burn = res.scalar_one_or_none()
        
        if existing_burn and not is_dev_bypass:
            raise HTTPException(status_code=400, detail="이미 폐기된 라이선스입니다.")
            
        # 3. 가게 및 연관된 모든 데이터(CASCADE) 영구 삭제
        stmt = select(Store)
        res = await session.execute(stmt)
        stores = res.scalars().all()
        for store in stores:
            image_dir = os.path.join(BASE_DIR, "static", "images", "stores", str(store.id))
            if os.path.isdir(image_dir):
                shutil.rmtree(image_dir)
            # KeywordTask 수동 삭제 (Relationship Cascade 없음)
            await session.execute(delete(KeywordTask).where(KeywordTask.store_id == store.id))
            # Store 삭제 (나머지 Cascade)
            await session.delete(store)
            
        # 4. 블랙리스트 등재 (Burn) - 중복 삽입 방지
        if not existing_burn:
            burn_record = BlacklistedLicense(license_id=license_id)
            session.add(burn_record)
        
        await session.commit()
        
        return {"status": "success", "message": "가게가 삭제되고 라이선스가 폐기되었습니다. 새로운 코드로 다시 시작해주세요."}
            
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="기반 라이선스가 유효하지 않아 삭제를 처리할 수 없습니다.")
