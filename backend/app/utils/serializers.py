from datetime import datetime, timezone
from bson import ObjectId

def serialize_doc(doc):
    """
    Recursively clean and serialize a MongoDB document for JSON responses:
    - Converts ObjectId to string or removes _id if id is already present
    - Converts datetime to ISO 8601 string in UTC
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        cleaned = {}
        for k, v in doc.items():
            if k == "_id":
                # Only keep id string if id not explicitly set
                if "id" not in doc:
                    cleaned["id"] = str(v)
            else:
                cleaned[k] = serialize_doc(v)
        return cleaned
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        if doc.tzinfo is None:
            doc = doc.replace(tzinfo=timezone.utc)
        return doc.isoformat()
    return doc

def utc_now() -> datetime:
    """Returns current datetime in UTC timezone."""
    return datetime.now(timezone.utc)
