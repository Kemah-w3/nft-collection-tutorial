//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {

    string _baseTokenURI;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEnded;
    uint256 maxTokenIds = 20;
    uint256 public tokenId;
    uint256 _price = 0.01 ether;
    bool public _paused;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract is currently paused!");
        _;
    }

    constructor(string memory baseURI, address whitelistContract) ERC721("CryptoDevs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;    
    }

    function presaleMint() public payable {
        require(presaleStarted && block.timestamp < presaleEnded);
        require(whitelist.whitelistedAddresses(msg.sender));
        require(tokenId < maxTokenIds, "Sold Out!");
        require(msg.value >= _price, "Invalid Mint Price!");

        tokenId += 1;

        _safeMint(msg.sender, tokenId);
    }

    function publicMint() public payable {
        require(presaleStarted && block.timestamp >= presaleEnded);
        require(tokenId < maxTokenIds, "Sold Out!");
        require(msg.value >= _price, "Invalid Mint Price!");

        tokenId += 1;

        _safeMint(msg.sender, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyWhenNotPaused {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Transfer Failed!");
    }

    receive() external payable{}
    fallback() external payable{}

}