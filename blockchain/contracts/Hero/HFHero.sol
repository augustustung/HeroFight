//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HFHero is ERC721Votes, ERC721Enumerable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    uint256 public constant maxSupply = 5000;
    uint256 public constant _transferCoolDown = (10 * 60) / 3;
    string[] public heroNames;

    struct HFHeroTraits {
        string name;
        uint8 reduce;
        uint8 aprBonus;
        bool staked;
        uint256 lockDeadline;
    }

    Counters.Counter private _tokenCounter;
    // 30days estimate 3s per block
    address private _owner;
    // Mapping token id to it's traits
    mapping(uint256 => HFHeroTraits) private _tokenIdToTraits;
    // Mapping address to valid target
    mapping(address => bool) private _validTarget;

    event MintHFHero(
        address indexed minter,
        uint256 indexed tokenId,
        string name,
        uint256 aprBonus,
        uint256 reduce
    );

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        EIP712(name_, "1")
    {
        _owner = msg.sender;
        _tokenCounter.increment();
    }

    /**
        @dev Setup marketplace for locking period 
     */
    function setValidTarget(address target, bool permission)
        external
        onlyOwner
    {
        _validTarget[target] = permission;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Get traits of NFT
    function getTraits(uint256 tokenId)
        public
        view
        returns (HFHeroTraits memory)
    {
        return _tokenIdToTraits[tokenId];
    }

    /**
     * @dev using this function for staking or unstaking the NFT to the stakingWDA or Mining pool. After staked the owner still have the vote power of the NFT staked.
     * @param tokenId - token id
     * @param status - state of the stake properties
     * Note: Clear the approve after staked or unstake.
     */
    function stakeOrUnstake(uint256 tokenId, bool status) external {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "CrownNFT:Not owner or approved"
        );
        _approve(address(0), tokenId);
        _tokenIdToTraits[tokenId].staked = status;
    }

    /**
     * @dev Only mint for the valid target
     * @param number - the number crown
     */
    function mintValidTarget(uint256 number) external returns (uint256) {
        require(_validTarget[msg.sender], "CrownNFT:Not valid target");
        for (uint256 i = 0; i < number; i++) {
            _mint(msg.sender, _tokenCounter.current());
            _tokenCounter.increment();
        }
        // TEST ONLY
        return _tokenCounter.current() - 1;
    }

    function _mint(address to, uint256 tokenId) internal override(ERC721) {
        require(totalSupply() < maxSupply, "CROWNNFT:More than total");
        uint8 randomNumber = uint8(
            uint256(keccak256(abi.encodePacked(block.timestamp, to, tokenId)))
        );
        uint8 reduce = (randomNumber % 21) + 10;
        uint8 aprBonus = uint8(
            (uint256(
                keccak256(abi.encodePacked(block.timestamp, reduce, tokenId))
            ) % 11)
        ) + 5;
        uint8 heroNameIndex = uint8(
            (uint256(
                keccak256(abi.encodePacked(block.timestamp, reduce, tokenId))
            ) % 11)
        ) % uint8(heroNames.length);
        // Create a random traits base on token id, timestamp, address of user
        _tokenIdToTraits[tokenId] = HFHeroTraits(
            heroNames[heroNameIndex],
            reduce,
            aprBonus,
            false,
            0
        );
        emit MintHFHero(
            to,
            tokenId,
            heroNames[heroNameIndex],
            aprBonus,
            reduce
        );
        super._mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Not owner or approved by owner"
        );
        delete _tokenIdToTraits[tokenId];
        _burn(tokenId);
    }

    function ownerToTokenArray(address account)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory ownerArray = new uint256[](balanceOf(account));
        for (uint256 i = 0; i < balanceOf(account); i++) {
            ownerArray[i] = tokenOfOwnerByIndex(account, i);
        }
        return ownerArray;
    }

    function getPastTokenLocked(address account, uint256 blockNumber)
        public
        view
        returns (uint256[] memory, uint256)
    {
        uint256[] memory ownerArray = ownerToTokenArray(account);
        uint256[] memory numberLocked = new uint256[](ownerArray.length);
        uint256 counter = 0;
        for (uint256 i = 0; i < ownerArray.length; i++) {
            if (getTraits(ownerArray[i]).lockDeadline > blockNumber) {
                numberLocked[counter] = ownerArray[i];
                counter++;
            }
        }
        return (numberLocked, counter);
    }

    function getPastVotes(address account, uint256 blockNumber)
        public
        view
        override(Votes)
        returns (uint256)
    {
        (, uint256 counter) = getPastTokenLocked(account, blockNumber);
        return super.getPastVotes(account, blockNumber) - counter;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId);
    }

    /**
     *  @dev override _transfer to specified that the tokenId should trading *  on the marketPlace.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) {
        HFHeroTraits storage traists = _tokenIdToTraits[tokenId];
        require(traists.staked == false, "CROWNNFT:Staked!");
        require(
            traists.lockDeadline == 0 || traists.lockDeadline < block.number,
            "CrownNFT:Locking!"
        );
        if (!_validTarget[to] && !_validTarget[from]) {
            traists.lockDeadline = block.number + _transferCoolDown;
        }
        super._transfer(from, to, tokenId);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0));
        _owner = newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "CrownNFT: Only owner");
        _;
    }
}
