import React, {useEffect, useState} from 'react'
import TrendsForm from './TrendsForm'
import {descending, tsv} from 'd3';
import TrendsTable from './TrendsTable';
import TrendsIdeogram from './TrendsIdeogram';
import TrendsTimeline from './TrendsTimeline';
import {Box, Card, CardContent, Container, Typography} from "@mui/material";

export default function TrendsDashboard() {
    const [geneWikiMap, setGeneWikiMap] = useState<Map<string, string>>(new Map())
    const [geneSymbols, setGeneSymbols] = useState<string[]>([]);
    const [selectedGene, setSelectedGene] = useState<string>();
    const [geneData, setGeneData] = useState<geneHintType[]>([]);
    useEffect(() => {
        const promises = [
            tsv('data/gene_page_map.tsv'), // from wiki
            tsv('data/homo-sapiens-pubmed-citations.tsv') // pubmed
        ]
        Promise.all(promises).then(([input, input2]) => {
            setGeneWikiMap(getGeneWikiMap(input));
            setGeneSymbols(getGeneSymbols(input2)); // from pubmed+wiki
            setGeneData(getGenes(input2));
            setSelectedGene(getTopCitedGene(input2))
        }).catch(error => {
            console.error(error)
        })
    }, [])

    const callback = (gene: string) => {
        setSelectedGene(gene);
        console.log(gene, geneWikiMap.get(gene))
    }
    return (
        <Container fixed>
            <Box sx={{ my: 3 }}>
                <Typography variant="h3" gutterBottom>
                    Gene Trends Dashboard
                </Typography>
                <hr/>
                <Typography variant="h5" sx={{color: 'grey'}} gutterBottom>
                    The popularity of genes over time can tell the story of society's focus on biomedicine and genomics.
                    <br/>
                </Typography>
            </Box>

            <Card variant="outlined" sx={{ my: 5 }}>
                <CardContent>
                    <Typography sx={{ py: 1 }} gutterBottom>
                        Select a gene you are interested in learning more about from the dropdown below:
                    </Typography>
                    <TrendsForm callback={callback} geneSymbols={geneSymbols} geneInfoMap={geneWikiMap}/>
                </CardContent>
            </Card>

            <Card variant="outlined" sx={{ my: 5, overflowX: 'clip' }}>
                    <Box component="div"
                         sx={{py: 3}}
                         id="trends-ideogram"
                    />
                    {selectedGene !== undefined &&
                        <TrendsIdeogram gene={selectedGene}/>
                    }
            </Card>

            <Card variant="outlined" sx={{ my: 5, overflowX: 'clip' }}>
                <CardContent>
                    {selectedGene !== undefined &&
                        <TrendsTimeline gene={selectedGene}/>
                    }

                    <Typography gutterBottom>
                        Longitudinal data exists for each gene: PubMed has publication citation counts and Wikipedia has
                        page view counts.
                    </Typography>
                </CardContent>
            </Card>

            <Box>
                {geneData.length > 0 && <TrendsTable geneData={geneData}/>}
            </Box>
        </Container>
    )
}

// data parsers
type geneInfoType = {
    'gene_symbol.value': string;
    title: string;
}

export type geneHintType = {
    'gene': string;
    'cites': number;
    'cite_delta': number;
    'cite_rank': number;
    'cite_rank_delta': number;
    // 'views':number;
    // 'view_delta':number;
    // 'view_rank':number;
    // 'view_rank_delta':number;
}

function getGeneWikiMap(data: any[]): Map<string, string> {
    let tempMap: Map<string, string> = new Map();

    (data as geneInfoType[]).forEach((d: geneInfoType) => {
        tempMap.set(d['gene_symbol.value'], d.title);
    })
    return tempMap;
}

function getGeneSymbols(data: any[]): string[] {
    return (data as geneHintType[]).map((d) => d.gene)
}

function getGenes(data: any[]): geneHintType[] {
    return (data.map((d) => {
        let _d = Object.assign({}, d) as geneHintType // make a hard copy

        _d.cites = parseInt(d.cites);
        _d.cite_delta = parseInt(d.cite_delta);
        _d.cite_rank = parseInt(d.cite_rank);
        _d.cite_rank_delta = parseInt(d.cite_rank_delta);
        // _d.views = parseInt(d.views);
        // _d.view_delta = parseInt(d.view_delta);
        // _d.view_rank = parseInt(d.view_rank);
        // _d.view_rank_delta = parseInt(d.view_rank_delta);
        return _d;
    }))
}

function getTopCitedGene(data: any[]): string {
    return data.sort((a, b) => descending(parseInt(a.cites), parseInt(b.cites))).slice(0, 1).map((d) => d.gene)[0]
}
