from __future__ import annotations

import os
import uuid
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

from app.models.schemas import ChartMetadata

# Vibrant Modern Theme
plt.rcParams.update({
    "figure.facecolor": "#ffffff",
    "axes.facecolor": "#ffffff",
    "axes.edgecolor": "#000000",
    "axes.labelcolor": "#000000",
    "xtick.color": "#333333",
    "ytick.color": "#333333",
    "text.color": "#000000",
    "grid.color": "#eeeeee",
    "grid.linestyle": "--",
    "font.family": "sans-serif",
})

# Distinct Categorical Palette
VIBRANT_PALETTE = ["#4f46e5", "#0d9488", "#e11d48", "#d97706", "#7c3aed", "#2563eb"]


def _trend_direction(series: pd.Series) -> str:
    if len(series) < 2:
        return "N/A"
    first_half = series.iloc[: len(series) // 2].mean()
    second_half = series.iloc[len(series) // 2 :].mean()
    diff = second_half - (first_half + 1e-9)
    if diff > 0.05 * abs(first_half):
        return "up"
    if diff < -0.05 * abs(first_half):
        return "down"
    return "flat"


def generate_visualizations(
    df: pd.DataFrame, filename: str, session_dir: Path
) -> list[ChartMetadata]:
    charts: list[ChartMetadata] = []
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    datetime_cols = [c for c in df.columns if pd.api.types.is_datetime64_any_dtype(df[c])]
    dataset_key = Path(filename).stem

    def _save(fig: plt.Figure, name: str) -> str:
        img_name = f"{dataset_key}_{name}_{uuid.uuid4().hex[:6]}.png"
        img_path = session_dir / img_name
        fig.savefig(img_path, bbox_inches="tight", dpi=130, facecolor="#f8fafc")
        plt.close(fig)
        return img_name

    # ── 1. Histograms (Slate) ─────────────────────────────────────────
    for col in numeric_cols[:2]:
        series = df[col].dropna()
        if len(series) < 5: continue
        fig, ax = plt.subplots(figsize=(7, 4))
        sns.histplot(series, bins=30, color="#4f46e5", alpha=0.9, ax=ax, kde=True, edgecolor="#ffffff", linewidth=1)
        ax.set_title(f"Distribution: {col}", fontsize=11, fontweight="bold")
        img_name = _save(fig, f"hist_{col[:15]}")
        charts.append(ChartMetadata(
            chart_id=uuid.uuid4().hex, dataset=filename, plot_type="histogram",
            title=f"Distribution: {col}", x_axis=col, y_axis="Frequency",
            trend_direction=_trend_direction(series), statistical_significance="Univariate Distribution",
            key_observations=[f"Average: {round(float(series.mean()), 2)}"],
            image_url=f"/static/{session_dir.name}/{img_name}",
        ))

    # ── 2. Box Plot by Category (Grayscale) ────────────────────────
    if numeric_cols and cat_cols:
        num, cat = numeric_cols[0], cat_cols[0]
        top_cats = df[cat].value_counts().head(6).index
        mask = df[cat].isin(top_cats)
        fig, ax = plt.subplots(figsize=(8, 5))
        sns.boxplot(data=df[mask], x=cat, y=num, palette=VIBRANT_PALETTE, ax=ax, showfliers=False, width=0.6)
        sns.stripplot(data=df[mask], x=cat, y=num, color="#000000", alpha=0.3, size=3, ax=ax)
        ax.set_title(f"{num} by {cat}", fontsize=11, fontweight="bold")
        ax.tick_params(axis="x", rotation=0)
        img_name = _save(fig, f"boxcat_{cat[:10]}")
        charts.append(ChartMetadata(
            chart_id=uuid.uuid4().hex, dataset=filename, plot_type="box_plot",
            title=f"{num} by {cat}", x_axis=cat, y_axis=num,
            trend_direction="N/A", statistical_significance="Categorical Variance",
            key_observations=[f"Segments identified for {cat}."],
            image_url=f"/static/{session_dir.name}/{img_name}",
        ))

    # ── 3. Pareto Chart (Monochrome) ──────────────────────────────────────────
    if cat_cols and numeric_cols:
        cat, num = cat_cols[0], numeric_cols[0]
        pareto_df = df.groupby(cat)[num].sum().sort_values(ascending=False).to_frame()
        pareto_df['cum_pct'] = pareto_df[num].cumsum() / pareto_df[num].sum() * 100
        pareto_df = pareto_df.head(10)
        
        fig, ax1 = plt.subplots(figsize=(8, 4))
        ax1.bar(pareto_df.index, pareto_df[num], color="#0d9488", alpha=0.8)
        ax2 = ax1.twinx()
        ax2.plot(pareto_df.index, pareto_df['cum_pct'], color="#e11d48", marker="o", ms=5, linewidth=2)
        ax2.set_ylim(0, 110)
        ax2.grid(False)
        ax1.set_title(f"Pareto: {cat} vs {num}", fontsize=11, fontweight="bold")
        img_name = _save(fig, "pareto")
        charts.append(ChartMetadata(
            chart_id=uuid.uuid4().hex, dataset=filename, plot_type="bar_chart",
            title=f"Pareto Analysis: {cat} vs {num}", x_axis=cat, y_axis=num,
            trend_direction="N/A", statistical_significance="80/20 Significance",
            key_observations=["Concentration of value in top segments."],
            image_url=f"/static/{session_dir.name}/{img_name}",
        ))

    # ── 4. Correlation Heatmap (Neutral) ─────────────────────────────
    if len(numeric_cols) >= 3:
        corr = df[numeric_cols[:12]].corr()
        fig, ax = plt.subplots(figsize=(7, 6))
        sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0, ax=ax, square=True,
                    cbar_kws={"shrink": .8}, linewidths=1, annot_kws={"size": 9, "weight": "bold"})
        ax.set_title("Correlation Matrix", fontsize=11, fontweight="bold")
        img_name = _save(fig, "corr_matrix")
        charts.append(ChartMetadata(
            chart_id=uuid.uuid4().hex, dataset=filename, plot_type="correlation_heatmap",
            title="Correlation Matrix", x_axis="Features", y_axis="Features",
            trend_direction="N/A", statistical_significance="Pearson",
            key_observations=["Inter-dependency of metrics."],
            image_url=f"/static/{session_dir.name}/{img_name}",
        ))

    # ── 5. Scatter with Linear Trend (Slate/Black) ─────────────────
    if len(numeric_cols) >= 2:
        x, y = numeric_cols[0], numeric_cols[1]
        fig, ax = plt.subplots(figsize=(7, 5))
        sample_df = df.sample(min(len(df), 500))
        sns.regplot(data=sample_df, x=x, y=y, ax=ax, 
                    scatter_kws={"alpha": 0.6, "color": "#7c3aed", "s": 40, "edgecolor": "white"},
                    line_kws={"color": "#000000", "linewidth": 2.5})
        ax.set_title(f"Relationship: {x} vs {y}", fontsize=11, fontweight="bold")
        img_name = _save(fig, "scatter_reg")
        charts.append(ChartMetadata(
            chart_id=uuid.uuid4().hex, dataset=filename, plot_type="scatter_plot",
            title=f"Relationship: {x} vs {y}", x_axis=x, y_axis=y,
            trend_direction="detected", statistical_significance="Linear Trend",
            key_observations=["Directional relationship visible via regression line."],
            image_url=f"/static/{session_dir.name}/{img_name}",
        ))

    return charts
