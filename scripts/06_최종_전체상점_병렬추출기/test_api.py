import requests
import json
res = requests.post("http://localhost:8000/api/store/12/keywords", json=["연산동횟집"])
print("Status Code:", res.status_code)
print("Response:", res.text)
