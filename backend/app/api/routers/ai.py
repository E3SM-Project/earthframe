from fastapi import APIRouter, HTTPException
from transformers import pipeline

from app.schemas.simulation import SimulationOut

router = APIRouter(prefix="/ai", tags=["AI"])

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


def describe_sim(sim: SimulationOut) -> str:
    return (
        f"{sim.name} [{sim.id}]: "
        f"Tag: {sim.version_tag}, Campaign: {sim.campaign_id}, Compset: {sim.compset}, "
        f"Resolution: {sim.grid_resolution}, Machine: {sim.machine_id}, Notes: {str(sim.notes_markdown) if sim.notes_markdown else 'n/a'}"
    )


def summarize_chunks(simulations: list[str], chunk_size: int = 4) -> str:
    chunks = [
        simulations[i : i + chunk_size] for i in range(0, len(simulations), chunk_size)
    ]
    intermediate = []

    for chunk in chunks:
        input_text = (
            "Compare the following E3SM simulation metadata. "
            "Summarize key similarities and differences in tag, campaign, compset, resolution, machine, and notes.\n\n"
            + "\n".join(chunk)
            + "\n\nSummary:"
        )
        res = summarizer(input_text, max_length=250, min_length=80, do_sample=False)
        intermediate.append(res[0]["summary_text"])

    final_input = (
        "Given these summaries of E3SM simulation metadata groups, synthesize overall trends, differences, and recurring patterns in tag, campaign, compset, resolution, machine, and notes.\n\n"
        + "\n".join(intermediate)
        + "\n\nOverall Summary:"
    )
    result = summarizer(final_input, max_length=300, min_length=100, do_sample=False)
    return result[0]["summary_text"]


@router.post("/analyze-simulations")
def analyze_simulations(payload: list[SimulationOut]):
    try:
        sim_descriptions = [describe_sim(sim) for sim in payload]

        if len(sim_descriptions) <= 5:
            input_text = (
                "Compare the following E3SM simulation metadata. "
                "Summarize key similarities and differences in tag, campaign, compset, resolution, machine, and notes.\n\n"
                + "\n".join(sim_descriptions)
                + "\n\nSummary:"
            )
            result = summarizer(
                input_text, max_length=300, min_length=100, do_sample=False
            )

            return {"summary": result[0]["summary_text"]}
        else:
            final_summary = summarize_chunks(sim_descriptions)

            return {"summary": final_summary}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Summarization failed: {str(e)}"
        ) from e
