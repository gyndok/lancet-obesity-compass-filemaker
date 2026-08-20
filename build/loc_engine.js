var LOCENGINE = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // entry_engine.ts
  var entry_engine_exports = {};
  __export(entry_engine_exports, {
    DiagnosticEngine: () => DiagnosticEngine,
    computeAllScores: () => computeAllScores,
    computeBmi: () => computeBmi,
    formatScoreValue: () => formatScoreValue,
    phq9SafetyFlagActive: () => phq9SafetyFlagActive,
    scoreEpworth: () => scoreEpworth,
    scoreGad7: () => scoreGad7,
    scoreHungerVs: () => scoreHungerVs,
    scorePavs: () => scorePavs,
    scorePhq9: () => scorePhq9,
    scoreScoff: () => scoreScoff,
    scoreStopBang: () => scoreStopBang,
    severityColor: () => severityColor
  });

  // lib/clinicalScoring.ts
  var findAnswer = (responses, id) => {
    const r = responses.find((x) => x.questionId === id);
    if (!r) return null;
    if (r.answer === "" || Array.isArray(r.answer) && r.answer.length === 0) return null;
    return r.answer;
  };
  var parseScored = (v) => {
    if (v === null || typeof v !== "string") return null;
    const m = v.match(/\((\d+)\)/);
    return m ? parseInt(m[1], 10) : null;
  };
  var yesNo = (v) => {
    if (v === null || typeof v !== "string") return null;
    if (v === "Yes") return 1;
    if (v === "No") return 0;
    return null;
  };
  var numAnswer = (v) => {
    if (v === null) return null;
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
    return null;
  };
  var sumItems = (ids, parser, responses) => {
    const vals = ids.map((id) => parser(findAnswer(responses, id)));
    const answered = vals.filter((v) => v !== null);
    return { sum: answered.reduce((a, b) => a + b, 0), answered: answered.length, vals };
  };
  var computeBmi = (bmi) => {
    if (!bmi || !bmi.weight) return null;
    const inches = bmi.useFeetInches ? (bmi.heightInFeet || 0) * 12 + (bmi.heightInInches || 0) : bmi.height || 0;
    if (!inches) return null;
    return bmi.weight / (inches * inches) * 703;
  };
  var phq9SafetyFlagActive = (responses) => {
    const v = parseScored(findAnswer(responses, 78));
    return v !== null && v > 0;
  };
  var scorePhq9 = (responses) => {
    const ids = [70, 71, 72, 73, 74, 75, 76, 77, 78];
    const { sum, answered, vals } = sumItems(ids, parseScored, responses);
    const q9 = vals[8];
    const flags = [];
    if (q9 !== null && q9 > 0) flags.push("PHQ-9 Q9 positive \u2014 assess suicide risk directly");
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/9 items)`;
    if (answered === 9) {
      if (sum <= 4) {
        severity = "normal";
        interpretation = "Minimal depression";
      } else if (sum <= 9) {
        severity = "mild";
        interpretation = "Mild depression";
      } else if (sum <= 14) {
        severity = "moderate";
        interpretation = "Moderate depression";
      } else if (sum <= 19) {
        severity = "moderately-severe";
        interpretation = "Moderately severe depression";
      } else {
        severity = "severe";
        interpretation = "Severe depression";
      }
    } else if (answered > 0 && sum >= 5) {
      if (sum >= 20) {
        severity = "severe";
        interpretation = `Incomplete (${answered}/9) \u2014 at least severe depression`;
      } else if (sum >= 15) {
        severity = "moderately-severe";
        interpretation = `Incomplete (${answered}/9) \u2014 at least moderately severe depression`;
      } else if (sum >= 10) {
        severity = "moderate";
        interpretation = `Incomplete (${answered}/9) \u2014 at least moderate depression`;
      } else {
        severity = "mild";
        interpretation = `Incomplete (${answered}/9) \u2014 at least mild depression`;
      }
    }
    return {
      name: "Depression",
      abbrev: "PHQ-9",
      score: answered === 0 ? null : sum,
      maxScore: 27,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 9,
      flags
    };
  };
  var scoreGad7 = (responses) => {
    const ids = [79, 80, 81, 82, 83, 84, 85];
    const { sum, answered } = sumItems(ids, parseScored, responses);
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/7 items)`;
    if (answered === 7) {
      if (sum <= 4) {
        severity = "normal";
        interpretation = "Minimal anxiety";
      } else if (sum <= 9) {
        severity = "mild";
        interpretation = "Mild anxiety";
      } else if (sum <= 14) {
        severity = "moderate";
        interpretation = "Moderate anxiety";
      } else {
        severity = "severe";
        interpretation = "Severe anxiety";
      }
    } else if (answered > 0 && sum >= 5) {
      if (sum >= 15) {
        severity = "severe";
        interpretation = `Incomplete (${answered}/7) \u2014 at least severe anxiety`;
      } else if (sum >= 10) {
        severity = "moderate";
        interpretation = `Incomplete (${answered}/7) \u2014 at least moderate anxiety`;
      } else {
        severity = "mild";
        interpretation = `Incomplete (${answered}/7) \u2014 at least mild anxiety`;
      }
    }
    return {
      name: "Anxiety",
      abbrev: "GAD-7",
      score: answered === 0 ? null : sum,
      maxScore: 21,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 7,
      flags: []
    };
  };
  var scoreScoff = (responses) => {
    const ids = [86, 87, 88, 89, 90];
    const { sum, answered } = sumItems(ids, yesNo, responses);
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/5 items)`;
    const flags = [];
    if (sum >= 2) {
      severity = "positive";
      interpretation = answered === 5 ? "Positive screen \u2014 consider BED/ED evaluation" : `Incomplete (${answered}/5) \u2014 already positive (\u22652 yes)`;
      flags.push("SCOFF \u22652 \u2014 consider Binge Eating Disorder / eating disorder evaluation");
    } else if (answered === 5) {
      severity = "negative";
      interpretation = "Negative screen";
    }
    return {
      name: "Eating Disorder",
      abbrev: "SCOFF",
      score: answered === 0 ? null : sum,
      maxScore: 5,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 5,
      flags
    };
  };
  var scoreStopBang = (responses, bmi) => {
    const sIds = [95, 96, 97, 98, 99];
    const { sum: stopSum, answered: stopAnswered } = sumItems(sIds, yesNo, responses);
    const ageAns = numAnswer(findAnswer(responses, 1));
    const sexAns = findAnswer(responses, 2);
    const computedBmi = computeBmi(bmi);
    let bangPoints = 0;
    let bangAnswered = 0;
    if (computedBmi !== null) {
      bangAnswered++;
      if (computedBmi > 35) bangPoints++;
    }
    if (ageAns !== null) {
      bangAnswered++;
      if (ageAns > 50) bangPoints++;
    }
    if (typeof sexAns === "string") {
      bangAnswered++;
      if (sexAns === "Male") bangPoints++;
    }
    const total = stopSum + bangPoints;
    const answered = stopAnswered + bangAnswered;
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/8 items)`;
    const flags = [];
    if (answered === 8) {
      if (total <= 2) {
        severity = "normal";
        interpretation = "Low OSA risk";
      } else if (total <= 4) {
        severity = "moderate";
        interpretation = "Intermediate OSA risk";
        flags.push("STOP-BANG \u22653 \u2014 consider OSA evaluation / sleep study");
      } else {
        severity = "severe";
        interpretation = "High OSA risk";
        flags.push("STOP-BANG \u22655 \u2014 high-risk OSA, strongly consider sleep study");
      }
    } else if (answered > 0 && total >= 3) {
      if (total >= 5) {
        severity = "severe";
        interpretation = `Incomplete (${answered}/8) \u2014 already high OSA risk`;
        flags.push("STOP-BANG \u22655 \u2014 high-risk OSA, strongly consider sleep study");
      } else {
        severity = "moderate";
        interpretation = `Incomplete (${answered}/8) \u2014 at least intermediate OSA risk`;
        flags.push("STOP-BANG \u22653 \u2014 consider OSA evaluation / sleep study");
      }
    }
    return {
      name: "OSA Risk",
      abbrev: "STOP-BANG",
      score: answered === 0 ? null : total,
      maxScore: 8,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 8,
      flags
    };
  };
  var scoreEpworth = (responses) => {
    const ids = [100, 101, 102, 103, 104, 105, 106, 107];
    const { sum, answered } = sumItems(ids, parseScored, responses);
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/8 items)`;
    const flags = [];
    if (answered === 8) {
      if (sum <= 10) {
        severity = "normal";
        interpretation = "Normal daytime sleepiness";
      } else if (sum <= 14) {
        severity = "mild";
        interpretation = "Mild excessive daytime sleepiness";
        flags.push("ESS \u226511 \u2014 excessive daytime sleepiness, consider workup");
      } else if (sum <= 17) {
        severity = "moderate";
        interpretation = "Moderate excessive daytime sleepiness";
        flags.push("ESS 15\u201317 \u2014 moderate EDS, evaluate for OSA/sleep disorder");
      } else {
        severity = "severe";
        interpretation = "Severe excessive daytime sleepiness";
        flags.push("ESS \u226518 \u2014 severe EDS, prompt sleep evaluation indicated");
      }
    } else if (answered > 0 && sum >= 11) {
      if (sum >= 18) {
        severity = "severe";
        interpretation = `Incomplete (${answered}/8) \u2014 at least severe daytime sleepiness`;
        flags.push("ESS \u226518 \u2014 severe EDS, prompt sleep evaluation indicated");
      } else if (sum >= 15) {
        severity = "moderate";
        interpretation = `Incomplete (${answered}/8) \u2014 at least moderate daytime sleepiness`;
        flags.push("ESS 15\u201317 \u2014 moderate EDS, evaluate for OSA/sleep disorder");
      } else {
        severity = "mild";
        interpretation = `Incomplete (${answered}/8) \u2014 at least mild daytime sleepiness`;
        flags.push("ESS \u226511 \u2014 excessive daytime sleepiness, consider workup");
      }
    }
    return {
      name: "Daytime Sleepiness",
      abbrev: "ESS",
      score: answered === 0 ? null : sum,
      maxScore: 24,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 8,
      flags
    };
  };
  var scorePavs = (responses) => {
    const days = numAnswer(findAnswer(responses, 108));
    const minutes = numAnswer(findAnswer(responses, 109));
    let answered = 0;
    if (days !== null) answered++;
    if (minutes !== null) answered++;
    let total = null;
    if (days !== null && minutes !== null) total = days * minutes;
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/2 items)`;
    if (total !== null) {
      if (total >= 150) {
        severity = "normal";
        interpretation = `${total} min/week \u2014 meets activity guidelines`;
      } else if (total > 0) {
        severity = "insufficient";
        interpretation = `${total} min/week \u2014 below 150-min guideline`;
      } else {
        severity = "insufficient";
        interpretation = "Inactive (0 min/week)";
      }
    }
    return {
      name: "Physical Activity",
      abbrev: "PAVS",
      score: total,
      maxScore: 0,
      scoreText: total !== null ? `${total} min/wk` : void 0,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 2,
      flags: []
    };
  };
  var scoreHungerVs = (responses) => {
    const a = findAnswer(responses, 68);
    const b = findAnswer(responses, 69);
    const isPositive = (v) => typeof v === "string" && (v === "Often true" || v === "Sometimes true");
    let answered = 0;
    if (a !== null) answered++;
    if (b !== null) answered++;
    let severity = "unknown";
    let interpretation = `Incomplete (${answered}/2 items)`;
    const flags = [];
    if (isPositive(a) || isPositive(b)) {
      severity = "positive";
      interpretation = "Positive \u2014 food insecurity";
      flags.push("Food insecurity identified \u2014 offer resources / social-work referral");
    } else if (answered === 2) {
      severity = "negative";
      interpretation = "Negative \u2014 food secure";
    }
    return {
      name: "Food Security",
      abbrev: "Hunger VS",
      score: null,
      maxScore: 0,
      interpretation,
      severity,
      itemsAnswered: answered,
      totalItems: 2,
      flags
    };
  };
  var computeAllScores = (responses, bmi) => [
    scorePhq9(responses),
    scoreGad7(responses),
    scoreScoff(responses),
    scoreStopBang(responses, bmi),
    scoreEpworth(responses),
    scorePavs(responses),
    scoreHungerVs(responses)
  ];
  var severityColor = (s) => {
    switch (s) {
      case "normal":
      case "negative":
        return "text-success";
      case "mild":
        return "text-amber-600";
      case "moderate":
      case "positive":
      case "insufficient":
        return "text-orange-600";
      case "moderately-severe":
      case "severe":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };
  var formatScoreValue = (s) => {
    if (s.scoreText) return s.scoreText;
    if (s.score === null) return "\u2014";
    if (s.maxScore > 0) return `${s.score}/${s.maxScore}`;
    return String(s.score);
  };

  // lib/diagnostic-engine.ts
  var DiagnosticEngine = class {
    static evaluate(data) {
      if (!this.hasMinimumData(data)) {
        return null;
      }
      const criteria = this.assessCriteria(data);
      const classification = this.classify(criteria);
      const confidence = this.assessConfidence(data, criteria);
      const recommendations = this.generateRecommendations(classification, criteria);
      const reasoning = this.generateReasoning(classification, criteria);
      const affectedSystems = this.identifyAffectedSystems(data);
      return {
        classification,
        confidence,
        criteria,
        recommendations,
        reasoning,
        affectedSystems
      };
    }
    static hasMinimumData(data) {
      const anthro = data.anthropometrics;
      return !!(anthro.height && anthro.weight) || !!anthro.bmi;
    }
    static assessCriteria(data) {
      const adiposity = this.confirmExcessAdiposity(data.anthropometrics);
      const organDysfunction = this.assessOrganDysfunction(data);
      const functionalLimitations = this.assessFunctionalLimitations(data.functional);
      const riskFactors = this.identifyRiskFactors(data);
      return {
        excessAdiposityConfirmed: adiposity.confirmed,
        adiposityPresumedFromBmiAlone: adiposity.presumedFromBmiAlone,
        organDysfunction,
        functionalLimitations,
        riskFactors
      };
    }
    static confirmExcessAdiposity(anthro) {
      let bmi = anthro.bmi;
      if (!bmi && anthro.height && anthro.weight) {
        bmi = anthro.weight / (anthro.height * anthro.height) * 703;
      }
      const bodyFatMeasured = anthro.bodyFatPercentage != null && !anthro.bodyFatIsEstimated;
      if (bodyFatMeasured && anthro.bodyFatPercentage > 45) {
        return { confirmed: true, presumedFromBmiAlone: false };
      }
      const ethnicity = anthro.ethnicity?.toLowerCase() || "";
      const isAsian = ethnicity === "asian" || ethnicity.includes("east asian") || ethnicity.includes("south asian") || ethnicity.includes("southeast asian") || ethnicity === "chinese" || ethnicity === "japanese" || ethnicity === "korean" || ethnicity === "indian" || ethnicity === "vietnamese" || ethnicity === "thai" || ethnicity === "filipino";
      const bmiPreObesityThreshold = isAsian ? 23 : 25;
      const bmiNormalThreshold = isAsian ? 22.9 : 25;
      let waistAbnormal = false;
      if (anthro.waistCircumference) {
        const thresholdInches = isAsian ? anthro.sex === "male" ? 35.4 : 31.5 : anthro.sex === "male" ? 40 : 35;
        waistAbnormal = anthro.waistCircumference >= thresholdInches;
      }
      const whtrAbnormal = !!anthro.waistHeightRatio && anthro.waistHeightRatio >= 0.5;
      const whrAbnormal = !!anthro.waistHipRatio && anthro.waistHipRatio >= (anthro.sex === "male" ? 0.9 : 0.85);
      let bodyFatAbnormal = false;
      if (bodyFatMeasured && anthro.age && anthro.age >= 18) {
        const normalRange = this.getBodyFatNormalRange(anthro.age, anthro.sex ?? "female");
        bodyFatAbnormal = !!normalRange && anthro.bodyFatPercentage > normalRange.upper;
      }
      const confirmatorySupport = waistAbnormal || whtrAbnormal || whrAbnormal || bodyFatAbnormal;
      if (bmi && bmi > 40) {
        return { confirmed: true, presumedFromBmiAlone: false };
      }
      if (bmi && bmi >= bmiPreObesityThreshold) {
        return { confirmed: true, presumedFromBmiAlone: !confirmatorySupport };
      }
      if (bmi && bmi < bmiNormalThreshold) {
        const count = [waistAbnormal, whtrAbnormal, whrAbnormal, bodyFatAbnormal].filter(Boolean).length;
        return { confirmed: count >= 2, presumedFromBmiAlone: false };
      }
      return { confirmed: false, presumedFromBmiAlone: false };
    }
    static assessOrganDysfunction(data) {
      const dysfunction = [];
      const { clinical, laboratory } = data;
      if (clinical.type2Diabetes) {
        dysfunction.push("Metabolic: Type 2 diabetes");
      } else if (laboratory.hba1c && laboratory.hba1c >= 6.5 || laboratory.fastingGlucose && laboratory.fastingGlucose >= 126) {
        dysfunction.push("Metabolic: Hyperglycemia \u2014 confirm T2DM");
      }
      if (clinical.hypertension || clinical.cardiovascularDisease) {
        dysfunction.push("Cardiovascular: Hypertension/CVD");
      }
      if (clinical.nafld || laboratory.fibrosis) {
        dysfunction.push("Hepatic: NAFLD/fibrosis");
      }
      if (laboratory.egfr && laboratory.egfr < 60 || laboratory.microalbuminuria) {
        dysfunction.push("Renal: Decreased eGFR/albuminuria");
      }
      if (clinical.sleepApnea) {
        dysfunction.push("Respiratory: Sleep apnea");
      }
      if (clinical.pcos) {
        dysfunction.push("Reproductive: PCOS");
      }
      if (clinical.osteoarthritis) {
        dysfunction.push("Musculoskeletal: Osteoarthritis");
      }
      return dysfunction;
    }
    static assessFunctionalLimitations(functional) {
      const limitations = [];
      if (functional.mobilityLimitations) limitations.push("Mobility limitations");
      if (functional.bathingDifficulty) limitations.push("Bathing difficulty");
      if (functional.dressingDifficulty) limitations.push("Dressing difficulty");
      if (functional.toiletingDifficulty) limitations.push("Toileting difficulty");
      if (functional.continenceDifficulty) limitations.push("Continence difficulty");
      if (functional.eatingDifficulty) limitations.push("Eating difficulty");
      return limitations;
    }
    static identifyRiskFactors(data) {
      const risks = [];
      const { clinical, laboratory } = data;
      if (clinical.breathlessness) risks.push("Breathlessness/dyspnea");
      if (clinical.fatigue) risks.push("Chronic fatigue");
      if (clinical.chronicPain) risks.push("Chronic pain");
      if (clinical.urinaryIncontinence) risks.push("Urinary incontinence");
      if (clinical.sleepDisorders) risks.push("Sleep disorders");
      if (clinical.reflux) risks.push("GERD");
      if (clinical.mentalHealth) risks.push("Mental health concerns");
      if (laboratory.triglycerides && laboratory.triglycerides >= 150) {
        risks.push("Elevated triglycerides");
      }
      if (laboratory.hdl && laboratory.hdl < 40) {
        risks.push("Low HDL cholesterol");
      }
      if (laboratory.crp && laboratory.crp > 3) {
        risks.push("Elevated CRP (inflammation)");
      }
      if (laboratory.alt && laboratory.alt > 40 || laboratory.ast && laboratory.ast > 40) {
        risks.push("Elevated liver enzymes");
      }
      return risks;
    }
    static classify(criteria) {
      if (!criteria.excessAdiposityConfirmed) {
        return "no-obesity";
      }
      if (criteria.organDysfunction.length > 0 || criteria.functionalLimitations.length > 0) {
        return "clinical-obesity";
      }
      return "preclinical-obesity";
    }
    static assessConfidence(data, criteria) {
      let score = 0;
      const anthro = data.anthropometrics;
      if (anthro.height && anthro.weight) score++;
      if (anthro.waistCircumference) score++;
      if (anthro.bodyFatPercentage) score++;
      const clinicalFields = Object.values(data.clinical).filter((v) => v !== void 0).length;
      if (clinicalFields >= 3) score++;
      const labFields = Object.values(data.laboratory).filter((v) => v !== void 0).length;
      if (labFields >= 3) score++;
      const funcFields = Object.values(data.functional).filter((v) => v !== void 0).length;
      if (funcFields >= 2) score++;
      if (score >= 5) return criteria.adiposityPresumedFromBmiAlone ? "medium" : "high";
      if (score >= 3) return "medium";
      return "low";
    }
    static generateRecommendations(classification, criteria) {
      const recommendations = [];
      switch (classification) {
        case "clinical-obesity":
          recommendations.push("Initiate comprehensive obesity management plan");
          recommendations.push("Consider pharmacotherapy or surgical evaluation");
          recommendations.push("Address identified organ dysfunction");
          recommendations.push("Monitor for complications");
          break;
        case "preclinical-obesity":
          recommendations.push("Implement lifestyle intervention program");
          recommendations.push("Regular monitoring for disease progression");
          recommendations.push("Preventive counseling for identified risk factors");
          recommendations.push("Consider weight management referral");
          break;
        case "no-obesity":
          recommendations.push("Continue healthy lifestyle practices");
          recommendations.push("Routine health maintenance");
          if (criteria.riskFactors.length > 0) {
            recommendations.push("Address identified risk factors");
          }
          break;
      }
      return recommendations;
    }
    static generateReasoning(classification, criteria) {
      let reasoning = "";
      if (!criteria.excessAdiposityConfirmed) {
        reasoning = "Excess adiposity not confirmed based on available anthropometric measurements.";
      } else if (classification === "clinical-obesity") {
        reasoning = `Excess adiposity confirmed with evidence of organ dysfunction (${criteria.organDysfunction.length} systems affected)`;
        if (criteria.functionalLimitations.length > 0) {
          reasoning += ` and functional limitations (${criteria.functionalLimitations.length} domains affected)`;
        }
        reasoning += ".";
      } else if (classification === "preclinical-obesity") {
        reasoning = "Excess adiposity confirmed but without evidence of organ dysfunction or significant functional limitations.";
      }
      if (criteria.excessAdiposityConfirmed && criteria.adiposityPresumedFromBmiAlone) {
        reasoning += " Excess adiposity presumed from BMI alone \u2014 confirm with waist circumference or another anthropometric measure.";
      }
      return reasoning;
    }
    static identifyAffectedSystems(data) {
      const systems = /* @__PURE__ */ new Set();
      if (data.clinical.type2Diabetes || data.laboratory.hba1c && data.laboratory.hba1c >= 6.5 || data.laboratory.fastingGlucose && data.laboratory.fastingGlucose >= 126) {
        systems.add("Endocrine/Metabolic");
      }
      if (data.laboratory.egfr && data.laboratory.egfr < 60 || data.laboratory.microalbuminuria) {
        systems.add("Renal");
      }
      if (data.clinical.hypertension || data.clinical.cardiovascularDisease) {
        systems.add("Cardiovascular");
      }
      if (data.clinical.nafld || data.laboratory.fibrosis) {
        systems.add("Hepatic");
      }
      if (data.clinical.sleepApnea) {
        systems.add("Respiratory");
      }
      if (data.clinical.pcos) {
        systems.add("Reproductive");
      }
      if (data.clinical.osteoarthritis) {
        systems.add("Musculoskeletal");
      }
      return Array.from(systems);
    }
    static getBodyFatNormalRange(age, sex) {
      if (age < 18) return null;
      const ranges = {
        male: {
          "18-29": { lower: 12, upper: 19 },
          "30-39": { lower: 14, upper: 22 },
          "40-49": { lower: 16, upper: 24 },
          "50-59": { lower: 18, upper: 26 },
          "60+": { lower: 20, upper: 28 }
        },
        female: {
          "18-29": { lower: 24, upper: 32 },
          "30-39": { lower: 25, upper: 34 },
          "40-49": { lower: 27, upper: 36 },
          "50-59": { lower: 29, upper: 38 },
          "60+": { lower: 30, upper: 40 }
        }
      };
      const genderRanges = sex === "male" ? ranges.male : ranges.female;
      if (age >= 18 && age <= 29) return genderRanges["18-29"];
      if (age >= 30 && age <= 39) return genderRanges["30-39"];
      if (age >= 40 && age <= 49) return genderRanges["40-49"];
      if (age >= 50 && age <= 59) return genderRanges["50-59"];
      if (age >= 60) return genderRanges["60+"];
      return null;
    }
  };
  return __toCommonJS(entry_engine_exports);
})();
