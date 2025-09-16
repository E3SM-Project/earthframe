from enum import Enum
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import pipeline

router = APIRouter()

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


class Machine(BaseModel):
    id: str
    name: str
    site: str | None = None
    architecture: str | None = None
    scheduler: str | None = None
    gpu: str | None = None
    notes: str | None = None
    created_at: str | None = None


class SimulationType(str, Enum):
    PRODUCTION = "production"
    MASTER = "master"
    EXPERIMENTAL = "experimental"


class Status(str, Enum):
    COMPLETE = "complete"
    RUNNING = "running"
    NOT_STARTED = "not-started"
    FAILED = "failed"


class ExternalUrl(BaseModel):
    label: str
    url: str


class Simulation(BaseModel):
    # Configuration
    id: str
    name: str
    caseName: str

    ensembleMember: str | None = None
    versionTag: str | None = None
    compset: str | None = None
    gridName: str | None = None
    gridResolution: str | None = None
    initializationType: str | None = None
    compiler: str | None = None
    parentSimulationId: str | None = None

    # Timeline
    modelStartDate: str
    modelEndDate: str
    calendarStartDate: str | None = None

    # Model setup (context)
    simulationType: SimulationType
    status: Status
    campaignId: str
    experimentTypeId: str
    machineId: str
    variables: list[str]

    # Provenance & submission
    uploadedBy: str
    uploadDate: str
    lastModified: str
    lastEditedBy: str
    lastEditedAt: str

    # Version Control
    branch: str | None = None
    branchTime: str | None = None
    gitHash: str | None = None
    externalRepoUrl: str | None = None

    # Execution & output
    runDate: str | None = None
    outputPath: str | None = None
    archivePaths: list[str]
    runScriptPaths: list[str]
    batchLogPaths: list[str] | None = None

    # Postprocessing & diagnostics
    postprocessingScriptPath: list[str]
    diagnosticLinks: list[ExternalUrl] = []
    paceLinks: list[ExternalUrl] = []

    # Metadata & audit
    keyFeatures: str | None = None
    notesMarkdown: str | None = None
    knownIssues: str | None = None
    annotations: list[str]

    machine: Machine


class SimulationAnalysisRequest(BaseModel):
    simulations: list[Simulation]


def describe_sim(sim: Simulation) -> str:
    return (
        f"{sim.name} [{sim.id}]: "
        f"Tag: {sim.versionTag}, Campaign: {sim.campaignId}, Compset: {sim.compset}, "
        f"Resolution: {sim.gridResolution}, Machine: {sim.machineId}, Notes: {str(sim.notesMarkdown) if sim.notesMarkdown else 'n/a'}"
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
def analyze_simulations(payload: SimulationAnalysisRequest):
    try:
        sim_descriptions = [describe_sim(sim) for sim in payload.simulations]

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
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
