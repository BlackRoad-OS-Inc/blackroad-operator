// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Lucidia RoadChain Ledger
/// @author You
/// @notice Symbolic truth ledger for Codex Infinity

contract RoadChain {
    struct TruthEntry {
        address author;
        string statement;
        uint256 timestamp;
    }

    TruthEntry[] public ledger;

    event TruthWritten(address indexed author, string statement, uint256 time);

    function writeTruth(string calldata statement) external {
        ledger.push(TruthEntry(msg.sender, statement, block.timestamp));
        emit TruthWritten(msg.sender, statement, block.timestamp);
    }

    function getTruth(uint index) public view returns (address, string memory, uint256) {
        require(index < ledger.length, "Invalid index");
        TruthEntry memory entry = ledger[index];
        return (entry.author, entry.statement, entry.timestamp);
    }

    function getTotalTruths() public view returns (uint) {
        return ledger.length;
    }
}

