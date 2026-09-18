import os
import sys
import json
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from pydantic import ValidationError
from schemas.role_intelligence import RoleIntelligence, CategoryWeight
from tools.interview_tools import analyze_role

class TestRoleIntelligenceSchema:
    def test_valid_role_intelligence_creation(self):
        data = {
            "target_role": "Data Analyst",
            "role_summary": "Responsible for interpreting data, analyzing results, and creating dashboards.",
            "likely_competencies": ["SQL & Querying", "Data Visualization", "Statistical Analysis", "Business Insight"],
            "interview_categories": [
                {"category": "SQL & Data Modeling", "weight": 0.35},
                {"category": "Business Problem Solving", "weight": 0.30},
                {"category": "Data Communication", "weight": 0.20},
                {"category": "Statistical Methods", "weight": 0.15}
            ],
            "technical_balance": "mostly_technical",
            "suggested_topics": ["SQL window functions", "A/B test analysis", "Executive stakeholder dashboards"],
            "evidence_basis": "role_inference",
            "assumptions": ["Assumed standard mid-level industry data analytics expectations."]
        }
        obj = RoleIntelligence.model_validate(data)
        assert obj.target_role == "Data Analyst"
        assert len(obj.likely_competencies) == 4
        assert obj.interview_categories[0].weight == 0.35

    def test_scenario_9_extra_schema_field_rejected(self):
        """Scenario 9: Extra schema field (e.g. confidence_score, emotion) is rejected by extra='forbid'."""
        data = {
            "target_role": "Product Manager",
            "role_summary": "Leads cross-functional product execution.",
            "likely_competencies": ["Product Strategy", "User Research", "Agile Execution"],
            "interview_categories": [
                {"category": "Product Sense", "weight": 0.5},
                {"category": "Execution", "weight": 0.5}
            ],
            "technical_balance": "balanced",
            "suggested_topics": ["Prioritization frameworks", "Feature launch trade-offs"],
            "evidence_basis": "role_inference",
            "assumptions": [],
            "confidence_score": 92.5,  # Injected forbidden field
            "personality_rating": "high"  # Injected forbidden field
        }
        with pytest.raises(ValidationError):
            RoleIntelligence.model_validate(data)

    def test_extra_field_on_category_weight_rejected(self):
        with pytest.raises(ValidationError):
            CategoryWeight.model_validate({
                "category": "Domain Knowledge",
                "weight": 0.5,
                "importance_rating": 5  # Extra field
            })


class TestUniversalRoleIntelligenceTool:
    def test_scenario_1_business_analyst(self):
        """Scenario 1: Business Analyst yields BA-relevant competencies."""
        res_raw = analyze_role.func(target_role="Business Analyst")
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.target_role == "Business Analyst"
        text_dump = json.dumps(res).lower()
        # Should reflect business/analytical competencies
        assert any(term in text_dump for term in ["business", "analytical", "stakeholder", "process", "requirements", "competencies"])
        # Should NOT default to Software Engineer
        assert validated.target_role != "Software Engineer"

    def test_scenario_2_ml_engineer(self):
        """Scenario 2: ML Engineer yields ML/technical competencies."""
        res_raw = analyze_role.func(target_role="Machine Learning Engineer")
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.target_role == "Machine Learning Engineer"
        assert validated.technical_balance in ["mostly_technical", "balanced"]
        text_dump = json.dumps(res).lower()
        assert any(term in text_dump for term in ["machine learning", "technical", "models", "data", "architecture", "skills"])

    def test_scenario_3_teacher(self):
        """Scenario 3: Teacher yields teaching/communication/classroom competencies."""
        res_raw = analyze_role.func(target_role="High School Teacher")
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.target_role == "High School Teacher"
        assert validated.technical_balance in ["mostly_non_technical", "balanced"]
        text_dump = json.dumps(res).lower()
        assert any(term in text_dump for term in ["teach", "communication", "education", "student", "classroom", "domain", "interpersonal"])

    def test_scenario_4_financial_analyst(self):
        """Scenario 4: Financial Analyst yields finance/analysis competencies."""
        res_raw = analyze_role.func(target_role="Financial Analyst")
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.target_role == "Financial Analyst"
        text_dump = json.dumps(res).lower()
        assert any(term in text_dump for term in ["financial", "finance", "analytical", "modeling", "valuation", "analysis", "competencies"])

    def test_scenario_5_arbitrary_unfamiliar_role(self):
        """Scenario 5: Arbitrary unfamiliar role produces valid structured role intelligence."""
        weird_role = "Spaceport Logistics Director"
        res_raw = analyze_role.func(target_role=weird_role)
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.target_role == weird_role
        assert len(validated.likely_competencies) >= 2
        assert len(validated.interview_categories) >= 2
        assert len(validated.suggested_topics) >= 1

    def test_scenario_6_role_omitted_validation_error(self):
        """Scenario 6: Role omitted triggers validation error."""
        with pytest.raises(ValueError) as exc_info:
            analyze_role.func(target_role="")
        assert "target_role cannot be empty" in str(exc_info.value)

        with pytest.raises(ValueError):
            analyze_role.func(target_role="   ")

    def test_scenario_7_jd_omitted(self):
        """Scenario 7: JD omitted sets role_inference + explicit assumptions."""
        res_raw = analyze_role.func(target_role="Corporate Event Planner", job_description=None)
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.evidence_basis == "role_inference"
        assert len(validated.assumptions) > 0

    def test_scenario_8_jd_provided(self):
        """Scenario 8: JD provided sets job_description evidence basis."""
        jd_text = (
            "We are seeking an experienced Clinical Research Coordinator to manage phase II/III clinical trials, "
            "ensure GCP/FDA regulatory compliance, handle IRB submissions, and coordinate patient enrollment."
        )
        res_raw = analyze_role.func(target_role="Clinical Research Coordinator", job_description=jd_text)
        res = json.loads(res_raw)
        validated = RoleIntelligence.model_validate(res)

        assert validated.evidence_basis == "job_description"
        assert validated.target_role == "Clinical Research Coordinator"

    def test_scenario_10_no_software_engineer_bias(self):
        """Scenario 10: Non-technical roles contain no Software Engineer bias or default injection."""
        non_tech_roles = ["Elementary School Principal", "Creative Director", "Head Chef", "Pediatric Nurse"]
        for role in non_tech_roles:
            res_raw = analyze_role.func(target_role=role)
            res = json.loads(res_raw)
            validated = RoleIntelligence.model_validate(res)

            assert validated.target_role == role
            text_dump = json.dumps(res).lower()
            assert "software engineer" not in text_dump
            assert "coding" not in text_dump
            assert "git" not in text_dump
            assert "react" not in text_dump
