import React from "react";
import { Table, Button } from 'semantic-ui-react';
import KeyRow from "../KeyRow/KeyRow";
// import dateFns from "date-fns";
import HeaderCell from "../HeaderCell/HeaderCell";
import spreadsheet from '../../../google/spreadsheet';

function KeysTable({ headers, games, inverted }) {
    const [rowsToDisplay, setRowsToDisplay] = React.useState(50);
    const [sortingFunction, setSortingFunction] = React.useState({ callback: sortByDate });
    const [filters, setFilters] = React.useState([{ key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused'] }]);
    const [descending, setDescending] = React.useState(true);

    function addUsedFilter() {
        setFilters([...filters, { key: 'Status', values: ['Used'] }])
    }

    function sortByName(a, b) {
        return a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0;
    }

    function sortByDate(a, b) {
        const value = descending ? 1 : -1;
        // return new Date(b.Added) - new Date(a.Added);
        return new Date(a.Added) < new Date(b.Added) ? 1 * value : new Date(a.Added) > new Date(b.Added) ? -1 * value : 0;
    }

    return (
        <div>
            <Button onClick={() => { setRowsToDisplay(rowsToDisplay + 25) }}>load more</Button>
            <Button onClick={() => { spreadsheet.updateSingleCell() }}>write</Button>
            <Table celled structured inverted={inverted}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell></Table.HeaderCell>
                        {
                            headers.map(rowName => { return <HeaderCell filters={filters} header={rowName} values={['Used', 'Unused', 'Given']} key={rowName} /> })
                        }
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        games
                            .filter(game => {
                                let result = true;
                                filters.forEach(filter => { result = result && filter.values.some((currentValue) => { return game[filter.key] === currentValue }) });
                                return result;
                            })
                            .sort(sortingFunction.callback)
                            .map((game, index) => {
                                return index < rowsToDisplay && <KeyRow
                                    gameData={game}
                                    headers={headers}
                                    key={game.ssLocation.row}
                                />
                            })
                    }
                    {

                        false && Object.keys(games)
                            .map((game, keysIndex) => {
                                return games[game]
                                    .sort(sortingFunction.callback)
                                    .map((gameRow, gamesIndex) => {
                                        return keysIndex < rowsToDisplay && <KeyRow
                                            gameData={gameRow}
                                            isFirst={gamesIndex === 0}
                                            headers={headers}
                                            numberOfDuplicates={games[game].length}
                                            key={gameRow.ssLocation.row}
                                        ></KeyRow>
                                    })

                            })
                    }
                </Table.Body>
            </Table>
        </div>
    );
}

export default KeysTable;
