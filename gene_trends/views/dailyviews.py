"""Output TSV of Wikipedia page views for all human genes in last 24 hours

This module downloads Wikipedia view counts for a pre-computed list of pages
(English Wikipedia articles) that have been mapped to gene symbols.
For example, the page https://en.wikipedia.org/wiki/Tumor_necrosis_factor maps
to the gene symbol TNF.  The map is made by `generate_gene_page_map.py`.
"""

import argparse
import csv
from datetime import datetime, timedelta
import os
import pathlib
import sys
from time import perf_counter
from urllib.parse import urljoin

# TODO: Consider Dask, pandas, or NumPy to speed up TSV processing
# https://medium.com/featurepreneur/pandas-vs-dask-the-power-of-parallel-computing-994a202a74bd

# Enable importing local modules when directly calling as script
if __name__ == "__main__":
    cur_dir = os.path.join(os.path.dirname(__file__))
    sys.path.append(cur_dir + "/..")

from lib import download_bz2

class DailyViews:
    WIKI_CODES = frozenset([
        'en.wikipedia',
    ])

    def __init__(
            self,
            cache=0,
            hours_per_day=24,
            output_dir="./data/",
            base_url='https://dumps.wikimedia.org/other/pageview_complete/',
        ):
        """Define relevant URLs and directories, do other setup
        """
        downloads_dir = output_dir + "tmp/views/"
        self.name_map_tsv_path =  output_dir + "gene_page_map.tsv"
        self.cache = cache
        self.hours_per_day = hours_per_day

        # Ensure needed directory exist
        if not os.path.exists(downloads_dir):
            os.makedirs(downloads_dir)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        self.output_dir = output_dir

        self.downloads_dir = downloads_dir
        self.base_url = base_url

        # Override CSV field limits, to handle errors in wiki pageviews files
        # (which breaks module otherwise)
        # Hoping not needed for pageview_complete data
        # csv.field_size_limit(sys.maxsize)

    def init_views_by_gene(self, genes_by_page):
        """Initialize map of page views by gene symbol
        """
        views_by_gene = {}
        for gene in genes_by_page.values():
            views_by_gene[gene] = 0
        print("\tFound", len(views_by_gene), "genes.")
        return views_by_gene

    def load_page_to_gene_map(self):
        """Load a map from Wikipedia page names to gene symbols from file.
        Map is made by `generate_gene_page_map.py`.
        """
        name_map = {}
        path = self.name_map_tsv_path
        print(f"Loading name map from {path}")
        with open(path, "rt") as f:
            reader = csv.reader(f, delimiter="\t")
            line_count = 0
            print("Processing file contents...")
            for row in reader:
                if line_count > 0:
                    name_map[row[0]] = row[1]
                line_count += 1
        return name_map

    def get_pageviews_download_url(self, time):
        return urljoin(
            self.base_url,
            time.strftime('%Y/%Y-%m/pageviews-%Y%m%d-user.bz2'),
        )

    def get_times_and_path(self, date):
        time = date.strftime("%m/%d/%Y")
        machine_time = date.strftime("%Y%m%d")
        path = f"{self.downloads_dir}pageview_complete_last.txt"
        return time, path, date

    def download_views_file(self, date):
        """Download and save Wikipedia views dump file
        """
        _, path, _ = self.get_times_and_path(date)
        url = self.get_pageviews_download_url(date)
        print(f"\tDownloading Wikipedia views daily data from {url}")
        download_bz2(url, path, cache=self.cache)

    def update_views(self, views_by_gene, row, genes_by_page):
        """Check a given row from Wikipedia pageview dump file, and add any
        views to the running total.  Takes in a dictionary of pageview counts
        per gene and a row of the pageview dump file of the format
        ["language", "page", "hourly_view_count", "always_zero_val"]
        E.g.: ["aa", "Main_Page", "4", "0"]
        """
        # Extra fields are page_id, user_agent_type, and hour_hits
        # log and ignore malformed rows (they happen rarely for unknonwn reasons)
        try:
            wiki_code, page_title, _, _, date_hits, _ = row
        except ValueError:
            # Wikimedia's README for the data says: "KNOWN ISSUE: rows
            # without Page IDs have only 5 columns, while rows with Page IDs
            # have 6."
            try:
                wiki_code, page_title, _, date_hits, _ = row
            except ValueError:
                print("\tEncountered malformwed row:", row)
                return views_by_gene
        if wiki_code not in self.WIKI_CODES:
            return views_by_gene
        try:
            gene = genes_by_page[page_title]
        except KeyError:
            return views_by_gene
        views_by_gene[gene] += int(date_hits)
        return views_by_gene

    def process_views_file(self, views_by_gene, genes_by_page, date):
        """Process the downloaded and zipped views file by adding all
        relevant views to the total count.
        """
        _, path, _ = self.get_times_and_path(date)
        print(f"\tProcessing pageview file contents at {path}")
        start_time = perf_counter()
        with open(path, "r") as f:
            for line_count, line in enumerate(f, 1):
                fields = line.split(None)
                views_by_gene = self.update_views(
                    views_by_gene, fields, genes_by_page
                )

        raw_perf_time = perf_counter() - start_time
        perf_time = round(raw_perf_time, 2)
        lps = f"{round(line_count / raw_perf_time):,} line/s"
        print(f"\t* Processed {line_count:,} lines in {perf_time} seconds ({lps})")
        return views_by_gene

    def save_to_file(self, views_by_gene, date):
        """Read the existing TSV file, and update the gene counts
        The file rows should be of the format:
        ["gene", "views", "prev_views"]
        """

        # Order the gene counts
        ordered_counts = sorted(
            views_by_gene.items(), key=lambda x: x[1], reverse=True
        )
        print("\nTop viewed gene pages:", dict(ordered_counts[:10]))
        print()

        path = pathlib.Path(
            self.output_dir,
            date.strftime('homo-sapiens-wikipedia-views-%Y-%m-%d.tsv'),
        )
        # Overwrite the file with new data
        with path.open('w') as f:
            headers = [
                "# gene",
                "views",
                "view_delta",
                "view_rank",
                "view_rank_delta"
            ]
            print(*headers, sep='\t', file=f)
            for rank, (gene, views) in enumerate(ordered_counts, 1):
                view_delta = views - self.prev_gene_views.get(gene, 0)
                # delta is 0 if the record did not exist before
                rank_delta = rank - self.prev_gene_ranks.get(gene, rank)
                print(gene, views, view_delta, rank, rank_delta, sep='\t', file=f)

        print(f"Wrote Wikipedia views output file to {path}")
        self.prev_gene_views = dict(views_by_gene)
        self.prev_gene_ranks = {
            gene: rank for rank, (gene, _) in enumerate(ordered_counts, 1)
        }

    def run(self, sort_by="count"):
        """Output TSV of recent Wikipedia page views for all human genes
        """
        start_time = perf_counter()

        genes_by_page = self.load_page_to_gene_map()
        today = datetime.utcnow().date()
        init_views_by_gene = self.init_views_by_gene(genes_by_page)
        self.prev_gene_views = dict(init_views_by_gene)
        self.prev_gene_ranks = {}

        for days_ago in range(180, 0, -1):
            date = today - timedelta(days=days_ago)
            self.download_views_file(date)
            views_by_gene = dict(init_views_by_gene)
            views_by_gene = self.process_views_file(
                views_by_gene, genes_by_page, date,
            )
            self.save_to_file(views_by_gene, date)

        perf_time = round(perf_counter() - start_time, 2) # E.g. 230.71
        print(f"Finished in {perf_time} seconds.\n\n")

# Command-line handler
if __name__ == "__main__":

    # Output docs atop this file upon invoking --help via CLI
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter
    ).parse_args()
    parser.add_argument(
        "--sort-by",
        help="Metric by which to sort Wikipedia views.  Count is views.",
        choices=["count", "delta", "rank", "rank_delta"],
        default="count"
    )
    parser.add_argument(
        "--cache",
        help=(
            "Get fast but incomplete data.  Dev setting.  Levels:" +
                "0: Don't cache.  " +
                "1: Cache download.  " +
                "(default: %(default)i)"
        ),
        choices=[0, 1],
        default=0
    )
    parser.add_argument(
        "--hours-per-day",
        help=(
            "Number of hours per day to analyze.  Dev setting.  " +
            "(default: %(default)i)"
        ),
        default=24
    )

    args = parser.parse_args()
    sort_by = args.sort_by
    cache = args.cache
    hours_per_day = args.hours_per_day

    # Run everything!
    DailyViews(cache, hours_per_day).run(sort_by)
