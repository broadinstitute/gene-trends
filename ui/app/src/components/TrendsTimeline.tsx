
import React, {useState, useEffect} from 'react'
import * as Plotly from 'plotly.js-dist-min'

type Props = {
  gene: string // a gene symbol, e.g. "ACE2"
}

export default function TrendsTimeline({gene}: Props) {
  useEffect(() => {
      addLineChart(gene)
    }, [gene]);

  return (
    <div id="line-chart-container">
    </div>
  )
}

async function addLineChart(gene: string) {
  const trendData = await fetchTrendData(gene)

  const viewsTrace = {
    x: trendData.views.x,
    y: trendData.views.y,
    name: 'Views in Wikipedia',
    type: 'scatter'
  };

  const citesTrace = {
    x: trendData.cites.x,
    y: trendData.cites.y,
    name: 'Citations in PubMed',
    type: 'scatter'
  };

  // var data = [viewsTrace, citesTrace];
  const data = [viewsTrace, citesTrace];

  const layout = {
    title: `Interest over time for gene: ${gene}`
  };

  Plotly.newPlot('line-chart-container', data as any, layout);
}

/**
 * Request time-series data for Wikipedia page views or PubMed citations, and
 * transform that TSV data into a format for Plotly.js line chart
 *
 * @param {String} gene: symbol of gene, e.g. "ACE2"
 * @param {String} source: either "views" or "cites"
 * @returns {Object} trace: arrays of X, Y values for a line in chart
 */
async function fetchCounts(gene: string, source: string) {
  // E.g. data/views/ACE2.tsv
  const baseUrl = 'https://raw.githubusercontent.com/broadinstitute/gene-trends/main/gene_files/gene_files_datesorted/'
  const url = `${baseUrl}${gene}_sorted.tsv`
  const response = await fetch(url)
  const text = await response.text()
  const xArray: string[] = []
  const yArray: number[] = []
  const xyObject = {x: xArray, y: yArray}
  const rows = text.split('\n')

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].split('\t')
    const date: string = row[1]
    const count: string = row[2]
    if (!count || isNaN(count as any)) continue // Skip e.g. header
    xyObject.x.push(date) // Time, e.g. "2020-01-15"
    xyObject.y.push(parseInt(count)) // Popularity / interest value -- an integer
  }
  return xyObject
}

async function fetchTrendData(gene: string) {
  const viewsXY = await fetchCounts(gene, 'views')
  const citesXY = await fetchCounts(gene, 'cites')
  const trendData = {views: viewsXY, cites: citesXY}
  return trendData
}

// document.addEventListener('DOMContentLoaded', function() {addLineChart(defaultGene)}, false);

