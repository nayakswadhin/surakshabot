from typing import Optional, Dict, Any
from pydantic import BaseModel


class ComplaintRequest(BaseModel):
    complaint_text: str


class ExtractedEntities(BaseModel):
    amount: Optional[str] = None
    phone_numbers: Optional[list[str]] = None
    upi_id: Optional[str] = None
    urls: Optional[list[str]] = None
    platform: Optional[str] = None
    other: Optional[Dict[str, Any]] = None


class ConfidenceScores(BaseModel):
    primary_category: float
    subcategory: float


class ClassificationResponse(BaseModel):
    primary_category: str
    subcategory: str
    extracted_entities: ExtractedEntities
    confidence_scores: ConfidenceScores
    priority: str  # "HIGH", "MEDIUM", or "LOW"
    suggested_action: str
