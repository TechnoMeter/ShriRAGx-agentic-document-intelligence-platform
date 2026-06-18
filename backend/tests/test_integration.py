import pytest
import requests
import time
import json
import os

BASE_URL = "http://localhost:8000"
TEST_DOC = "test_integration_doc.md"
TEST_CONTENT = "# Integration Test Doc\n\nThis is a document used for integration testing."

@pytest.fixture(scope="module")
def test_document():
    """Create a temporary test document, upload it, and clean up after tests."""
    with open(TEST_DOC, "w", encoding="utf-8") as f:
        f.write(TEST_CONTENT)
    
    with open(TEST_DOC, "rb") as f:
        files = {"file": (TEST_DOC, f, "text/markdown")}
        resp = requests.post(f"{BASE_URL}/api/v1/upload", files=files)
        assert resp.status_code == 202, f"Upload failed: {resp.text}"
    
    # Poll for the specific test document in the DB using the structured /documents endpoint
    for _ in range(15):
        docs_resp = requests.get(f"{BASE_URL}/api/v1/documents")
        if docs_resp.status_code == 200:
            docs = docs_resp.json().get("documents", [])
            if any(doc["filename"] == TEST_DOC for doc in docs):
                break
        time.sleep(1)
    
    yield TEST_DOC  
    
    if os.path.exists(TEST_DOC):
        os.remove(TEST_DOC)

def test_upload(test_document):
    resp = requests.get(f"{BASE_URL}/api/v1/documents")
    assert resp.status_code == 200
    docs = resp.json().get("documents", [])
    assert any(doc["filename"] == TEST_DOC for doc in docs)

def test_chat(test_document):
    payload = {"message": f"What is the {TEST_DOC} document about?"}
    resp = requests.post(f"{BASE_URL}/api/v1/chat", json=payload)
    assert resp.status_code == 200
    reply = resp.json().get("reply", "")
    assert reply, "Reply is empty"

def test_metadata(test_document):
    resp = requests.get(f"{BASE_URL}/api/v1/tools/document_count")
    assert resp.status_code == 200
    assert "There are" in resp.json().get("result", "")

def test_stream(test_document):
    payload = {"message": f"What is the {TEST_DOC} document about?"}
    tokens = []
    with requests.post(f"{BASE_URL}/api/v1/chat/stream", json=payload, stream=True) as resp:
        assert resp.status_code == 200
        for line in resp.iter_lines():
            if not line:
                continue
            line = line.decode('utf-8')
            if line.startswith("data: "):
                data_str = line[6:]
                try:
                    data = json.loads(data_str)
                    if "token" in data:
                        tokens.append(data["token"])
                    elif "done" in data:
                        break
                    elif "error" in data:
                        pytest.fail(f"Stream error: {data['error']}")
                except json.JSONDecodeError:
                    pass
    full_reply = "".join(tokens)
    assert full_reply, "Stream produced no tokens"