"""Output TSVs gene popularity by Wikipedia views and PubMed citations
"""

import argparse

from citations.citations import Citations
from views.dailyviews import DailyViews
from merge_trends import merge_trends

class GeneTrends():
    def __init__(
        self, days, hours_per_day, sort_by="count", only=None,
        debug=0
    ):
        self.days = days
        self.hours_per_day = hours_per_day
        self.sort_by = sort_by
        self.only = only
        self.debug = debug

        if self.days == 180 and self.debug > 0:
            self.days = 2

    def call_subpipelines(self):
        only = self.only
        cache = self.debug
        if not only or "views" in only:
            DailyViews(cache, self.hours_per_day).run(self.sort_by)
        if not only or "citations" in only:
            Citations(cache).run(self.sort_by)

    def run(self):
        """Output TSVs gene popularity by Wikipedia views and PubMed citations
        """
        self.call_subpipelines()

        print("\n")

        stem = "data/homo-sapiens-"
        cite_path = f"{stem}pubmed-citations.tsv"
        view_path = f"{stem}wikipedia-views.tsv"
        trends_path = f"{stem}gene-trends.tsv"
        merge_trends(cite_path, view_path, trends_path)

# Command-line handler
if __name__ == "__main__":
    usage = """
    python3 gene_trends/gene_trends.py --days 365
    python3 gene_trends/gene_trends.py --days 5 --hours-per-day 24 --only citations --sort-by count
    """
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        usage=usage
    )
    parser.add_argument(
        "--days",
        type=int,
        help=(
            "Number of days to analyze for citations.  " +
            "(default: %(default)i)"
        ),
        default=180
    )
    parser.add_argument(
        "--hours-per-day",
        type=int,
        help=(
            "Number of hours per day to analyze for views.  " +
            "(default: %(default)i)"
        ),
        default=24
    )
    parser.add_argument(
        "--only",
        nargs="*",
        help="Data types to include",
        choices=["views", "citations"]
    )
    parser.add_argument(
        "--sort-by",
        help=(
            "Metric by which to sort PubMed citations.  (default: %(default)s)"
        ),
        choices=["count", "delta", "rank", "rank_delta"],
        default="count"
    )
    parser.add_argument(
        "--debug",
        help=(
            "Get fast but incomplete data.  Dev setting.  Levels:" +
                "0: use default `days`, don't cache.  " +
                "1: use `days 2`, cache download but not compute.  " +
                "2: like `debug 1`, and cache intermediate compute.  " +
                "(default: %(default)i)"
        ),
        type=int,
        choices=[0, 1, 2],
        default=0
    )
    args = parser.parse_args()
    days = args.days
    hours_per_day = args.hours_per_day
    sort_by = args.sort_by
    only = args.only
    debug = args.debug

    GeneTrends(days, hours_per_day, sort_by, only, debug).run()
