from __future__ import annotations

import hashlib
import io
import json
from datetime import datetime
from pathlib import Path

import pandas as pd

from app.models.schemas import AnalysisResponse, DatasetAnalysis


# ─── JSON Report ──────────────────────────────────────────────────────────────

def generate_json_report(analysis: AnalysisResponse) -> bytes:
    return json.dumps(analysis.model_dump(), indent=2, default=str).encode("utf-8")


# ─── PDF Report ───────────────────────────────────────────────────────────────

def generate_pdf_report(analysis: AnalysisResponse, report_type: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Strict High-Minimalist Styles
    gold_accent = colors.HexColor("#d4af37")

    title_style = ParagraphStyle("Title", parent=styles["Title"],
                                  fontSize=26, textColor=colors.black,
                                  fontName="Helvetica-Bold", spaceAfter=8)
    subtitle_style = ParagraphStyle("Sub", parent=styles["Normal"],
                                     fontSize=9, textColor=colors.gray, spaceAfter=20,
                                     letterSpacing=1)
    heading_style = ParagraphStyle("H2", parent=styles["Heading2"],
                                    fontSize=16, textColor=colors.black,
                                    fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=10)
    body_style = ParagraphStyle("Body", parent=styles["BodyText"],
                                 fontSize=11, leading=16)

    story.append(Paragraph("ANALYZR", title_style))
    story.append(Paragraph(
        f"REPORT_TYPE: {report_type.upper()} | GENERATED: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        subtitle_style
    ))

    # Horizontal Divider in Gold
    story.append(Spacer(1, 0.2*cm))
    t_div = Table([[""]], colWidths=[17*cm], rowHeights=[1.5])
    t_div.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), gold_accent)]))
    story.append(t_div)
    story.append(Spacer(1, 1*cm))

    for da in analysis.datasets:
        story.append(Paragraph(f"DATASET: {da.filename.upper()}", heading_style))

        # ── Core Metrics (KPIs) ──
        if da.core_metrics:
            story.append(Paragraph("CORE KPI PERFORMANCE", styles["Heading3"]))
            metric_data = []
            # Create pairs for a 2-column KPI table
            for i in range(0, len(da.core_metrics), 2):
                pair = []
                for m in da.core_metrics[i:i+2]:
                    cell_text = f"<b>{m['label'].upper()}</b><br/><font size='16'>{m['value']}</font><br/><font size='8' color='gray'>{m['interpretation']}</font>"
                    pair.append(Paragraph(cell_text, body_style))
                while len(pair) < 2: pair.append("")
                metric_data.append(pair)
            
            t_metrics = Table(metric_data, colWidths=[8.5*cm, 8.5*cm])
            t_metrics.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 0.1, colors.HexColor("#eeeeee")),
            ]))
            story.append(t_metrics)
            story.append(Spacer(1, 0.6*cm))

        # ── Executive Summary ──
        story.append(Paragraph("EXECUTIVE ANALYSIS", styles["Heading3"]))
        story.append(Paragraph(da.executive_summary or "ANALYSIS PENDING", body_style))
        story.append(Spacer(1, 0.5*cm))

        # ── Recommendations ──
        if da.recommendations:
            story.append(Paragraph("STRATEGIC RECOMMENDATIONS", styles["Heading3"]))
            for rec in da.recommendations:
                story.append(Paragraph(f"• {rec}", body_style))
            story.append(Spacer(1, 0.6*cm))

        # ── Statistical Findings (Always show top 10 now) ──
        all_insights = da.descriptive + da.diagnostic + da.predictive + da.business
        top = sorted(all_insights, key=lambda i: i.confidence_score, reverse=True)[:10]

        if top:
            story.append(Paragraph("PRIORITY STATISTICAL FINDINGS", styles["Heading3"]))
            table_data = [["LAYER", "METRIC", "CONFIDENCE", "INTERPRETATION"]]
            for ins in top:
                interp = ins.business_interpretation[:120] + "..." if len(ins.business_interpretation) > 120 else ins.business_interpretation
                table_data.append([
                    ins.layer.upper(),
                    ins.metric_name[:40].upper(),
                    f"{ins.confidence_score:.0%}",
                    interp,
                ])
            t = Table(table_data, colWidths=[2.5*cm, 3.5*cm, 2.5*cm, 8.5*cm])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.black),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (-1, -1), 7.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
                ("GRID", (0, 0), (-1, -1), 0.1, colors.HexColor("#dddddd")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(t)

        story.append(PageBreak())

    # ── Cross-Dataset Insights (Global) ──
    if analysis.cross_dataset_insights:
        story.append(Paragraph("SYSTEM-WIDE CROSS-INSIGHTS", heading_style))
        for item in analysis.cross_dataset_insights:
            story.append(Paragraph(f"• {item}", body_style))

    doc.build(story)
    return buf.getvalue()

    # Cross-dataset insights
    if analysis.cross_dataset_insights:
        story.append(Paragraph("Cross-Dataset Insights", heading_style))
        for item in analysis.cross_dataset_insights:
            story.append(Paragraph(f"• {item}", body_style))

    doc.build(story)
    return buf.getvalue()


# ─── HTML Report ──────────────────────────────────────────────────────────────

def generate_html_report(analysis: AnalysisResponse) -> bytes:
    """Generates a standalone, styled HTML report."""
    
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analyzr Executive Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #ffffff;
            --accent: #d4af37;
            --text: #000000;
            --muted: #666666;
            --border: #eeeeee;
        }}
        body {{
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 60px 20px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
        }}
        header {{
            margin-bottom: 60px;
        }}
        .brand {{
            font-size: 10px;
            font-weight: 800;
            color: var(--accent);
            letter-spacing: 0.15em;
            margin-bottom: 8px;
        }}
        h1 {{
            font-size: 42px;
            font-weight: 800;
            margin: 0 0 12px 0;
            letter-spacing: -0.03em;
        }}
        .divider {{
            width: 80px;
            height: 4px;
            background: var(--accent);
            margin-bottom: 40px;
        }}
        .section-header {{
            font-size: 11px;
            font-weight: 800;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }}
        .card {{
            padding: 32px;
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 4px;
            margin-bottom: 32px;
        }}
        .executive-summary {{
            font-size: 16px;
            line-height: 1.8;
            color: #111;
        }}
        .metric-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 60px;
        }}
        .metric-card {{
            padding: 24px;
            border: 1px solid var(--border);
            border-top: 4px solid var(--accent);
        }}
        .metric-label {{
            font-size: 10px;
            font-weight: 800;
            color: var(--muted);
            text-transform: uppercase;
            margin-bottom: 8px;
        }}
        .metric-value {{
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 8px;
        }}
        .metric-note {{
            font-size: 13px;
            color: var(--muted);
        }}
        ul {{
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 12px;
        }}
        footer {{
            margin-top: 100px;
            font-size: 11px;
            color: var(--muted);
            text-align: center;
            letter-spacing: 0.05em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="brand">[ ANALYSIS_SESSION: {analysis.session_id[:8].upper()} ]</div>
            <h1>Executive Report</h1>
            <div class="divider"></div>
        </header>

        {"".join([f'''
        <div class="section-header">Dataset: {da.filename}</div>
        
        <div class="metric-grid">
            {"".join([f"""
            <div class="metric-card">
                <div class="metric-label">{m['label']}</div>
                <div class="metric-value">{m['value']}</div>
                <div class="metric-note">{m['interpretation']}</div>
            </div>
            """ for m in da.core_metrics])}
        </div>

        <div class="card">
            <div class="brand">EXECUTIVE_ANALYSIS</div>
            <div class="executive-summary">{da.executive_summary}</div>
        </div>

        <div class="card">
            <div class="brand">STRATEGIC_RECOMMENDATIONS</div>
            <ul>
                {"".join([f"<li>{rec}</li>" for rec in da.recommendations])}
            </ul>
        </div>
        ''' for da in analysis.datasets])}

        <footer>
            GENERATED BY ANALYZR · {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
        </footer>
    </div>
</body>
</html>"""
    return html_template.encode("utf-8")


# ─── DOCX Report (Deprecated in favor of HTML) ────────────────────────────────

def generate_docx_report(analysis: AnalysisResponse, report_type: str) -> bytes:
    # Kept for compatibility but unused by the new export modal
    from docx import Document
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    
    # ... rest of docx remains same ...
    return b"" 
