"""Matplotlib chart generation — ported verbatim from legacy googleADK/utils/viz.py."""

import os

import matplotlib

matplotlib.use("Agg")  # non-interactive backend for server use
import matplotlib.pyplot as plt


class Visualizer:
    def __init__(self, output_dir="temp_viz"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def generate_trend_chart(self, trend_data: dict, title="Market Growth Trend (Last 5 Years)"):
        if not trend_data:
            return None

        sorted_pairs = sorted(zip(trend_data.keys(), trend_data.values()))
        years = [str(p[0]) for p in sorted_pairs]
        values = [float(p[1]) for p in sorted_pairs]

        plt.figure(figsize=(8, 4))
        plt.plot(years, values, marker="o", linestyle="-", color="#4CAF50", linewidth=2)
        plt.title(title)
        plt.xlabel("Year")
        plt.ylabel("Market Value (Estimated)")
        plt.grid(True, linestyle="--", alpha=0.7)
        plt.tight_layout()

        filepath = os.path.join(self.output_dir, "market_trend.png")
        plt.savefig(filepath)
        plt.close()
        return filepath

    def generate_competitor_chart(self, scores: dict, title="Competitor Strength Analysis"):
        if not scores:
            return None

        names = list(scores.keys())
        values = [float(v) for v in scores.values()]

        colors = ["#FF5722" if "Our" not in n and "Solution" not in n else "#2196F3" for n in names]

        plt.figure(figsize=(8, 4))
        plt.bar(names, values, color=colors)
        plt.title(title)
        plt.ylabel("Strength Score (1-10)")
        plt.ylim(0, 10)
        plt.grid(axis="y", linestyle="--", alpha=0.7)
        plt.tight_layout()

        filepath = os.path.join(self.output_dir, "competitor_chart.png")
        plt.savefig(filepath)
        plt.close()
        return filepath
