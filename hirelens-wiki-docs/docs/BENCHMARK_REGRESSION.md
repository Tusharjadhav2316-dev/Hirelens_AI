# Benchmark Regression Suite & Scoring Calibration Guide

This document defines the standardized test suite and benchmark fixtures for validating the HireLens Resume Quality and ATS Match scoring engines.

---

## 1. Quality Hierarchy Benchmarks (Resume Quality Mode)

Evaluated by `analyzeResumeQuality(resumeText)`. Experience Clarity score ($S_{exp}$) must follow a strict non-decreasing progression:

$$\text{Education Only} < \text{Projects Only} \le \text{Projects + Leadership} < \text{Internship} < \text{1-2 Yrs Professional} < \text{3-5 Yrs Pro (Quantified)}$$

### Confirmed Benchmark Targets

| Profile Name | Total Quality Score | Experience Clarity Score | Key Characteristics |
|---|:---: |:---:|---|
| **1. Education Only** | **46 / 100** | **17 / 100** | Degree & coursework only. No employment, internship, or projects. |
| **2. Projects Only** | **80 / 100** | **46 / 100** | 3 technical projects with bullet descriptions & quantified metrics. Hard-capped under 50 for experience clarity. |
| **3. Projects + Leadership** | **80 / 100** | **48 / 100** | Technical projects + Student Association President / Leadership experience. Receives +2 leadership experience boost. |
| **4. Internship** | **93 / 100** | **72 / 100** | 6-month Software Engineering Internship + technical projects. Real-world industry experience outranks project-only resumes. |
| **5. 1–2 Yrs Professional** | **97 / 100** | **89 / 100** | 1.5 years of full-time professional Software Engineering experience. |
| **6. 3–5 Yrs Pro (Quantified)** | **100 / 100** | **100 / 100** | 3.5 years of full-time Senior Full Stack & AI Engineering experience with quantified multi-million user impact metrics. |

---

## 2. Job Description Keyword Relevance Benchmarks (ATS Match Mode)

Evaluated by `analyzeResumeMatch(resumeText, jobDescription)`. Validates that technical skill alignment against the target Job Description determines keyword matching:

### AI Engineer Job Description Comparison

| Resume Profile | ATS Match Score | ATS Experience Score | Keyword Score | Content Rationale |
|---|:---:|:---:|:---:|---|
| **Projects Only (AI Focus)** | **61 / 100** | 30 / 100 | **37 / 100** | Contains PyTorch, OpenAI API, Google Gemini API, Python, Computer Vision. Matches core required AI stack. |
| **Projects + Leadership (Java Focus)** | **54 / 100** | **40 / 100** | **14 / 100** | Has higher ATS Experience (40 vs 30 due to Leadership), but lacks AI-specific stack (`Python`, `PyTorch`, `OpenAI API`). Lower keyword match. |
| **3-5 Yrs Senior AI Engineer** | **80 / 100** | **100 / 100** | **50 / 100** | Highest overall match. Combines 3.5 years full-time experience (Exp 100) with complete AI & Full-Stack technical match. |

---

## 3. Automated Test Execution

Run the automated regression test fixture at any time:

```bash
npx tsx tests/atsBenchmark.test.ts
```

All quality experience assertions and ATS keyword differentiations are verified automatically.
