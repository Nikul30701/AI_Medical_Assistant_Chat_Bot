import urllib.request as r
import json
import urllib.error as e

data = json.dumps({'full_name':'Test User','email':'testlogin1@test.com','password':'Password123!','password1':'Password123!'}).encode()
req = r.Request('http://127.0.0.1:8000/api/accounts/register/', data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    print("REG:", r.urlopen(req).read().decode())
except e.HTTPError as h:
    print("REG ERROR:", h.read().decode())

data = json.dumps({'email':'testlogin1@test.com','password':'Password123!'}).encode()
req = r.Request('http://127.0.0.1:8000/api/accounts/login/', data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    print("LOGIN:", r.urlopen(req).read().decode())
except e.HTTPError as h:
    print("LOGIN ERROR:", h.read().decode())
