"""Assemble the Make A Mark Live handoff from the supplied content contract."""

from __future__ import annotations

import json
from pathlib import Path

PRES = {
    "pending_ms": 400,
    "reveal_ms": 280,
    "allow_skip": True,
    "streaming": False,
}

ROOT = Path(__file__).resolve().parents[1]


def metric(id, label, value, unit, period, kind, scope, source_ids, note, precision, cadence="annual"):
    return {
        "id": id,
        "label": label,
        "value": value,
        "unit": unit,
        "period": period,
        "kind": kind,
        "scope": scope,
        "source_ids": source_ids,
        "cadence": cadence,
        "note": note,
        "display_precision": precision,
    }


METRICS = [
    metric("footprint_2023", "Market-based footprint before SAF certificates", 97216.47, "tCO2e", "2023", "reported", "team", ["ESG25_P83", "ESG25_P85"], "2023 and 2024 are restated in the 2025 report. Use one consistent methodology series.", 2),
    metric("footprint_2024", "Market-based footprint before SAF certificates", 87300.62, "tCO2e", "2024", "reported", "team", ["ESG25_P83", "ESG25_P85"], "2023 and 2024 are restated in the 2025 report. Use one consistent methodology series.", 2),
    metric("footprint_2025", "Market-based footprint before SAF certificates", 87162.4, "tCO2e", "2025", "reported", "team", ["ESG25_P83", "ESG25_P85"], "2023 and 2024 are restated in the 2025 report. Use one consistent methodology series.", 2),
    metric("footprint_2025_after_safc", "Market-based footprint with SAF certificates", 85974.41, "tCO2e", "2025", "reported", "team", ["ESG25_P83"], "Published total retained. Subtracting rounded 1,188 from 87,162.40 gives 85,974.40; report total differs by 0.01. Do not silently rewrite it.", 2),
    metric("safc_2025", "SAF certificate reduction", 1188, "tCO2e", "2025", "reported", "team", ["ESG25_P24", "ESG25_P83"], "", 2),
    metric("saf_percent_2025", "Reported reduction in associated air-freight emissions", 31, "percent", "2025", "reported", "team", ["ESG25_P24"], "Historical annual reduction, not the current race or a sustainable-fuel blend percentage.", 0),
    metric("circularity_2025", "AMR25 material circularity", 32, "percent", "2025", "reported", "AMR25", ["ESG25_P31"], "Not AMR26 recycled chassis content.", 0),
    metric("carbon_fibre_2025", "Carbon fibre recycled across operations", 1.3, "tonnes", "2025", "reported", "team", ["ESG25_P32"], "", 1),
    metric("scope1_2023", "Scope 1", 166.58, "tCO2e", "2023", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope2_market_2023", "Scope 2 market-based", 1726.13, "tCO2e", "2023", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope1_2024", "Scope 1", 175.5, "tCO2e", "2024", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope2_market_2024", "Scope 2 market-based", 444.78, "tCO2e", "2024", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope1_2025", "Scope 1", 156.57, "tCO2e", "2025", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope2_market_2025", "Scope 2 market-based", 343.08, "tCO2e", "2025", "reported", "team", ["ESG25_P83"], "", 2),
    metric("scope12_change", "Change in Scope 1 + 2 versus restated 2023", -73.6, "percent", "2025", "derived", "team", ["ESG25_P83"], "(499.65 / 1892.71 - 1) × 100. Display approximately −74%.", 0, "static"),
    metric("supply_chain", "Supply Chain", 69837, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("freight_logistics", "Freight Logistics", 5560.45, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("business_travel", "Business Travel", 5124.32, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("commuting", "Commuting", 5717.3, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("hq_energy", "Hq Energy", 772.91, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("other", "Other", 150.4, "tCO2e", "2025", "reported", "team", ["ESG25_P19"], "Published category; category sum exceeds the reported total by 0.02 tCO2e. Preserve published data and disclose rounding.", 2),
    metric("aleto_network", "Respondents reporting a stronger professional network", 93, "percent", "2025", "reported", "team", ["ESG25_P42"], "", 0),
    metric("aleto_leadership", "Respondents reporting leadership, confidence and presentation growth", 90, "percent", "2025", "reported", "team", ["ESG25_P42"], "", 0),
    metric("aleto_cohort", "Participants in the detailed programme section", 14, "students", "2025", "reported", "team", ["ESG25_P42"], "Detailed programme page reports 14; highlights report 15. Display 14 with discrepancy note, not an invented average.", 0),
    metric("accelerate_continue", "Mentors and mentees likely to continue the relationship", 71, "percent", "2025", "reported", "team", ["ESG25_P45"], "", 0),
    metric("afbe_students", "Transition event participants", 16, "students", "2025", "reported", "team", ["ESG25_P46"], "", 0),
    metric("afbe_helpful", "Attendees reporting that the event was helpful", 100, "percent", "2025", "reported", "team", ["ESG25_P46"], "", 0),
    metric("paddle_prototypes", "Para-canoe seat prototypes", 3, "prototypes", "2025", "reported", "team", ["ESG25_P47"], "", 0),
    metric("neuro_members", "Colleagues engaged by the neurodiversity group", 35, "colleagues", "2025", "reported", "team", ["ESG25_P48"], "Approximately 35 colleagues; preserve approximate qualifier.", 0),
    metric("mam_students", "Make A Mark Day participants", 257, "students", "2025", "reported", "team", ["ESG25_P59"], "", 0),
    metric("mam_schools", "Schools and community groups represented", 14, "groups", "2025", "reported", "team", ["ESG25_P59"], "", 0),
    metric("mam_ai_gap", "Students initially unclear about skills needed for AI work", 68, "percent", "2025", "reported", "team", ["ESG25_P61"], "", 0),
    metric("interns_2025", "Aramco sponsored summer placement participants", 8, "students", "2025", "reported", "team", ["ESG25_P67"], "", 0),
    metric("stem_students", "STEM Racing World Finals engagement", 600, "students", "2025", "reported", "team", ["ESG25_P68"], "Narrative says more than 600; graphic displays 600. Display 600+.", 0),
    metric("stem_countries", "Countries represented", 35, "countries", "2025", "reported", "team", ["ESG25_P68"], "", 0),
    metric("fundraising_2025", "Charitable funds raised", 140000, "GBP", "2025", "reported", "team", ["ESG25_P72"], "", 0),
    metric("workforce_women", "Women in the relevant workforce cohort", 16, "percent", "2025", "reported", "team", ["ESG25_P55"], "", 0),
    metric("workforce_count", "Relevant colleagues in pay reporting cohort", 952, "colleagues", "2025", "reported", "team", ["ESG25_P55"], "", 0),
    metric("paygap_median", "Median gender pay gap", 20.6, "percent", "2025", "reported", "team", ["ESG25_P55"], "", 1),
    metric("paygap_mean", "Mean gender pay gap", 54.3, "percent", "2025", "reported", "team", ["ESG25_P55"], "", 1),
    metric("stem_target", "STEM programme ambition over three years", 100000, "students", "2025", "target", "team", ["ESG25_P68"], "Future ambition, not achieved reach. Narrative says more than 100,000.", 0, "static"),
    metric("engine_displacement_l", "Combustion engine displacement", 1.6, "litres", "2026", "technical_specification", "vehicle", ["AMR26_ENGINEERING"], "", 1, "static"),
    metric("mgu_k_2025", "2025 permitted MGU-K peak power", 120, "kW", "2025", "technical_specification", "regulation", ["AMR26_ENGINEERING"], "Permitted peak, not measured continuous deployment.", 0, "static"),
    metric("mgu_k_2026", "2026 permitted MGU-K peak power", 350, "kW", "2026", "technical_specification", "regulation", ["AMR26_ENGINEERING"], "Permitted peak, not measured continuous deployment.", 0, "static"),
    metric("fuel_2026", "FIA-compliant sustainable fuel", 100, "percent", "2026", "technical_specification", "vehicle", ["AMR26_ENGINEERING"], "", 0, "static"),
    metric("gears", "Transmission gears", 8, "gears", "2026", "technical_specification", "vehicle", ["AMR26_ENGINEERING"], "", 0, "static"),
    metric("wheel_size", "Wheel diameter", 18, "inches", "2026", "technical_specification", "vehicle", ["FIA_RULES"], "", 0, "static"),
    metric("braking_limit", "Published energy-recovery framework figure", 8.5, "MJ per lap", "2026", "regulatory_limit", "regulation", ["AMR26_ENGINEERING", "FIA_APRIL"], "Session/track rules apply. Not observed lap telemetry. Secondary detail only.", 1, "static"),
    metric("missing_component_carbon", "Component-specific emissions saving", None, "tCO2e", "2026", "unavailable", "component", ["AMR26_ENGINEERING"], "Not publicly reported in the reviewed material.", 2, "static"),
]


def src(id, title, kind, review, url=None, page=None, local=None, year=None, publisher=None, document=None):
    row = {"id": id, "title": title, "kind": kind, "review_status": review}
    if publisher:
        row["publisher"] = publisher
    if document:
        row["document"] = document
    if year is not None:
        row["year"] = year
    if page is not None:
        row["page"] = page
    if local:
        row["local_href"] = local
    if url:
        row["url"] = url
    return row


TEAM = "Aston Martin Aramco Formula One Team"
PDF = "https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2025.pdf"
PDF24 = "https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2024.pdf"


def esg(id, title, page, year=2025):
    base = PDF if year == 2025 else PDF24
    name = "esg-2025.pdf" if year == 2025 else "esg-2024.pdf"
    doc = "MakeAMark_ESG_Report_2025.pdf" if year == 2025 else None
    return src(
        id,
        title,
        "report" if id not in {"ESG25_P15", "ESG25_P27", "ESG25_P30", "ESG25_P31", "ESG25_P32", "ESG25_P83", "ESG25_P85"} else "esg_report",
        "supplied_primary_document_checked" if id not in {"ESG25_P15", "ESG25_P27", "ESG25_P30", "ESG25_P31", "ESG25_P32", "ESG25_P83", "ESG25_P85"} else "supplied_in_previous_content_pack",
        url=f"{base}#page={page}",
        page=page,
        local=f"/sources/{name}#page={page}",
        year=year,
        publisher=TEAM,
        document=doc,
    )


SOURCES = [
    src("AMR26_TEAM", "Aston Martin F1 — 2026 car", "official_team", "official_page_checked_2026_10_21", "https://www.astonmartinf1.com/en-GB/2026"),
    src("AMR26_ENGINEERING", "Aston Martin — AMR26 Engineering", "official_manufacturer", "official_page_checked_2026_10_21", "https://www.astonmartin.com/en-us/models/amr26"),
    src("HONDA_AMR26", "Honda — 2026 AMR26 and 2026 upgrades", "official_partner", "official_page_checked_2026_10_21", "https://global.honda/en/F1/machine/2026_AMR26/"),
    src("HONDA_PU", "Honda Racing — RA626H", "official_partner", "supplied_in_previous_content_pack", "https://honda.racing/f1/machines/pu-2026"),
    src("FIA_RULES", "FIA — 2026 regulatory changes", "regulator", "supplied_in_previous_content_pack", "https://www.fia.com/news/f1s-new-era-everything-you-need-know-about-how-fia-making-formula-1-more-competitive-more"),
    src("FIA_APRIL", "FIA — April 2026 energy-management refinements", "regulator", "supplied_in_previous_content_pack", "https://www.fia.com/news/refinements-2026-fia-formula-1-regulations-agreed-all-stakeholders"),
    src("FIA_FUEL", "FIA — 100% sustainable-fuel requirements", "regulator", "supplied_in_previous_content_pack", "https://www.fia.com/news/new-era-sustainable-fuel-fia-introduces-major-step-provide-certified-100-sustainable-fuel-all"),
    src("AMR25_TEAM", "Aston Martin F1 — AMR25 official technical specifications", "official_team", "supplied_in_previous_content_pack", "https://www.astonmartinf1.com/en-GB/AMR25"),
    src("AMR26_HUNGARY", "Aston Martin F1 — Hungary 2026 updates", "official_team", "official_page_checked_2026_10_21", "https://www.astonmartinf1.com/en-GB/races/2026-hungarian-gp"),
    src("F1_AMR26_ANALYSIS", "Formula 1 — Technical analysis AMR26", "technical_editorial", "supplied_in_previous_content_pack", "https://www.formula1.com/en/latest/article/tech-analysis-why-adrian-neweys-first-aston-martin-design-has-caused-a-stir.57Gu2EU7z7Bo6fWUF9qRwc"),
    src("F1_HUNGARY", "Formula 1 — July 2026 upgrades analysis", "technical_editorial", "unverified_url_do_not_use_in_primary_demo", "https://www.formula1.com/en/latest/article/a-closer-look-at-aston-martins-major-upgrades-and-the-overall-theme-they-are-chasing.6Ob4CsAvJA3H4ZoB7YYRlk.6Ob4CsAvJA3H4ZoB7YYRlk"),
    src("PIRELLI_F1", "Pirelli — Formula 1 tires and FSC natural rubber", "official_supplier", "supplied_in_previous_content_pack", "https://www.pirelli.com/tires/en-us/motorsport/car/formula-1"),
    esg("ESG25_P15", "Make A Mark ESG Report 2025 — targets", 15),
    esg("ESG25_P27", "Make A Mark ESG Report 2025 — lower-carbon fuel testing", 27),
    esg("ESG25_P30", "Make A Mark ESG Report 2025 — circularity methodology", 30),
    esg("ESG25_P31", "Make A Mark ESG Report 2025 — AMR25 material circularity", 31),
    esg("ESG25_P32", "Make A Mark ESG Report 2025 — carbon fibre recycling", 32),
    esg("ESG25_P83", "Make A Mark ESG Report 2025 — restated emissions table", 83),
    esg("ESG25_P85", "Make A Mark ESG Report 2025 — restatement and assurance", 85),
    src("F1_HONDA_SPEC2", "Formula 1 — 2026 Honda Spec 2 power unit update", "official_series_news", "unverified_url_do_not_use_in_primary_demo", "https://www.formula1.com/en/latest/article/honda-reveal-details-of-spec-2-power-unit-set-to-debut-at-dutch-grand-prix.laNvOgrm2aIDTL3SA0Xny.laNvOgrm2aIDTL3SA0Xny"),
    esg("ESG25_P19", "2025 footprint categories", 19),
    esg("ESG25_P24", "Sustainable aviation fuel", 24),
    esg("ESG25_P37", "Historical trackside energy", 37),
    esg("ESG25_P42", "Aleto leadership programme", 42),
    esg("ESG25_P45", "Accelerate Women", 45),
    esg("ESG25_P46", "AFBE transition event", 46),
    esg("ESG25_P47", "Paddle UK para-canoe engineering", 47),
    esg("ESG25_P48", "Neurodiversity employee group", 48),
    esg("ESG25_P51", "Racing Pride", 51),
    esg("ESG25_P55", "Gender pay gap", 55),
    esg("ESG25_P59", "Make A Mark Day attendance", 59),
    esg("ESG25_P61", "Make A Mark Day skills survey", 61),
    esg("ESG25_P67", "Aramco internships", 67),
    esg("ESG25_P68", "STEM Racing", 68),
    esg("ESG25_P72", "Charitable fundraising", 72),
    esg("ESG25_P75", "Aspiring Mechanics", 75),
    esg("ESG24_P56", "Veterans and TechVets", 56, 2024),
    esg("ESG24_P13", "ESG social reach", 13, 2024),
    src("MAKE_A_MARK", "Make A Mark", "official_website", "supplied_primary_document_checked", "https://www.astonmartinf1.com/en-GB/make-a-mark", year=2025, publisher=TEAM),
    src("AMF1_HOME", "AMF1 live website design inspection", "website_design_inspection", "supplied_primary_document_checked", "https://www.astonmartinf1.com/en-GB", year=2025, publisher=TEAM),
    src("PROPOSAL", "Supplied Make A Mark Live full proposal", "planning_assumptions", "supplied_primary_document_checked", year=2025, publisher=TEAM, local="/sources/full-proposal.md"),
    src("DEMO_MODEL", "Locally authored demonstration assumptions", "demo_assumptions", "illustrative_not_observed", year=2025, publisher=TEAM, local="/methodology", url="/methodology"),
]

BY_SOURCE = {row["id"]: row for row in SOURCES}


def links_for(source_ids):
    out = []
    for sid in source_ids:
        row = BY_SOURCE[sid]
        href = row.get("url") or row.get("local_href") or "/methodology"
        local = row.get("local_href")
        target = "_self" if href.startswith("/") else "_blank"
        out.append({
            "label": row["title"],
            "source_id": sid,
            "href": href,
            "local_href": local,
            "target": target,
            "rel": "noopener noreferrer",
        })
    return out


def question(qid, surface, text, paragraphs, source_ids, metric_ids=None, extra_actions=None):
    footer = source_ids[0]
    actions = [f"source_{footer}"]
    for extra in extra_actions or []:
        if extra not in actions:
            actions.append(extra)
    # Include a source action for each cited source so citations resolve.
    for sid in source_ids:
        action = f"source_{sid}"
        if action not in actions:
            actions.append(action)
    return {
        "id": qid,
        "surface": surface,
        "question": text,
        "response": {
            "paragraphs": paragraphs,
            "source_ids": source_ids,
            "metric_ids": metric_ids or [],
            "action_ids": actions,
            "footer_link_source_id": footer,
            "links": links_for(source_ids),
        },
        "followup_ids": [],
        "presentation": PRES,
    }


CAR_QUESTIONS = []


def add_car(component, n, text, paragraphs, sources, metrics=None):
    CAR_QUESTIONS.append(question(f"car_{component}_{n}", f"car:{component}", text, paragraphs, sources, metrics))


add_car("power_unit", 1, "Which engine powers the AMR26?", ["Honda RA626H, a 1.6-litre turbocharged V6 hybrid power unit. It replaced the Mercedes power unit used on the AMR25."], ["AMR26_ENGINEERING", "AMR25_TEAM"])
add_car("power_unit", 2, "Does the engine run entirely on electricity?", ["No. It has both a combustion engine and a powerful electric system. Aston Martin describes the 2026 power-unit concept as approximately a 50:50 combustion/electric power split, not a fully electric car."], ["AMR26_ENGINEERING"])
add_car("power_unit", 3, "Does sustainable fuel mean zero tailpipe emissions?", ["No. Combustion still releases CO₂. The sustainability claim concerns qualifying renewable or non-fossil carbon sources and the fuel’s lifecycle impact, not zero exhaust CO₂. The report does not provide AMR26 tailpipe or whole-car lifecycle emissions."], ["FIA_FUEL", "AMR26_ENGINEERING"])
add_car("fuel_system", 1, "What fuel does the AMR26 use?", ["Aramco ProForce+, the FIA-compliant 100% sustainable fuel supplied to Aston Martin Aramco for the 2026 season."], ["AMR26_ENGINEERING", "HONDA_AMR26"])
add_car("fuel_system", 2, "How is the fuel sustainable?", ["FIA rules require approved advanced sustainable feedstocks and greenhouse-gas standards. They can include non-food biomass, municipal waste, and qualifying renewable non-biological sources."], ["FIA_FUEL", "AMR26_ENGINEERING"])
add_car("fuel_system", 3, "What percentage less CO2 does ProForce+ produce?", ["The official car pages consulted do not disclose a verified AMR26-specific percentage lifecycle CO₂ reduction. Display “Not publicly disclosed” rather than an invented figure."], ["AMR26_ENGINEERING"])
add_car("chassis", 1, "What does 32% circularity mean?", ["The ESG report records 32% material circularity for the AMR25 using the sport’s circularity methodology, which considers material inflows and outflows across car development. It does not mean the chassis is 32% recycled carbon fibre."], ["ESG25_P31"])
add_car("chassis", 2, "How much carbon fibre did Aston Martin recycle?", ["Its 2025 Make A Mark report states 1.3 tonnes of carbon fibre were recycled during 2025, an operational recycling figure."], ["ESG25_P32"])
add_car("chassis", 3, "What is the AMR26 chassis recycled-content percentage?", ["A verified AMR26-specific recycled-carbon-fibre or chassis circularity figure was not found in the reviewed official sources. Mark it “Not reported.”"], ["ESG25_P31", "AMR26_ENGINEERING"])
add_car("active_aero", 1, "Does the AMR26 still have DRS?", ["No conventional rear-wing-only DRS. The 2026 car uses active front and rear aero surfaces, with Corner and Straight modes. Overtaking also uses a separate electrical Overtake Mode."], ["AMR26_ENGINEERING", "FIA_RULES"])
add_car("active_aero", 2, "How does active aerodynamics help efficiency?", ["It reduces aerodynamic drag on designated straights, lowering the energy needed to travel at speed, while Corner Mode restores downforce for grip. No AMR26-specific carbon-saving percentage is disclosed."], ["AMR26_ENGINEERING", "FIA_RULES"])
add_car("active_aero", 3, "Did the wings change during 2026?", ["Yes. The team reported revised front and rear wing-related parts in its major Hungarian GP upgrade package, aimed at front-end performance and rear drag/load balance."], ["AMR26_HUNGARY"])
add_car("floor_diffuser", 1, "Is the AMR26 floor the same as the AMR25?", ["No. The 2026 regulations replace the 2022–2025 deep Venturi tunnel approach with a flatter floor and a different diffuser arrangement."], ["AMR26_ENGINEERING"])
add_car("floor_diffuser", 2, "Why should I view the diffuser in 3D?", ["The underside is difficult to see in a top view. A 3D cutaway shows how the floor and diffuser guide airflow below and behind the car."], ["AMR26_ENGINEERING"])
add_car("floor_diffuser", 3, "What changed to the floor in 2026?", ["Aston Martin’s Hungarian GP package included revisions to the floor body, fences, edge and diffuser intended to increase floor load and support the overall aero package."], ["AMR26_HUNGARY", "HONDA_AMR26"])
add_car("energy_recovery", 1, "How is braking energy recovered?", ["The MGU-K converts mechanical energy into electricity, charges the energy store and deploys it for propulsion later."], ["AMR26_ENGINEERING"])
add_car("energy_recovery", 2, "How much electrical power can it produce?", ["The 2026 regulatory maximum is 350 kW, compared with 120 kW in the previous generation. Deployment is restricted according to FIA energy-management rules."], ["AMR26_ENGINEERING", "FIA_APRIL"])
add_car("energy_recovery", 3, "Where is the MGU-H?", ["There is no MGU-H on the 2026 AMR26. It was a feature of the older-generation hybrid rules and was removed for 2026."], ["AMR26_ENGINEERING", "FIA_RULES"])
add_car("cooling", 1, "Why are the sidepods shaped like this?", ["Sidepods house or feed cooling systems while shaping airflow to the floor and rear car. Aston Martin revised sidepod inlets and bodywork in its 2026 Hungarian upgrade package."], ["AMR26_HUNGARY", "F1_AMR26_ANALYSIS"])
add_car("cooling", 2, "Does more cooling always mean better performance?", ["No. Larger openings can improve cooling but may increase drag or disrupt downstream airflow. Engineers balance temperatures with aero needs."], ["AMR26_ENGINEERING"])
add_car("cooling", 3, "How much energy does the AMR26 cooling system save?", ["No verified AMR26-specific energy-saving value was found in the published sources reviewed."], ["AMR26_HUNGARY"])
add_car("brakes", 1, "How are the brakes different from ordinary cars?", ["Front brakes are hydraulic and rear braking uses brake-by-wire to balance friction braking with regenerative energy recovery."], ["AMR26_ENGINEERING"])
add_car("brakes", 2, "How much energy can the car harvest under braking?", ["Aston Martin’s engineering overview describes up to 8.5 MJ per lap under the 2026 framework; track/session energy limits and adjustments must be applied separately. This is a rules-related limit, not a recorded AMR26 lap measurement."], ["AMR26_ENGINEERING", "FIA_APRIL"])
add_car("brakes", 3, "Why do brake ducts matter?", ["Brake ducts must remove heat while minimizing aerodynamic drag. They form part of the integrated cooling and aerodynamic design."], ["AMR26_ENGINEERING"])
add_car("gearbox", 1, "Who makes the AMR26 gearbox?", ["Aston Martin developed the eight-speed semi-automatic gearbox and hydraulics in-house at its AMR Technology Campus; the AMR25 used a Mercedes-supplied gearbox."], ["AMR26_ENGINEERING", "AMR25_TEAM"])
add_car("gearbox", 2, "Why did Aston Martin develop its own gearbox?", ["In-house development gives the works team greater freedom to integrate the transmission with the Honda power unit, suspension, cooling, weight distribution and aero layout."], ["AMR26_ENGINEERING", "AMR26_TEAM"])
add_car("gearbox", 3, "Does the gearbox reduce carbon emissions?", ["The reviewed car technical sources do not quantify emissions savings caused by the new gearbox. Present its engineering advantages without claiming a measured carbon benefit."], ["AMR26_ENGINEERING"])
add_car("suspension", 1, "Why is suspension an aerodynamic part?", ["Its geometry affects ride height, tire contact and airflow near the wheels and rear bodywork."], ["AMR26_ENGINEERING"])
add_car("suspension", 2, "What is unusual about Aston Martin’s 2026 rear suspension?", ["Formula 1 technical analysis describes unusually high-mounted rear upper arms, intended to give the diffuser exit more clearance and influence airflow. This is an observed technical analysis, not a measured efficiency result."], ["F1_AMR26_ANALYSIS"])
add_car("suspension", 3, "Was suspension upgraded in Hungary?", ["Yes. Aston Martin documented rear-suspension and rear-corner refinements associated with changes to the rear floor in its major Hungary package."], ["AMR26_HUNGARY"])
add_car("tires", 1, "Does Aston Martin use recycled-rubber tires?", ["The reviewed sources do not support claiming recycled rubber in the AMR26 tyres. Pirelli does document FSC-certified natural rubber in Formula 1 tyres since 2024."], ["PIRELLI_F1"])
add_car("tires", 2, "What changed in 2026 tires?", ["The 2026 rules retain 18-inch wheels but call for narrower front and rear tyres than the previous generation."], ["FIA_RULES"])
add_car("tires", 3, "How can tire choice impact sustainability?", ["Tyre choices influence strategy, grip and wear. Any carbon-saving claim for specific compounds or races needs tyre lifecycle data that has not been established for this prototype."], ["PIRELLI_F1"])

PEOPLE_SPEC = [
    ("aleto", "Alex", "University student", "Aleto leadership programme", "Aleto Foundation", "BELONG", ["aleto_cohort", "aleto_network", "aleto_leadership"], ["ESG25_P42"], ["leadership", "university", "apply"], "Mentoring and confidence",
     "Can mentoring help me find a route into motorsport?", ["A nine-month mentoring programme connects university students with members of the team."], ["aleto_cohort"],
     ["The detailed 2025 report describes 14 students. Survey respondents reported stronger networks (93%) and growth in leadership, confidence and presentations (90%). These are self-reported outcomes, not job-placement rates."], ["aleto_cohort", "aleto_network", "aleto_leadership"], "person_techvets"),
    ("accelerate-women", "Maya", "Early-career engineer", "Accelerate Women", "Arm", "BELONG", ["accelerate_continue"], ["ESG25_P45"], ["leadership", "working", "learn"], "Engineering careers and mentorship",
     "How can mentorship support an engineering career?", ["A six-month pilot linked women mentors at Arm with women mentees at AMF1."], ["accelerate_continue"],
     ["The programme page reports that 71% of mentors and mentees were highly likely to continue the relationship. This statistic describes relationship continuation, not promotion or recruitment."], ["accelerate_continue"], None),
    ("racing-pride", "Jamie", "Motorsport fan and marshal", "Racing Pride", "Racing Pride", "BELONG", [], ["ESG25_P51"], ["community", "fan", "volunteer"], "Belonging at the track",
     "What does belonging at the track look like?", ["Racing Pride and AMF1 collaborate on inclusion, visibility and welcoming motorsport communities."], [],
     ["The 2025 report describes campus and trackside activities, including recognition of LGBTQ+ marshals and volunteers. It does not provide a longitudinal participation outcome for this demo."], [], None),
    ("paddle-uk", "Sam", "Para-sport enthusiast", "Para-canoe engineering", "Paddle UK", "BELONG", ["paddle_prototypes"], ["ESG25_P47"], ["building", "creative", "learn"], "Engineering for accessibility",
     "How can F1 engineering help another sport?", ["Composite design expertise supported a bespoke para-canoe seat with Paddle UK and Darkside Canoes."], ["paddle_prototypes"],
     ["The report describes three prototypes over nine months and improvements in stability and support. No numeric performance improvement is published here."], ["paddle_prototypes"], None),
    ("techvets", "Jordan", "Veteran exploring technology", "Veterans in technology", "TechVets", "BELONG", [], ["ESG24_P56"], ["tech", "working", "apply"], "Skills beyond the service",
     "How do military skills translate into technology?", ["The 2024 report describes support for veterans moving into technology and motorsport."], [],
     ["TechVets provides skills, connections and career support. The report includes a trackside IT career story; it does not establish a placement rate for the whole programme."], [], None),
    ("mechanics", "Riley", "Aspiring mechanic", "Aspiring Mechanics", "Valvoline", "COMMUNITY", [], ["ESG25_P75"], ["building", "school", "apply"], "A practical route into motorsport",
     "Can a practical learning route lead towards motorsport?", ["The Aspiring Mechanics programme supports hands-on technical learning and routes into motorsport."], [],
     ["The report follows a real student’s progression through vocational levels. This is an individual published story, not evidence that every participant progresses at the same rate."], [], None),
    ("make-a-mark-day", "Casey", "Student exploring STEM", "Make A Mark Day", "Cognizant and programme partners", "COMMUNITY", ["mam_students", "mam_schools", "mam_ai_gap"], ["ESG25_P59"], ["tech", "school", "event"], "Discover the work behind the race",
     "What could I learn at Make A Mark Day?", ["Make A Mark Day brings students into the campus for workshops and career exploration."], ["mam_students"],
     ["In 2025, 257 students attended across two days, with 14 schools and community groups represented. A separate initial survey found 68% were unclear about skills needed for AI work."], ["mam_students", "mam_schools", "mam_ai_gap"], None),
    ("aramco-intern", "Noor", "Sustainability intern", "Aramco student internships", "Aramco", "COMMUNITY", ["interns_2025", "circularity_2025"], ["ESG25_P67"], ["planet", "university", "apply"], "Learning through real projects",
     "What does a sustainability internship involve?", ["Aramco-sponsored engineering students contributed to sustainability projects during a summer placement."], ["interns_2025"],
     ["The 2025 internship page describes eight students. Work included the circularity metric project alongside career-readiness workshops. Circularity measures belong to the AMR25 methodology, not an individual intern’s personal impact."], ["interns_2025", "circularity_2025"], None),
    ("stem-racing", "Taylor", "STEM Racing competitor", "Unearth Your Greatness", "Maaden", "COMMUNITY", ["stem_students", "stem_countries", "stem_target"], ["ESG25_P68"], ["building", "competitive", "school"], "From a model car to a wider ambition",
     "How does STEM Racing connect to the team?", ["STEM Racing combines engineering, teamwork and competition."], ["stem_students"],
     ["The report describes engagement with more than 600 students from 35 countries. Reaching more than 100,000 students over three years is an ambition, not a completed outcome."], ["stem_students", "stem_countries", "stem_target"], None),
    ("afbe", "Morgan", "Engineering student", "AFBE-UK transition event", "AFBE-UK", "BELONG", ["afbe_students", "afbe_helpful"], ["ESG25_P46"], ["building", "university", "apply"], "Making engineering pathways visible",
     "What support helps students make the transition into engineering?", ["The transition event brought engineering students together with staff, graduates and interns."], ["afbe_students"],
     ["Sixteen students participated, and the report says 100% of attendees found the event helpful. The measure is event feedback, not a hiring probability."], ["afbe_students", "afbe_helpful"], None),
    ("neurodiversity", "Avery", "Engineer exploring inclusive teamwork", "Neurodiversity group", "ADHD Foundation", "BELONG", ["neuro_members"], ["ESG25_P48"], ["creative", "working", "learn"], "Different ways of thinking",
     "How can engineering teams support different ways of thinking?", ["The employee resource group supports connection, awareness and learning about neurodiversity."], ["neuro_members"],
     ["Around 35 colleagues had engaged with the group in its first year. This is a published aggregate, not an invitation to identify colleagues or infer anyone’s health information."], ["neuro_members"], None),
    ("fundraising", "Charlie", "Community fundraiser", "Community fundraising", "Community charity partners", "COMMUNITY", ["fundraising_2025"], ["ESG25_P72"], ["community", "volunteer", "supportive"], "Supporting the communities around the team",
     "How does the team support local charities?", ["Fundraising and colleague match funding support a range of charitable causes."], ["fundraising_2025"],
     ["The report records £140,000 raised during 2025. That is a reported historical total; prototype ticket reservations and button clicks do not add real charitable funds."], ["fundraising_2025"], None),
]

ACTION_COPY = "Explore the official story and current programme information. Opportunities, eligibility and application windows may change. You can save interest in this demo, but it does not submit an application."
TRUST_COPY = "I’m a fictional composite created for this demonstration. The programme and cited report are real. My name, portrait and introduction are illustrative, and my answers are prewritten."

PERSON_QUESTIONS = []
PEOPLE = []
for spec in PEOPLE_SPEC:
    (pid, name, role, programme, partner, pillar, metric_ids, source_ids, tags, article_title,
     intro_q, intro_p, intro_m, results_p, results_m, _bridge) = spec
    primary = source_ids[0]
    PERSON_QUESTIONS.append(question(f"person_{pid}_intro", f"person:{pid}", intro_q, intro_p, source_ids, intro_m))
    result_sources = source_ids if pid != "make-a-mark-day" else ["ESG25_P59", "ESG25_P61"]
    PERSON_QUESTIONS.append(question(f"person_{pid}_results", f"person:{pid}", "What difference has the programme made?", results_p, result_sources, results_m))
    PERSON_QUESTIONS.append(question(
        f"person_{pid}_action", f"person:{pid}", "How can I get involved?", [ACTION_COPY],
        source_ids + ["MAKE_A_MARK"], [], ["save_interest"],
    ))
    PERSON_QUESTIONS.append(question(f"person_{pid}_trust", f"person:{pid}", "Are you a real participant?", [TRUST_COPY], source_ids))
    PEOPLE.append({
        "id": pid,
        "name": name,
        "role": role,
        "programme_id": pid,
        "programme_name": programme,
        "partner_name": partner,
        "pillar": pillar,
        "is_composite": True,
        "approval_status": "demo_editorial_only_not_partner_approved",
        "portrait": {
            "kind": "illustration",
            "asset_key": f"persona_{pid}",
            "brief": f"Editorial illustration for {role}; fictional person; no inference of sensitive traits from appearance.",
        },
        "intro": f"Hi, I’m {name}, a fictional composite guide to {programme}. Choose a question to explore the real programme and its published story.",
        "question_ids": [f"person_{pid}_intro", f"person_{pid}_results", f"person_{pid}_action", f"person_{pid}_trust"],
        "metric_ids": metric_ids,
        "source_ids": source_ids,
        "tags": tags,
        "article": {
            "title": article_title,
            "paragraphs": intro_p + results_p,
            "source_id": primary,
            "type": "authored_summary_of_published_report",
            "not_verbatim_original_article": True,
        },
        "action_ids": ["save_interest", "share_page", f"source_{primary}"],
    })

GUIDE = [
    question("guide_car", "guide", "Show me how the car works.", ["Select a square on the car to open its component. You can explore the engineering, see the evidence and compare the loaded generations."], ["AMR26_ENGINEERING"], [], ["component_power_unit"]),
    question("guide_engine", "guide", "Why did the engine change?", ["The AMR26 combines Honda’s 1.6-litre V6 with a stronger electrical system. The loaded comparison shows permitted MGU-K peak power rising from 120 kW to 350 kW. These are limits, not live measurements."], ["AMR26_ENGINEERING"], [], ["component_power_unit"]),
    question("guide_match", "guide", "Match me with a story.", ["Choose your interests and what you would like to do next. I’ll suggest a programme using fixed matching rules; you can explore any story."], ["MAKE_A_MARK"], [], ["match"]),
    question("guide_impact", "guide", "What impact has the team reported?", ["Explore annual environmental reporting and published programme outcomes. Every figure keeps its year, scope and source; the race replay is a separate demonstration."], ["ESG25_P83", "ESG25_P59"], [], ["impact"]),
    question("guide_fuel", "guide", "Does sustainable fuel mean zero emissions?", ["No. Combustion still produces exhaust emissions. Sustainable-fuel requirements concern qualifying inputs and lifecycle criteria. No AMR26-specific lifecycle saving is loaded."], ["FIA_FUEL", "AMR26_ENGINEERING"], [], ["component_fuel_system"]),
    question("guide_people", "guide", "Meet the minds behind the machine.", ["Explore how engineering expertise connects with accessibility, mentoring and future talent. The story guides are clearly labelled fictional composites."], ["ESG25_P47", "ESG25_P42"], [], ["person_paddle-uk"]),
    question("guide_race", "guide", "Show this weekend’s impact.", ["This screen replays illustrative weekend activity. Historical report figures retain their original periods and are never presented as today’s live measurements."], ["DEMO_MODEL", "ESG25_P37"], [], ["race"]),
    question("guide_simulate", "guide", "Where could an intervention matter most?", ["Try a transparent planning model. Change assumptions and compare conditional ranges; the outputs are scenarios, not measured savings or forecasts."], ["ESG25_P19", "DEMO_MODEL"], [], ["simulate"]),
    question("guide_partners", "guide", "How do partners use this?", ["Partners can inspect reported programme outcomes, explore assumptions and export a source-linked demonstration report."], ["ESG25_P42", "PROPOSAL"], [], ["partners"]),
    question("guide_trust", "guide", "Where does the AI do the work?", ["The proposed production engine would extract, classify and review incoming records, then explain approved data. Here, the full sequence is demonstrated with fixed fixtures and prewritten responses."], ["PROPOSAL"], [], ["engine"]),
]

PARTNER_Q = [
    question("partner_overview", "partner", "What did Make A Mark Day achieve?", ["The 2025 report records 257 students across two days and 14 schools and community groups represented. Attendance and initial skills awareness are separate measures."], ["ESG25_P59", "ESG25_P61"], ["mam_students", "mam_schools", "mam_ai_gap"], ["export_report"]),
    question("partner_aleto", "partner", "What can we evidence for Aleto?", ["Use the detailed programme cohort count and the separate survey outcomes. The cohort count differs between report sections; this demo retains 14 from the programme page with a visible note."], ["ESG25_P42"], ["aleto_cohort", "aleto_network", "aleto_leadership"], ["export_report"]),
    question("partner_carbon", "partner", "Why are the carbon totals different?", ["The report provides totals before and after SAF certificates, and restates earlier years. Compare the same accounting basis across years rather than mixing versions."], ["ESG25_P83", "ESG25_P85"], ["footprint_2025", "footprint_2025_after_safc"], ["export_report"]),
    question("partner_gaps", "partner", "Which outcomes are missing?", ["Long-term career progression, attributable employment outcomes and some programme cost inputs are not loaded. Show missing evidence as a data gap, not zero or a fabricated estimate."], ["PROPOSAL"], [], ["export_report"]),
    question("partner_cost", "partner", "What is the cost per student?", ["Verified programme expenditure is not loaded, so actual cost per participant cannot be calculated. The simulator permits an explicitly illustrative budget and shows its arithmetic."], ["DEMO_MODEL"], [], ["export_report"]),
    question("partner_renewal", "partner", "What can go into a partner review?", ["Include the programme scope, reported activity, survey measures, source pages, data limitations and any separately labelled scenario. This supports a discussion; it does not prove causal impact or guaranteed renewal."], ["PROPOSAL", "ESG25_P42"], [], ["export_report"]),
    question("partner_privacy", "partner", "Can I view individual employee information?", ["This prototype contains only published aggregate reporting and fictional demonstration records. It contains no individual employee data. Its role selector is a demonstration control, not authentication."], ["ESG25_P55"], [], ["export_report"]),
    question("partner_business", "partner", "How does the business case work?", ["The supplied proposal models partner activations, paid experiences, merchandise contribution, reporting savings and a licensing royalty. These are planning assumptions and remain separate from historical ESG facts."], ["PROPOSAL"], [], ["business"]),
]

QUESTIONS = CAR_QUESTIONS + PERSON_QUESTIONS + GUIDE + PARTNER_Q


def spot(sid, x, y):
    return {
        "id": sid,
        "x": x,
        "y": y,
        "visual_size_px": 18,
        "hit_size_px": 44,
        "coordinate_space": "normalized_image_content_box",
        "calibration_status": "starting_coordinates_adjust_to_final_car_art",
    }


def anim(extra=None):
    base = {
        "play_pause": True,
        "reset": True,
        "reduced_motion_fallback": "static_explanatory_frame",
        "illustrative_not_telemetry": True,
    }
    if extra:
        base.update(extra)
    return base


def component(id, label, hotspot, view, description, connection, connection_type, source_ids, metrics, spots, animation, variants, bridge, controls=None):
    return {
        "id": id,
        "label": label,
        "aerial_hotspot": hotspot,
        "preferred_view": view,
        "description": description,
        "sustainability_connection": connection,
        "connection_type": connection_type,
        "source_ids": source_ids,
        "question_ids": [f"car_{id}_1", f"car_{id}_2", f"car_{id}_3"],
        "metric_ids": metrics,
        "hotspots": spots,
        "animation": animation,
        "generation_ids": ["2025", "2026"],
        "generation_missing_copy": "No comparable specification loaded for this component and year.",
        "missing_metric_id": "missing_component_carbon",
        "open_action_id": f"component_{id}",
        "variants": variants,
        "bridge": {
            "label": "Meet the minds behind the machine",
            "action_id": bridge,
            "relationship": "Thematic programme connection, not a claim that this fictional guide designed the component.",
        },
        "animation_controls": controls or anim(),
    }


def variant(year, model, description, sources, metrics, connection=None, state="historical"):
    row = {"id": year, "model": model, "description": description, "metric_ids": metrics, "source_ids": sources, "visual_state": state}
    if connection:
        row["sustainability_connection"] = connection
    return row


COMPONENTS = [
    component("power_unit", "Power Unit / Engine", "Behind cockpit, under engine cover", "2D highlighted silhouette + optional exploded engine render",
              "The AMR26 uses Honda’s RA626H power unit: a 1.6 L turbocharged V6 with a kinetic energy recovery system, battery and control electronics.",
              "Aramco ProForce+ 100% sustainable fuel is developed alongside the Honda power unit; hybrid electrification is much greater than the previous generation.",
              "documented_current_car", ["AMR26_ENGINEERING", "HONDA_PU", "HONDA_AMR26", "ESG25_P27"], ["engine_displacement_l", "mgu_k_2026"],
              [spot("power_unit_0", 0.5, 0.65)], "hybrid_energy_flow",
              [variant("2025", "AMR25", "The AMR25 used a Mercedes-AMG 1.6-litre V6 hybrid power unit. Compare its supplier and energy-recovery architecture with the Honda-powered AMR26.", ["AMR25_TEAM"], ["mgu_k_2025"]),
               variant("2026", "AMR26", "The AMR26 uses Honda’s RA626H power unit: a 1.6 L turbocharged V6 with a kinetic energy recovery system, battery and control electronics.", ["AMR26_ENGINEERING", "HONDA_PU", "HONDA_AMR26", "ESG25_P27"], ["engine_displacement_l", "mgu_k_2026"], "Aramco ProForce+ 100% sustainable fuel is developed alongside the Honda power unit; hybrid electrification is much greater than the previous generation.", "current")],
              "person_techvets"),
    component("fuel_system", "Fuel System / Sustainable Fuel", "Fuel cell behind driver; use x-ray location overlay", "2D overlay + fuel flow visual",
              "The AMR26 uses Aramco ProForce+; its fuel and the Honda RA626H were developed as an integrated system.",
              "Aramco ProForce+ is FIA-compliant 100% sustainable fuel based on advanced sustainable components such as non-food biomass, qualifying waste or renewable feedstocks.",
              "documented_current_car", ["AMR26_ENGINEERING", "HONDA_AMR26", "FIA_FUEL"], ["fuel_2026"],
              [spot("fuel_system_0", 0.5, 0.48)], "fuel_flow",
              [variant("2025", "AMR25", "The AMR25 predates the 2026 sustainable-fuel framework. A directly comparable AMR25 fuel lifecycle saving is not loaded.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "The AMR26 uses Aramco ProForce+; its fuel and the Honda RA626H were developed as an integrated system.", ["AMR26_ENGINEERING", "HONDA_AMR26", "FIA_FUEL"], ["fuel_2026"], "Aramco ProForce+ is FIA-compliant 100% sustainable fuel based on advanced sustainable components such as non-food biomass, qualifying waste or renewable feedstocks.", "current")],
              "person_aramco-intern"),
    component("chassis", "Carbon-Fiber Chassis", "Driver survival cell in center of vehicle", "2D external outline + structural close-up",
              "The chassis is the central safety structure, built with advanced lightweight composite construction; engineering aims to maximize strength and packaging efficiency.",
              "Aston Martin participates in the FIA circularity methodology. Its 2025 ESG report measured 32% material circularity for the AMR25 and 1.3 tonnes of carbon fibre recycled across operations in 2025; neither figure is a recycled-content percentage for the AMR26 chassis.",
              "documented_prior_car_or_team", ["ESG25_P30", "ESG25_P31", "ESG25_P32", "AMR25_TEAM"], ["circularity_2025", "carbon_fibre_2025"],
              [spot("chassis_0", 0.5, 0.37)], "layer_separation",
              [variant("2025", "AMR25", "The reported 32% circularity applies to AMR25 material flows under the sport’s methodology, not the recycled-carbon-fibre percentage of its survival cell.", ["ESG25_P31"], ["circularity_2025"]),
               variant("2026", "AMR26", "The chassis is the central safety structure, built with advanced lightweight composite construction; engineering aims to maximize strength and packaging efficiency.", ["ESG25_P30", "ESG25_P31", "ESG25_P32", "AMR25_TEAM"], ["circularity_2025", "carbon_fibre_2025"], "Aston Martin participates in the FIA circularity methodology. Its 2025 ESG report measured 32% material circularity for the AMR25 and 1.3 tonnes of carbon fibre recycled across operations in 2025; neither figure is a recycled-content percentage for the AMR26 chassis.", "current")],
              "person_paddle-uk"),
    component("active_aero", "Front & Rear Wings / Active Aero", "Front nose tip and rear of car", "2D, with flap-angle animation",
              "The AMR26 has movable front and rear wing surfaces that change between Corner Mode (greater downforce) and Straight Mode (reduced drag).",
              "Lower drag on straights is part of the 2026 energy-management design. This is a technical efficiency connection, not a published component-level emissions saving.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "FIA_RULES", "AMR26_HUNGARY"], [],
              [spot("active_aero_0", 0.5, 0.1), spot("active_aero_1", 0.5, 0.89)], "wing_mode_toggle",
              [variant("2025", "AMR25", "The previous generation used conventional rear-wing DRS. The loaded comparison describes the transition to active front and rear aero in 2026.", ["AMR25_TEAM", "AMR26_ENGINEERING"], []),
               variant("2026", "AMR26", "The AMR26 has movable front and rear wing surfaces that change between Corner Mode (greater downforce) and Straight Mode (reduced drag).", ["AMR26_ENGINEERING", "FIA_RULES", "AMR26_HUNGARY"], [], "Lower drag on straights is part of the 2026 energy-management design. This is a technical efficiency connection, not a published component-level emissions saving.", "current")],
              "person_stem-racing", anim({"states": ["Corner Mode", "Straight Mode"]})),
    component("floor_diffuser", "Floor & Diffuser", "Under chassis, mainly rear floor and diffuser exit", "3D underside strongly preferred",
              "The AMR26 uses a revised, flatter floor concept with a step and rear diffuser; this differs from the deep Venturi tunnel floors of 2022–2025.",
              "Underfloor airflow and drag management improve aerodynamic efficiency; no independently reported AMR26 floor-specific emissions number is available.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "HONDA_AMR26", "AMR26_HUNGARY"], [],
              [spot("floor_diffuser_0", 0.64, 0.72)], "underfloor_airflow",
              [variant("2025", "AMR25", "The 2025 car belonged to the 2022–2025 Venturi-tunnel regulation generation. The 2026 source describes a changed floor and diffuser arrangement.", ["AMR26_ENGINEERING"], []),
               variant("2026", "AMR26", "The AMR26 uses a revised, flatter floor concept with a step and rear diffuser; this differs from the deep Venturi tunnel floors of 2022–2025.", ["AMR26_ENGINEERING", "HONDA_AMR26", "AMR26_HUNGARY"], [], "Underfloor airflow and drag management improve aerodynamic efficiency; no independently reported AMR26 floor-specific emissions number is available.", "current")],
              "person_stem-racing"),
    component("energy_recovery", "MGU-K / Energy Recovery / Battery", "Power unit/battery inside chassis, rear-axle connection", "2D x-ray overlay + regenerative-braking animation",
              "The MGU-K recovers kinetic energy and can return electric power to the drivetrain. 2026 regulations raised its peak power allowance from 120 kW to 350 kW and eliminated MGU-H.",
              "Recovering braking energy improves powertrain energy use compared with relying exclusively on friction brakes. This 350 kW is a regulatory peak, not proof of continuous deployment.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "FIA_RULES", "FIA_APRIL"], ["mgu_k_2026"],
              [spot("energy_recovery_0", 0.43, 0.56)], "recover_store_deploy",
              [variant("2025", "AMR25", "The previous-generation power unit included MGU-K and MGU-H. Its permitted MGU-K peak power was 120 kW.", ["AMR25_TEAM", "AMR26_ENGINEERING"], ["mgu_k_2025"]),
               variant("2026", "AMR26", "The MGU-K recovers kinetic energy and can return electric power to the drivetrain. 2026 regulations raised its peak power allowance from 120 kW to 350 kW and eliminated MGU-H.", ["AMR26_ENGINEERING", "FIA_RULES", "FIA_APRIL"], ["mgu_k_2026"], "Recovering braking energy improves powertrain energy use compared with relying exclusively on friction brakes. This 350 kW is a regulatory peak, not proof of continuous deployment.", "current")],
              "person_make-a-mark-day", anim({"states": ["Recover", "Store", "Deploy"]})),
    component("cooling", "Cooling / Sidepods", "Cooling inlets at either side of driver; heat exchangers within bodywork", "2D highlighted inlets + optional airflow cutaway",
              "AMR26 sidepod inlets, engine-cover surfaces and cooling louvres manage heat rejection and airflow around the rear of the car.",
              "The engineering trade-off is cooling versus drag and bodywork packaging. The report does not provide a cooling-system-specific carbon savings percentage.",
              "documented_current_car_technical", ["AMR26_HUNGARY", "F1_AMR26_ANALYSIS", "AMR26_ENGINEERING"], [],
              [spot("cooling_0", 0.65, 0.5)], "cooling_airflow",
              [variant("2025", "AMR25", "A directly comparable AMR25 cooling specification or quantified cooling-efficiency result is not loaded.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "AMR26 sidepod inlets, engine-cover surfaces and cooling louvres manage heat rejection and airflow around the rear of the car.", ["AMR26_HUNGARY", "F1_AMR26_ANALYSIS", "AMR26_ENGINEERING"], [], "The engineering trade-off is cooling versus drag and bodywork packaging. The report does not provide a cooling-system-specific carbon savings percentage.", "current")],
              "person_afbe"),
    component("brakes", "Brake System", "Wheel hubs and front/rear corners", "2D hotspots front and rear + optional cutaway",
              "The AMR26 integrates conventional friction braking with regenerative braking; rear brakes use brake-by-wire, while front brakes are hydraulic.",
              "Braking can recover energy through the MGU-K, reducing energy otherwise dissipated as heat. Front/rear brake ducts balance cooling and aerodynamic drag.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "AMR26_HUNGARY"], ["braking_limit"],
              [spot("brakes_0", 0.27, 0.27), spot("brakes_1", 0.27, 0.78)], "friction_regen_blend",
              [variant("2025", "AMR25", "The AMR25 specification lists carbon discs and pads, Brembo calipers and in-house brake-by-wire. A comparable measured braking-energy result is not loaded.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "The AMR26 integrates conventional friction braking with regenerative braking; rear brakes use brake-by-wire, while front brakes are hydraulic.", ["AMR26_ENGINEERING", "AMR26_HUNGARY"], ["braking_limit"], "Braking can recover energy through the MGU-K, reducing energy otherwise dissipated as heat. Front/rear brake ducts balance cooling and aerodynamic drag.", "current")],
              "person_mechanics"),
    component("gearbox", "Transmission / Gearbox", "Behind power unit near rear axle", "2D highlighted rear compartment + internal exploded render",
              "The AMR26 uses an eight-speed semi-automatic transmission designed in-house by Aston Martin, replacing its previous external Mercedes gearbox supply.",
              "Efficient integration with motor torque, power unit, cooling and aerodynamics matters; an AMR26 gearbox-specific lifecycle emissions reduction has not been reported.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "AMR25_TEAM"], ["gears"],
              [spot("gearbox_0", 0.5, 0.79)], "gear_selector",
              [variant("2025", "AMR25", "The AMR25 used a Mercedes-supplied eight-speed semi-automatic gearbox.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "The AMR26 uses an eight-speed semi-automatic transmission designed in-house by Aston Martin, replacing its previous external Mercedes gearbox supply.", ["AMR26_ENGINEERING", "AMR25_TEAM"], ["gears"], "Efficient integration with motor torque, power unit, cooling and aerodynamics matters; an AMR26 gearbox-specific lifecycle emissions reduction has not been reported.", "current")],
              "person_mechanics", anim({"states": ["1", "2", "3", "4", "5", "6", "7", "8"]})),
    component("suspension", "Front & Rear Suspension", "Wishbones beside each wheel", "2D mechanical hotspot + optional 3D cutaway",
              "AMR26 suspension keeps tyres in contact with the track and stabilizes ride height. Formula 1’s technical analysis identifies notable pushrod arrangements and high rear wishbone mounting.",
              "Suspension helps maintain an efficient aerodynamic platform, but the team has not published suspension-specific energy or carbon reductions.",
              "documented_current_car_technical", ["AMR26_ENGINEERING", "F1_AMR26_ANALYSIS", "AMR26_HUNGARY"], [],
              [spot("suspension_0", 0.38, 0.25), spot("suspension_1", 0.62, 0.78)], "wheel_travel",
              [variant("2025", "AMR25", "A like-for-like suspension-performance comparison is not loaded. Explore the current engineering explanation without assigning an invented improvement percentage.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "AMR26 suspension keeps tyres in contact with the track and stabilizes ride height. Formula 1’s technical analysis identifies notable pushrod arrangements and high rear wishbone mounting.", ["AMR26_ENGINEERING", "F1_AMR26_ANALYSIS", "AMR26_HUNGARY"], [], "Suspension helps maintain an efficient aerodynamic platform, but the team has not published suspension-specific energy or carbon reductions.", "current")],
              "person_afbe"),
    component("tires", "Tires / Wheels", "Four wheel positions", "2D highlighted wheels",
              "Formula 1 continues with 18-inch wheel diameter in 2026, with narrower tyre dimensions than the prior rules. Pirelli supplies Formula 1 tyres.",
              "Pirelli says F1 tyres have used FSC-certified natural rubber since 2024. The reviewed evidence does NOT establish recycled rubber used in a specific Aston Martin tire or a measured AMR26 tire carbon saving.",
              "verified_supplier_general_not_team_specific", ["FIA_RULES", "PIRELLI_F1"], ["wheel_size"],
              [spot("tires_0", 0.23, 0.27), spot("tires_1", 0.77, 0.27), spot("tires_2", 0.23, 0.78), spot("tires_3", 0.77, 0.78)], "wheel_rotation",
              [variant("2025", "AMR25", "The AMR25 specification lists Pirelli P Zero tyres and BBS 18-inch wheels. Do not infer a tyre-specific carbon reduction.", ["AMR25_TEAM"], []),
               variant("2026", "AMR26", "Formula 1 continues with 18-inch wheel diameter in 2026, with narrower tyre dimensions than the prior rules. Pirelli supplies Formula 1 tyres.", ["FIA_RULES", "PIRELLI_F1"], ["wheel_size"], "Pirelli says F1 tyres have used FSC-certified natural rubber since 2024. The reviewed evidence does NOT establish recycled rubber used in a specific Aston Martin tire or a measured AMR26 tire carbon saving.", "current")],
              "person_aramco-intern"),
]


def nav(id, path):
    return {"id": id, "type": "navigate", "path": path}


ACTIONS = [
    nav("home", "/"),
    nav("car", "/car"),
    nav("people", "/people"),
    nav("partners", "/partners"),
    nav("impact", "/impact"),
    nav("race", "/race"),
    nav("evolution", "/car/evolution"),
    nav("match", "/match"),
    nav("simulate", "/simulate"),
    nav("engine", "/engine"),
    nav("booth", "/booth"),
    nav("experiences", "/experiences"),
    nav("business", "/partners/business-case"),
]
for row in SOURCES:
    ACTIONS.append({"id": f"source_{row['id']}", "type": "open_source", "source_id": row["id"]})
ACTIONS += [
    {"id": "reset_demo", "type": "reset_demo", "confirmation": "Reset this browser’s demonstration session?"},
    {"id": "share_page", "type": "share_or_copy", "message": "Make your mark. Explore this story.", "fallback": "copy_url"},
    {"id": "save_interest", "type": "local_confirmation", "title": "Interest saved in this demo", "body": "Nothing was submitted. Use the official programme link to check current opportunities.", "event_type": "demo_interest_saved"},
    {"id": "reserve_ticket", "type": "local_reservation", "title": "Demo reservation created", "body": "No payment taken. This is a prototype ticket.", "event_type": "demo_reservation_created"},
    {"id": "export_report", "type": "download_report", "format": "print_html", "title": "Download impact report"},
    {"id": "run_fixture", "type": "run_fixture_pipeline", "fixture_id": "energy_fixture_001"},
    {"id": "approve_fixture", "type": "approve_fixture", "fixture_id": "energy_fixture_001"},
    {"id": "reject_fixture", "type": "reject_fixture", "fixture_id": "energy_fixture_001"},
    {"id": "play_game", "type": "start_reaction_game"},
    {"id": "claim_stamp", "type": "claim_local_stamp"},
    {"id": "pause_feed", "type": "toggle_replay"},
    {"id": "replay_feed", "type": "restart_replay"},
]
for comp in COMPONENTS:
    ACTIONS.append(nav(f"component_{comp['id']}", f"/car/{comp['id']}"))
for person in PEOPLE:
    ACTIONS.append(nav(f"person_{person['id']}", f"/people/{person['id']}"))
ACTIONS += [
    nav("campaign_ig-car-engine", "/car/power_unit"),
    nav("campaign_ig-people-mamw", "/people"),
    nav("campaign_li-partners-aleto", "/partners?programme=aleto"),
    nav("campaign_ig-race-austin", "/race"),
    nav("partner_page_programmes", "/partners/programmes"),
    nav("partner_page_simulate", "/partners/simulate"),
    nav("partner_page_reports", "/partners/reports"),
    nav("partner_page_gaps", "/partners/gaps"),
    nav("partner_page_inclusion", "/partners/inclusion"),
    nav("partner_page_business-case", "/partners/business-case"),
]

HANDOFF = {
    "metrics": METRICS,
    "sources": SOURCES,
    "experiences": {
        "mode": "local_demo_only",
        "currency": "USD",
        "items": [
            {"id": "booth_pass", "title": "Make A Mark Live fan-zone pass", "description": "Explore the car and try the reaction challenge.", "price_cents": 2500, "price_kind": "proposal_assumption", "capacity": 40, "capacity_kind": "fictional_demo_inventory", "source_ids": ["PROPOSAL", "DEMO_MODEL"], "action_id": "reserve_ticket"},
            {"id": "meet_engineer", "title": "Meet the engineering story", "description": "A sample experience reservation flow. Availability and price are illustrative.", "price_cents": None, "price_kind": "not_priced", "capacity": 12, "capacity_kind": "fictional_demo_inventory", "source_ids": ["DEMO_MODEL"], "action_id": "reserve_ticket"},
        ],
        "collect_real_personal_information": False,
        "payment_enabled": False,
        "reservation": {"code_prefix": "DEMO-", "status": "DEMO_RESERVED", "max_quantity": 4, "quantity_min": 1, "allow_cancel": True, "cancel_restores_capacity": True, "ticket_notice": "Prototype ticket. Not valid for admission. No payment taken."},
        "stamp": {"id": "explorer_stamp", "title": "Made my mark", "meaning": "A demo engagement collectible; not proof of a donation or environmental saving.", "action_id": "claim_stamp"},
        "booth": {"idle_reset_seconds": 60, "hit_target_px": 64, "attempts": 3, "green_delays_ms": [1600, 2400, 1900], "measure_with": "performance.now", "false_start_copy": "Too soon. Wait for green.", "score_rule": "Median of three valid reaction times in milliseconds.", "compare_to_real_pit_crew": False, "leaderboard_scope": "this_browser_session", "camera_required": False, "manual_ticket_code": True},
    },
    "conversations": {
        "mode": "recommended_questions_only",
        "free_text": False,
        "microphone": False,
        "llm_calls": False,
        "default_guide_question_ids": ["guide_car", "guide_engine", "guide_match", "guide_impact", "guide_fuel", "guide_people", "guide_race", "guide_simulate", "guide_partners", "guide_trust"],
        "default_partner_question_ids": ["partner_overview", "partner_aleto", "partner_carbon", "partner_gaps", "partner_cost", "partner_renewal", "partner_privacy", "partner_business"],
        "questions": QUESTIONS,
        "fallback": "This demonstration supports the recommended questions shown here. Select another question or open the source.",
        "runtime": {"resolve_by": "question_id", "reply_deduplication": "one_inflight_per_surface", "history_scope": "surface_and_persona", "max_visible_messages": 20, "cancel_pending_on_route_change": True, "source_behavior": "open_local_source_drawer_then_offer_official_link", "unsupported_input_behavior": "no_text_input_rendered"},
    },
    "car": {
        "model": {"model": "AMR26", "season": 2026, "team": TEAM, "drivers": ["Fernando Alonso", "Lance Stroll"], "power_unit": "Honda RA626H", "ice": "1.6 L turbocharged V6", "fuel": "Aramco ProForce+", "gearbox": "Aston Martin in-house 8-speed semi-automatic", "energy_recovery": "MGU-K; no MGU-H", "aero": "Active front and rear wings; Corner Mode and Straight Mode", "regulatory_specs": [
            {"name": "FIA minimum weight, 2026 published figure", "value": 768, "unit": "kg", "is_actual_AMR26_measured_weight": False, "source_ids": ["AMR26_TEAM"]},
            {"name": "Maximum permitted wheelbase", "value": 3400, "unit": "mm", "is_actual_AMR26_measured_wheelbase": False, "source_ids": ["AMR26_TEAM"]},
            {"name": "Maximum permitted width", "value": 1900, "unit": "mm", "is_actual_AMR26_measured_width": False, "source_ids": ["AMR26_TEAM"]},
            {"name": "Maximum MGU-K electrical power (deployment subject to regulations)", "value": 350, "unit": "kW", "is_measured_continuous_AMR26_power": False, "source_ids": ["AMR26_ENGINEERING", "FIA_APRIL"]},
        ], "sources": ["AMR26_TEAM", "AMR26_ENGINEERING", "HONDA_AMR26"]},
        "components": COMPONENTS,
        "comparisons": [
            {"metric": "Power-unit supplier", "2025": "Mercedes HPP", "2026": "Honda", "source_ids": ["AMR25_TEAM", "AMR26_ENGINEERING"]},
            {"metric": "Power-unit spec", "2025": "Mercedes-AMG F1 M16 E Performance V6 hybrid", "2026": "Honda RA626H 1.6 L turbo V6 hybrid", "source_ids": ["AMR25_TEAM", "AMR26_ENGINEERING"]},
            {"metric": "MGU-K peak permitted electrical power", "2025": 120, "2026": 350, "unit": "kW", "qualifier": "Regulatory maximum, not steady real-time AMR26 electrical output", "source_ids": ["AMR26_ENGINEERING"]},
            {"metric": "MGU-H", "2025": "Present", "2026": "Removed", "source_ids": ["AMR25_TEAM", "AMR26_ENGINEERING"]},
            {"metric": "Gearbox supplier", "2025": "Mercedes", "2026": "Aston Martin in-house", "source_ids": ["AMR25_TEAM", "AMR26_ENGINEERING"]},
            {"metric": "Wing control", "2025": "Conventional rear DRS", "2026": "Active front and rear wings; Straight/Corner Modes", "source_ids": ["AMR25_TEAM", "AMR26_ENGINEERING"]},
            {"metric": "Floor generation", "2025": "Venturi-tunnel ground-effect regulations", "2026": "Flatter/stepped floor and conventional diffuser", "source_ids": ["AMR26_ENGINEERING"]},
            {"metric": "Width maximum", "2025": 2000, "2026": 1900, "unit": "mm", "qualifier": "Regulatory/design maximum; not measured car width", "source_ids": ["AMR25_TEAM", "AMR26_TEAM"]},
            {"metric": "Wheelbase maximum", "2025": 3600, "2026": 3400, "unit": "mm", "qualifier": "Regulatory/design maximum; not measured car wheelbase", "source_ids": ["AMR25_TEAM", "AMR26_TEAM"]},
            {"metric": "Weight", "2025": 798, "2026": 768, "unit": "kg", "qualifier": "2025 officially reported overall weight including driver excluding fuel vs 2026 published FIA minimum; NOT directly comparable as measured vehicle weights", "source_ids": ["AMR25_TEAM", "AMR26_TEAM"]},
            {"metric": "Racing fuel", "2025": "Previous-era F1 fuel regulations", "2026": "Aramco ProForce+ FIA-compliant 100% sustainable fuel", "qualifier": "Do not assume identical fuels in 2025 and 2026", "source_ids": ["AMR26_ENGINEERING"]},
        ],
        "historical_car": {"model": "AMR25", "season": 2025, "power_unit": "Mercedes-AMG F1 M16 E Performance, 1.6 litre turbo V6 hybrid", "engine_supplier": "Mercedes HPP", "gearbox": "Mercedes F1 eight-speed semi-automatic", "official_published_power_bhp_approx": 1000, "official_published_acceleration_0_to_160_kmh_s": 3.7, "official_published_overall_weight_kg": 798, "published_weight_note": "Including driver, excluding fuel, on Aston Martin 2025 specification page", "chassis": "Carbon-fibre composite monocoque with Zylon side anti-intrusion panels", "brake_system": "Brembo calipers, carbon discs/pads and in-house brake-by-wire", "tyres": "Pirelli P Zero", "wheels": "BBS 18-inch front/rear", "sources": ["AMR25_TEAM"]},
        "default_component": "power_unit",
        "interaction": {"hotspot_shape": "square", "activation": "single_click_or_enter", "history_shortcut": "double_click_on_car_background_only", "history_button_action_id": "evolution", "panel_layout": "title_above_description_left_animation_right_charts_below", "escape": "close_topmost_overlay", "outside_click": "close_component", "restore_focus": True},
        "timeline": {"stops": [
            {"id": "2025", "year": 2025, "title": "AMR25", "body": "Previous-generation hybrid engineering. Team impact milestones shown separately from the car specifications.", "source_ids": ["AMR25_TEAM", "ESG25_P24", "ESG25_P31"], "metric_ids": ["mgu_k_2025", "circularity_2025", "safc_2025"]},
            {"id": "2026", "year": 2026, "title": "AMR26", "body": "Honda power unit, expanded electrical power and active aerodynamics.", "source_ids": ["AMR26_ENGINEERING"], "metric_ids": ["mgu_k_2026", "fuel_2026"]},
        ], "historical_expansion": {"requested_years": [1959, 1960, 2021, 2022, 2023, 2024], "status": "editorial_and_asset_research_required_before_adding_stops", "rule": "Do not fabricate intervening car designs or ESG values. Ship the populated 2025–2026 comparison first."}, "interpolate_numbers": False},
    },
    "brand": {
        "id": "brand",
        "inspected_at": "2026-10-21",
        "source_id": "AMF1_HOME",
        "colors": {"opal": "#00665e", "dark": "#00231f", "opal_deep": "#00352f", "opal_mid": "#00473f", "lime": "#cedc00", "lime_hover": "#b9c600", "white": "#ffffff", "black": "#000000", "muted": "#a3a3a3", "border": "#ffffff33", "header_pill": "#ffffff14"},
        "header": {
            "desktop": {"height_px": 100, "position": "fixed", "logo_width_px": 200, "logo_top_px": 12, "logo_alignment": "viewport_center", "menu_left_px": 50, "menu_top_px": 40, "cta_right_px": 50, "cta_top_px": 30, "cta_gap_px": 20, "cta_radius_px": 16, "cta_font_px": 14, "drawer_width_px": 408},
            "mobile": {"breakpoint_px": 768, "logo_alignment": "left", "logo_left_px": 16, "logo_top_px": 10, "logo_width_px": 200, "menu_right_px": 25, "menu_top_px": 30, "hide_desktop_ctas": True},
            "scroll": {"backdrop": "#00000059", "blur_px": 22.5, "transition_ms": 400},
            "logo_asset": "/assets/brand/amf1-header-white.svg",
            "access_url": "https://www.astonmartinf1.com/en-GB/access-I-AM",
            "shop_url": "https://shop.astonmartinf1.com/gb/en/home/",
        },
        "layout": {"public_background": "#00231f", "car_stage_background": "#000000", "grid_opacity": 0.035, "grid_size_px": 40, "page_gutter_desktop_px": 50, "page_gutter_mobile_px": 20, "radius_panel_px": 12, "radius_button_px": 16, "motion_ms": 240, "reduced_motion_ms": 0},
        "font_assets": [
            {"family": "AstonMartinFlare", "weight": 400, "local_href": "/assets/fonts/AstonMartinFlare-Regular.woff2"},
            {"family": "AstonMartinFlare", "weight": 500, "local_href": "/assets/fonts/AstonMartinFlare-Medium.woff2"},
            {"family": "AstonMartinFlare", "weight": 700, "local_href": "/assets/fonts/AstonMartinFlare-Bold.woff2"},
            {"family": "AstonMartinSans", "weight": 400, "local_href": "/assets/fonts/AstonMartinSans-Regular.woff2"},
            {"family": "AstonMartinSans", "weight": 500, "local_href": "/assets/fonts/AstonMartinSans-Medium.woff2"},
            {"family": "AstonMartinSans", "weight": 700, "local_href": "/assets/fonts/AstonMartinSans-Bold.woff2"},
        ],
    },
    "simulations": {
        "calculation_location": "browser_pure_functions",
        "status_label": "Illustrative scenario",
        "scenarios": [
            {"id": "emissions", "title": "Where could a reduction matter most?", "source_ids": ["ESG25_P19", "ESG25_P83", "DEMO_MODEL"], "inputs": [
                {"id": "supplier_coverage", "label": "Share of supply-chain baseline addressed", "min": 0, "max": 100, "step": 5, "default": 20, "unit": "percent"},
                {"id": "hq_coverage", "label": "Share of HQ-energy baseline addressed", "min": 0, "max": 100, "step": 5, "default": 20, "unit": "percent"},
            ], "parameters": {"supplier_baseline": 69837, "hq_baseline": 772.91, "team_baseline": 87162.4, "supplier_effectiveness": [0.02, 0.05, 0.08], "hq_effectiveness": [0.2, 0.4, 0.6]}, "formula": "For each low/mid/high index: supplier_baseline * supplier_coverage/100 * supplier_effectiveness[index] + hq_baseline * hq_coverage/100 * hq_effectiveness[index]", "unit": "tCO2e", "assumptions": ["Effectiveness ranges are invented for demonstration and do not represent forecasts.", "Coverage is a share of baseline emissions, not spend, budget or guaranteed adoption.", "The two category baselines are separate. Do not add SAF and freight-mode savings to this model.", "More primary data does not itself reduce emissions. An effective intervention is assumed."], "example": {"inputs": {"supplier_coverage": 20, "hq_coverage": 20}, "outputs": {"low": 310.2644, "mid": 760.2028, "high": 1210.1412}}},
            {"id": "stem", "title": "Explore outreach capacity", "source_ids": ["ESG25_P59", "DEMO_MODEL"], "inputs": [{"id": "funding_change_percent", "label": "Illustrative funding change", "min": 0, "max": 100, "step": 5, "default": 20, "unit": "percent"}], "parameters": {"baseline_students": 257, "response_factors": [0.7, 0.85, 1]}, "formula": "round(257 * (1 + funding_change_percent/100 * response_factor))", "unit": "students", "assumptions": ["No verified programme budget or cost curve is loaded.", "Response factors are illustrative, not confidence intervals.", "Attendance is not a career outcome.", "Schools are not projected from a simple linear rule."], "example": {"inputs": {"funding_change_percent": 20}, "outputs": {"low": 293, "mid": 301, "high": 308}}},
            {"id": "mentoring", "title": "Plan an illustrative cohort", "source_ids": ["ESG25_P42", "DEMO_MODEL"], "inputs": [
                {"id": "cohort_size", "label": "Proposed cohort size", "min": 8, "max": 40, "step": 1, "default": 16, "unit": "participants"},
                {"id": "budget_gbp", "label": "Illustrative total programme budget", "min": 10000, "max": 100000, "step": 1000, "default": 24000, "unit": "GBP"},
            ], "formula": "illustrative_cost_per_participant = budget_gbp / cohort_size", "assumptions": ["Budget is a demo input, not AMF1 expenditure.", "Show historical survey percentages alongside the scenario but do not forecast placements or people succeeding.", "No currency conversion or employment prediction."], "example": {"inputs": {"cohort_size": 16, "budget_gbp": 24000}, "outputs": {"illustrative_cost_per_participant": 1500}}},
        ],
    },
    "app": {
        "name": "Make A Mark Live",
        "guide_name": "AI.lonso",
        "routes": [
            {"path": "/", "title": "Home", "section": "home"},
            {"path": "/car", "title": "The Car", "section": "car"},
            {"path": "/car/evolution", "title": "Car evolution", "section": "car"},
            {"path": "/car/:componentId", "title": "Component explorer", "section": "car"},
            {"path": "/people", "title": "The People", "section": "people"},
            {"path": "/people/:personaId", "title": "Programme story", "section": "people"},
            {"path": "/match", "title": "Find a story", "section": "people"},
            {"path": "/impact", "title": "Reported impact", "section": "impact"},
            {"path": "/race", "title": "Race weekend replay", "section": "race"},
            {"path": "/simulate", "title": "Make your call", "section": "impact"},
            {"path": "/partners", "title": "Partner overview", "section": "partners"},
            {"path": "/partners/programmes", "title": "Programme evidence", "section": "partners"},
            {"path": "/partners/simulate", "title": "Initiative simulator", "section": "partners"},
            {"path": "/partners/reports", "title": "Impact report", "section": "partners"},
            {"path": "/partners/gaps", "title": "Data gaps", "section": "partners"},
            {"path": "/partners/inclusion", "title": "Leadership demonstration", "section": "partners"},
            {"path": "/partners/business-case", "title": "Business case", "section": "partners"},
            {"path": "/engine", "title": "Impact engine demonstration", "section": "engine"},
            {"path": "/experiences", "title": "Experiences", "section": "experiences"},
            {"path": "/booth", "title": "Fan zone", "section": "booth"},
            {"path": "/stamp/:code", "title": "Demo stamp", "section": "experiences"},
            {"path": "/go/:campaignId", "title": "Campaign entry", "section": "home"},
            {"path": "/demo", "title": "Presenter controls", "section": "home"},
            {"path": "/methodology", "title": "Sources and assumptions", "section": "impact"},
        ],
        "menu_items": [
            {"label": "Home", "action_id": "home"},
            {"label": "The Car", "action_id": "car"},
            {"label": "The People", "action_id": "people"},
            {"label": "Impact", "action_id": "impact"},
            {"label": "Race weekend", "action_id": "race"},
            {"label": "The Partners", "action_id": "partners"},
            {"label": "Experiences", "action_id": "experiences"},
            {"label": "How it works", "action_id": "engine"},
        ],
        "home": {"headline": "Make your mark.", "description": "Explore the engineering, people and programmes behind the team.", "guide_intro": "Choose a question. Follow your curiosity.", "left_action_id": "people", "right_action_id": "car", "bottom_action_id": "impact", "metric_ids": ["scope12_change", "safc_2025", "circularity_2025"], "race_action_id": "race"},
        "storage": {"key": "mam-live-demo-v1", "version": 1, "reset_action_id": "reset_demo"},
        "global_notice": "Interactive concept demo. Conversations are prewritten; live activity is simulated.",
        "errors": {"unknown_route": "This page is not part of the demo. Return home.", "unknown_question": "Choose one of the recommended questions.", "unknown_persona": "This story is not available. Explore the programme library.", "missing_image": "Illustration unavailable. All controls remain accessible.", "unavailable_metric": "Not publicly reported in the loaded sources.", "download_failed": "Open the printable report and use your browser’s Save as PDF option."},
        "transition_lines": ["Meet the minds behind the machine.", "From inspiring fans to proving impact for partners."],
    },
    "partners": {
        "demo_roles": [
            {"id": "charity", "label": "Charity partner demo", "programme_ids": ["aleto", "afbe", "paddle-uk", "racing-pride"], "visible_tabs": ["overview", "programmes", "simulate", "reports", "gaps"]},
            {"id": "commercial", "label": "Commercial partner demo", "programme_ids": ["make-a-mark-day", "aramco-intern", "stem-racing", "mechanics", "accelerate-women"], "visible_tabs": ["overview", "programmes", "simulate", "reports", "gaps"]},
            {"id": "leadership", "label": "AMF1 leadership demo", "programme_ids": ["aleto", "accelerate-women", "racing-pride", "paddle-uk", "techvets", "mechanics", "make-a-mark-day", "aramco-intern", "stem-racing", "afbe", "neurodiversity", "fundraising"], "visible_tabs": ["overview", "programmes", "simulate", "reports", "gaps", "inclusion", "business-case"]},
        ],
        "default_role": "commercial",
        "role_switch_is_security": False,
        "overview_metric_ids": ["mam_students", "fundraising_2025", "scope12_change"],
        "inclusion_metric_ids": ["workforce_women", "workforce_count", "paygap_median", "paygap_mean"],
        "charts": [
            {"id": "footprint_trend", "type": "line", "metric_ids": ["footprint_2023", "footprint_2024", "footprint_2025"], "connect_missing": False},
            {"id": "footprint_categories", "type": "horizontal_bar", "metric_ids": ["supply_chain", "freight_logistics", "business_travel", "commuting", "hq_energy", "other"], "note": "Category rounding difference disclosed in source drawer."},
            {"id": "aleto_outcomes", "type": "horizontal_bar", "metric_ids": ["aleto_network", "aleto_leadership"], "axis_min": 0, "axis_max": 100},
        ],
        "report": {"title": "Make A Mark Live — Partner impact demonstration", "sections": ["Selected programme", "Reported measures", "Sources and reporting periods", "Illustrative scenario, if selected", "Data gaps and limitations"], "default_programme_id": "aleto", "format": "print_ready_html", "include_prototype_label": True, "action_id": "export_report"},
        "data_gaps": [
            {"id": "gap_career", "title": "Long-term career outcomes", "status": "not_loaded", "owner_role": "Programme owner", "source_ids": ["PROPOSAL"], "explanation": "No longitudinal career outcome is loaded. A status change does not create evidence."},
            {"id": "gap_cost", "title": "Verified programme cost inputs", "status": "not_loaded", "owner_role": "Partner finance", "source_ids": ["PROPOSAL"], "explanation": "Verified programme expenditure is not in the loaded sources."},
            {"id": "gap_supplier", "title": "Activity-based supplier measurements", "status": "illustrative_work_in_progress", "owner_role": "Procurement", "source_ids": ["ESG25_P85"], "explanation": "Category totals are published. Activity-based supplier measurements are not loaded."},
            {"id": "gap_race", "title": "Current-weekend operational feeds", "status": "not_connected", "owner_role": "Operations", "source_ids": ["DEMO_MODEL"], "explanation": "The race screen is a seeded replay, not a live operational feed."},
        ],
        "assistant_question_ids": ["partner_overview", "partner_aleto", "partner_carbon", "partner_gaps", "partner_cost", "partner_renewal", "partner_privacy", "partner_business"],
    },
    "engine": {
        "title": "How the impact engine would work",
        "label": "Demonstration of the proposed impact-engine workflow.",
        "mode": "scripted_demo",
        "steps": ["Select source fixture", "Extract fields", "Classify pillar", "Validate", "Human review", "Publish to demo ledger"],
        "fixture": {"id": "energy_fixture_001", "source_id": "DEMO_MODEL", "name": "Illustrative campus meter reading", "raw_text": "DEMO METER | period: sample-day | electricity: 420 kWh | solar: 80 kWh", "parsed_fields": {"period": "sample-day", "electricity_kwh": 420, "solar_kwh": 80}, "pillar": "ENVIRONMENT", "flags": [{"id": "no_owner", "severity": "review", "message": "Owner approval required before publication."}], "initial_state": "ready", "states": ["ready", "extracting", "classified", "review_required", "approved", "rejected"], "durations_ms": [350, 350, 350], "approved_record": {"id": "demo_energy_001", "value": 420, "unit": "kWh", "kind": "simulated", "period": "sample-day", "source_id": "DEMO_MODEL"}},
        "production_description": "Cognizant would connect operational sources, validate evidence and publish governed records. This prototype demonstrates the workflow with deterministic data.",
    },
    "campaigns": {"items": [
        {"id": "ig-car-engine", "channel": "Instagram concept", "headline": "Why did our engine change?", "cta": "Explore the car", "target": "/car/power_unit", "image_reference": "/references/car-social.png"},
        {"id": "ig-people-mamw", "channel": "Instagram concept", "headline": "Meet the people making their mark", "cta": "Explore the stories", "target": "/people", "image_reference": "/references/people-social.png"},
        {"id": "li-partners-aleto", "channel": "LinkedIn concept", "headline": "See the evidence behind the programme", "cta": "View impact", "target": "/partners?programme=aleto", "image_reference": "/references/partner-social.png"},
        {"id": "ig-race-austin", "channel": "Instagram concept", "headline": "Explore a race weekend’s impact", "cta": "Open the demo weekend", "target": "/race", "image_reference": "/references/race-social.png"},
    ], "unknown_slug_fallback": "/", "label": "Concept campaign — prototype"},
    "demo_script": {"reset_before_start": True, "main_route_minutes": 5, "steps": [
        {"id": "d1", "path": "/go/ig-car-engine", "say": "A fan arrives from a car story.", "do": "Open the power-unit square."},
        {"id": "d2", "path": "/car/power_unit", "question_id": "car_power_unit_1", "say": "Each part has a prepared answer and a source.", "do": "Select the first question, then open its citation."},
        {"id": "d3", "path": "/car/energy_recovery", "question_id": "car_energy_recovery_2", "say": "The generation comparison distinguishes permitted power from measured performance.", "do": "Toggle 2025 and 2026."},
        {"id": "d4", "path": "/car/evolution", "say": "Scrub the loaded generations.", "do": "Move the slider to each stop."},
        {"id": "d5", "path": "/people/paddle-uk", "question_id": "person_paddle-uk_results", "say": "Follow the engineering into an accessibility programme.", "do": "Select the outcome question and open the real story source."},
        {"id": "d6", "path": "/match", "say": "Fans can discover programmes through their interests.", "do": "Choose technology, school, event, creative."},
        {"id": "d7", "path": "/partners?programme=aleto", "question_id": "partner_aleto", "say": "Partners see the same evidence with its limitations.", "do": "Select Aleto and open the source drawer."},
        {"id": "d8", "path": "/partners/simulate", "say": "Planning assumptions are explicit and adjustable.", "do": "Set the outreach scenario to +20% and show 293–308 students."},
        {"id": "d9", "path": "/engine", "say": "The proposed engine turns source records into reviewed evidence.", "do": "Run the fixture and approve the demonstration record."},
        {"id": "d10", "path": "/partners/reports", "say": "The result can be shared as a source-linked report.", "do": "Export the printable report."},
    ], "short_route_step_ids": ["d1", "d2", "d5", "d7", "d8"]},
    "business_case": {
        "status": "planning_scenario_from_supplied_proposal",
        "currency": "USD",
        "source_ids": ["PROPOSAL"],
        "summary": {"total_value": 2377500, "total_cost": 1747400, "net": 630100, "roi_percent": 36.0593, "payback_month_approx": 28, "pilot_ask_rounded": 436000, "year_one_cost": 1132600, "annual_run_cost_before_booth": 232400},
        "sensitivities": [
            {"id": "base", "label": "Base assumptions", "three_year_net": 630100},
            {"id": "no_licensing", "label": "No licensing royalty", "three_year_net": 390100},
            {"id": "one_activation", "label": "Only one activation in years 2 and 3", "three_year_net": 30100},
            {"id": "half_booth", "label": "Half booth volume, costs unchanged", "three_year_net": 423850},
        ],
        "categories": ["Existing-partner activations", "Race-booth receipts", "Bookable experiences", "Merchandise contribution", "Reporting effort saved", "AMF1 licensing royalty"],
        "limitations": [
            "Reporting savings are not sales revenue.",
            "Merchandise contribution is not gross merchandise revenue.",
            "AMF1 royalty is not Cognizant gross licensing revenue.",
            "Modelled net value is not guaranteed profit.",
            "Production delivery costs are unrelated to the cost of building this prototype.",
            "No charitable percentage is agreed in the supplied proposal.",
        ],
    },
    "race": {
        "id": "austin_demo",
        "title": "Austin race-weekend experience",
        "status": "DEMO_REPLAY",
        "badge": "SIMULATED WEEKEND",
        "source_ids": ["DEMO_MODEL"],
        "interval_ms": 5000,
        "snapshots": [
            {"id": "r0", "elapsed_seconds": 0, "simulated_cumulative_fan_actions": 120, "simulated_cumulative_reservations": 12, "energy_mix_percent": {"renewable_diesel": 70, "grid": 25, "solar": 5}},
            {"id": "r1", "elapsed_seconds": 5, "simulated_cumulative_fan_actions": 128, "simulated_cumulative_reservations": 13, "energy_mix_percent": {"renewable_diesel": 70, "grid": 25, "solar": 5}},
            {"id": "r2", "elapsed_seconds": 10, "simulated_cumulative_fan_actions": 135, "simulated_cumulative_reservations": 15, "energy_mix_percent": {"renewable_diesel": 70, "grid": 25, "solar": 5}},
            {"id": "r3", "elapsed_seconds": 15, "simulated_cumulative_fan_actions": 144, "simulated_cumulative_reservations": 16, "energy_mix_percent": {"renewable_diesel": 70, "grid": 25, "solar": 5}},
        ],
        "historical_context_metric_ids": ["safc_2025", "saf_percent_2025"],
        "unavailable": ["Current-weekend measured freight emissions", "Current-weekend actual SAF share", "Measured charitable donations from this prototype"],
    },
    "matching": {
        "questions": [
            {"id": "interest", "label": "What interests you most?", "options": ["building", "tech", "leadership", "planet", "community"]},
            {"id": "stage", "label": "Where are you exploring from?", "options": ["school", "university", "working", "fan"]},
            {"id": "action", "label": "What would you like to do?", "options": ["learn", "apply", "volunteer", "event"]},
            {"id": "style", "label": "What kind of experience appeals to you?", "options": ["competitive", "creative", "supportive"]},
        ],
        "weights": {"interest": 4, "stage": 2, "action": 3, "style": 1},
        "persona_tags": {person["id"]: person["tags"] for person in PEOPLE},
        "tie_order": [person["id"] for person in PEOPLE],
        "fallback_id": "make-a-mark-day",
        "result_count": 3,
        "reason_template": "This story connects with your interest in {matched_tags}.",
        "allow_skip": True,
        "tests": [
            {"answers": {"interest": "building", "stage": "school", "action": "apply", "style": "competitive"}, "expected_first": "mechanics"},
            {"answers": {"interest": "tech", "stage": "school", "action": "event", "style": "creative"}, "expected_first": "make-a-mark-day"},
            {"answers": {"interest": "planet", "stage": "university", "action": "apply", "style": "supportive"}, "expected_first": "aramco-intern"},
        ],
    },
    "people": PEOPLE,
    "actions": ACTIONS,
    "analytics": {"mode": "local_session_only", "event_types": ["page_view", "campaign_opened", "component_opened", "generation_changed", "evolution_changed", "question_selected", "answer_shown", "citation_opened", "persona_opened", "match_completed", "simulation_saved", "demo_interest_saved", "demo_reservation_created", "stamp_claimed", "report_exported", "booth_game_completed"]},
}

out = ROOT / "content" / "handoff" / "make-a-mark-live.json"
out.write_text(json.dumps(HANDOFF, indent=2, ensure_ascii=False) + "\n")
print("questions", len(QUESTIONS))
print("actions", len(ACTIONS))
print("metrics", len(METRICS))
print("sources", len(SOURCES))
print("components", len(COMPONENTS))
print("people", len(PEOPLE))
print("routes", len(HANDOFF["app"]["routes"]))
print("wrote", out)
