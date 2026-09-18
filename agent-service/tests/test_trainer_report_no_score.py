import pytest
from pydantic import ValidationError
from schemas.interview_report import InterviewReportArtifactData

def test_trainer_report_valid_qualitative_data():
    report = InterviewReportArtifactData(
        interview_type="mixed",
        target_role="Full Stack Engineer",
        questions_asked=5,
        readiness_by_category={
            "System Design": "Strong",
            "Frontend Architecture": "Strong",
            "Behavioral & Communication": "Moderate"
        },
        strengths=["Clear STAR method explanations", "Deep knowledge of caching and indexes"],
        improvement_areas=["Quantify user impact metrics in business examples"],
        priority_topics=["Distributed Systems"],
        note="Coaching report with qualitative observations only."
    )
    assert report.target_role == "Full Stack Engineer"
    assert report.readiness_by_category["System Design"] == "Strong"

def test_trainer_report_extra_forbid_rejects_numeric_scores():
    """Verify that model_config extra='forbid' strictly rejects any injected numeric score or probability."""
    with pytest.raises(ValidationError) as exc_info1:
        InterviewReportArtifactData(
            interview_type="mixed",
            target_role="Full Stack Engineer",
            questions_asked=5,
            readiness_by_category={"Technical": "Strong"},
            strengths=["Good"],
            improvement_areas=["Improve"],
            priority_topics=["Topics"],
            overall_score=85, # Forbidden numeric score injection
        )
    assert "extra_forbidden" in str(exc_info1.value)

    with pytest.raises(ValidationError) as exc_info2:
        InterviewReportArtifactData(
            interview_type="mixed",
            target_role="Full Stack Engineer",
            questions_asked=5,
            readiness_by_category={"Technical": "Strong"},
            strengths=["Good"],
            improvement_areas=["Improve"],
            priority_topics=["Topics"],
            hiring_probability=0.75, # Forbidden hiring verdict injection
        )
    assert "extra_forbidden" in str(exc_info2.value)
