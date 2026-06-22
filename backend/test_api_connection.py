import urllib.request
import json

def test_match():
    url = "http://localhost:8000/api/v1/careers/match?stream=science"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            print("Response Code: 200")
            print("ai_active:", data.get("ai_active"))
            print("ai_model:", data.get("ai_model"))
            
            matches = data.get("matches", [])
            if matches:
                print("First Match Title:", matches[0]["career"]["title"])
                print("First Match Score:", matches[0]["match_score"])
                print("First Match Reasons:", matches[0]["match_reasons"])
            else:
                print("No matches returned.")
    except Exception as e:
        print("API Call Failed:", e)

if __name__ == "__main__":
    test_match()
