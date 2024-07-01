import React, {useEffect, useState} from 'react'
import { makeStyles } from "@material-ui/core/styles";
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
    const [ideogram, setIdeogram] = useState(false)

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

    function updateSelectedGene(gene: string) {
        console.log('in updateSelectedGene')
        setSelectedGene(gene);
        console.log(gene, geneWikiMap.get(gene))
    }
    return (
        <Container fixed style={{maxWidth: '1400px'}}>
                <Typography variant="h3" gutterBottom>
                    Gene Trends
                    <Typography variant="h5" sx={{color: 'grey', display: 'inline', marginLeft: '40px'}} gutterBottom>
                    {/* Explore scholarly and general interest in genes over time */}
                    Explore scholarly interest in genes over time
                    <br/>
                </Typography>
                </Typography>
                <hr/>

            <Card className={'gene-trends light-card'} variant="outlined" sx={{ my: 5 }} style={{float: 'left'}}>
                <CardContent>
                    Search gene, find popularity metrics<br/><br/>
                    <TrendsForm callback={updateSelectedGene} geneSymbols={geneSymbols} geneInfoMap={geneWikiMap}/>
                </CardContent>
            </Card>

            <Card className={'gene-trends light-card'} variant="outlined" sx={{ my: 5, overflowX: 'clip'}}>
                    <Box component="div"
                         sx={{py: 3}}
                         id="trends-ideogram"
                    />
                    {selectedGene &&
                        <TrendsIdeogram
                          gene={selectedGene}
                          updateSelectedGene={updateSelectedGene}
                          ideogram={ideogram}
                          setIdeogram={setIdeogram}
                        />
                    }
            </Card>

            <Card variant="outlined" sx={{ my: 5, overflowX: 'clip' }}>
                <CardContent>
                    {selectedGene &&
                        <TrendsTimeline gene={selectedGene}/>
                    }
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
