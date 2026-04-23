"""
D-PLOG 오프라인 라이선스 키 생성기 (고도화된 RSA 페어링 방식)

사용법:
1. python scripts/keygen.py --count 10
2. 발급된 키 쌍(입장코드+삭제코드)을 하나의 세트로 고객에게 전달.
"""

import jwt
import argparse
import secrets
from datetime import datetime
import string
import os
import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
KEYS_DIR = os.path.join(BASE_DIR, "core", "auth_keys")

PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEYS_DIR, "public_key.pem")
DELETE_SALT = "DPLOG_DELETE_SUPER_SALT_X91" # 삭제 해시용 솔트

def generate_rsa_keys():
    """RSA 개인키, 공개키가 없으면 자동 생성"""
    if not os.path.exists(KEYS_DIR):
        os.makedirs(KEYS_DIR, exist_ok=True)
        
    if not os.path.exists(PRIVATE_KEY_PATH) or not os.path.exists(PUBLIC_KEY_PATH):
        print("🔧 RSA 키 페어 파일이 없어 새로 생성합니다...")
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()

        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))

        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
        print(f"✅ RSA 키 쌍이 생성되었습니다. ({KEYS_DIR})")
        print("⚠️ 주의: 배포 시 public_key.pem만 포함시키고, private_key.pem은 절대로 외부로 유출하면 안 됩니다!")

def load_private_key():
    with open(PRIVATE_KEY_PATH, "rb") as f:
        return f.read()

def generate_random_id(length=8):
    """랜덤 영문_숫자 조합의 고유 식별자 생성"""
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))

def create_license_pair(plan="standard", is_lifetime=True):
    """RSA 암호화 기반 입장 코드와, 이와 쌍을 이루는 삭제 코드 발급"""
    private_key = load_private_key()
    license_id = generate_random_id(12)
    
    payload = {
        "license_id": license_id,
        "plan": plan,
        "is_lifetime": is_lifetime,
        "issued_at": datetime.now().isoformat()
    }
    
    # [1] 🟢 입장 코드 (License Key) - RSA 256 서명
    token = jwt.encode(payload, private_key, algorithm="RS256")
    
    # [2] 🔴 삭제 코드 (Delete Key) - SHA256 단방향 해시
    raw_str = f"{license_id}:{DELETE_SALT}"
    hashed = hashlib.sha256(raw_str.encode()).hexdigest()
    delete_code = f"DEL-{hashed[:8].upper()}"
    
    return token, delete_code

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate paired offline license keys.")
    parser.add_argument("--count", type=int, default=1, help="발급할 페어 개수")
    args = parser.parse_args()
    
    # 사전 작업: 키 쌍 확인 및 생성
    generate_rsa_keys()
    
    print(f"\n=======================================================")
    print(f" 🔑 D-PLOG [입장-삭제 쌍] 자동 발급기 (RSA-256) 가동")
    print(f"=======================================================\n")
    
    for i in range(args.count):
        entry_key, del_code = create_license_pair()
        print(f"--- [고객 No. {i+1}] 복사해서 전달하세요 👇 ---")
        print(f"🟢 [입장코드(라이선스)]: {entry_key}")
        print(f"🔴 [삭제코드(가게변경)]: {del_code}")
        print(f"--------------------------------------------------\n")
    
    print(f"총 {args.count}개의 쌍(Pair)이 발급되었습니다.")
