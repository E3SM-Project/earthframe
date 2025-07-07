from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util

router = APIRouter()

# Summarization
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")


class TextPayload(BaseModel):
    text: str


class ComparePayload(BaseModel):
    text_a: str
    text_b: str


class SimComparePayload(BaseModel):
    simulations: list[str]


@router.post("/summarize")
def summarize(payload: TextPayload):
    try:
        summary = summarizer(
            payload.text, max_length=150, min_length=30, do_sample=False
        )
        return {"summary": summary[0]["summary_text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
def compare(payload: ComparePayload):
    try:
        emb1 = embed_model.encode(payload.text_a, convert_to_tensor=True)
        emb2 = embed_model.encode(payload.text_b, convert_to_tensor=True)
        score = util.cos_sim(emb1, emb2).item()
        return {"similarity": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-simulations")
def compare_simulations(payload: SimComparePayload):
    if not payload.simulations or len(payload.simulations) < 2:
        raise HTTPException(
            status_code=400, detail="Provide at least two simulations to compare."
        )

    try:
        joined = "\n".join(payload.simulations)
        summary = summarizer(joined, max_length=200, min_length=50, do_sample=False)
        return {"summary": summary[0]["summary_text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
