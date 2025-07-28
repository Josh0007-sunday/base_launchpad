// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTCollection is ERC721 {
    uint256 public nextTokenId;
    uint256 public maxSupply;
    uint256 public mintPrice;
    address public creator;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address _creator
    ) ERC721(name, symbol) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        creator = _creator;
    }
    
    function mint(address to) external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(nextTokenId < maxSupply, "Max supply reached");
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }
}

contract Launchpad {
    address[] public deployedCollections;
    
    event CollectionCreated(
        address indexed collectionAddress,
        address indexed creator,
        string name,
        string symbol
    );
    
    function createCollection(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 mintPrice
    ) external returns (address) {
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            maxSupply,
            mintPrice,
            msg.sender
        );
        
        deployedCollections.push(address(newCollection));
        
        emit CollectionCreated(
            address(newCollection),
            msg.sender,
            name,
            symbol
        );
        
        return address(newCollection);
    }
    
    function getCollectionsCount() external view returns (uint256) {
        return deployedCollections.length;
    }
}