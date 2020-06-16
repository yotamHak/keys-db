import React from "react";
import { Table, Dropdown } from "semantic-ui-react";

function FromCell({ from }) {
    const optionsDictionary = {
        'Humblebundle': 0,
        'Indiegala': 1,
        'DigitalHomicide': 2,
        'Amazon': 3,
        'Alienware': 4,
        'AMD': 5,
        'Desura': 6,
        'dlh.net': 7,
        'GamingDragons': 8,
        'IndieGameStand': 9,
        'Nuuvem': 10,
        'Gleam.io': 11,
        'Orlygift': 12,
        'Cursed': 13,
        'Groupees': 14,
        'GreenManGaming': 15,
        "Who'sGamingNow": 16,
        'Gamespot': 17,
        'YUPLAY': 18,
        'MMORPG': 19,
        'GameBundle': 20,
        'Playfield': 21,
        'OtakuMaker': 22,
        'Sega': 23,
        'Plati.ru': 24,
        'Tremor Games': 25,
        'GoGoBundle': 26,
        'CdKeys': 27,
        'Bunch of Keys': 28,
    }
    const options = [
        { key: 1, value: 1, text: 'Humblebundle' },
        { key: 2, value: 2, text: 'Indiegala' },
        { key: 3, value: 3, text: 'DigitalHomicide' },
        { key: 4, value: 4, text: 'Amazon' },
        { key: 5, value: 5, text: 'Alienware' },
        { key: 6, value: 6, text: 'AMD' },
        { key: 7, value: 7, text: 'Desura' },
        { key: 8, value: 8, text: 'dlh.net' },
        { key: 9, value: 9, text: 'GamingDragons' },
        { key: 10, value: 10, text: 'IndieGameStand' },
        { key: 11, value: 11, text: 'Nuuvem' },
        { key: 12, value: 12, text: 'Gleam.io' },
        { key: 13, value: 13, text: 'Orlygift' },
        { key: 14, value: 14, text: 'Cursed' },
        { key: 15, value: 15, text: 'Groupees' },
        { key: 16, value: 16, text: 'GreenManGaming' },
        { key: 17, value: 17, text: "Who'sGamingNow" },
        { key: 18, value: 18, text: 'Gamespot' },
        { key: 19, value: 19, text: 'YUPLAY' },
        { key: 20, value: 20, text: 'MMORPG' },
        { key: 21, value: 21, text: 'GameBundle' },
        { key: 22, value: 22, text: 'Playfield' },
        { key: 23, value: 23, text: 'OtakuMaker' },
        { key: 24, value: 24, text: 'Sega' },
        { key: 25, value: 25, text: 'Plati.ru' },
        { key: 26, value: 26, text: 'Tremor Games' },
        { key: 27, value: 27, text: 'GoGoBundle' },
        { key: 28, value: 28, text: 'CdKeys' },
        { key: 29, value: 29, text: 'Bunch of Keys' },
    ]

    const [currentlySelected, setCurrentlySelected] = React.useState(options[optionsDictionary[from]] || 0);

    function handleChange(e, selected) {
        from = options.filter(option => option.value === selected.value)[0].text;
        setCurrentlySelected(options.filter(option => option.value === selected.value)[0]);
    }

    return (
        <Table.Cell
        // positive={currentlySelected.value === 2}
        // negative={currentlySelected.value === 1}
        // warning={currentlySelected.value !== 1 && currentlySelected.value !== 2}           
        >
            <Dropdown
                onChange={handleChange}
                options={options}
                selection
                search
                value={currentlySelected.value}
            ></Dropdown>
        </Table.Cell>
    );
}

export default FromCell;
