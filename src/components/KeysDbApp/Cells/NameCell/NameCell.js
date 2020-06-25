import React from "react";
import { Table } from "semantic-ui-react";
import SearchModal from "../../Modals/SearchModal/SearchModal";

function NameCell({ name }) {
    // function findGame(name) {
    //     setSearchValue(name)
    //     setShowModal(true)
    // }

    // function gameSelected() {

    // }

    function onSelect(name) {
        console.log(name)
    }

    return (
        <SearchModal onSelect={onSelect} initialValue={name}>
            <Table.Cell className={'pointer'}>{name}</Table.Cell>
        </SearchModal>
    );
}

export default NameCell;
