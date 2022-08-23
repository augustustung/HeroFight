// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../Hero/IHFHero.sol";

contract Market is ERC1155Receiver, IERC721Receiver {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    address _owner;
    IHFHero HFHeroContract;

    constructor() {
        _owner = msg.sender;
    }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }
    mapping(uint256 => MarketItem) private idToMarketItem;
    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    event BuyMarketItem(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        address buyer
    );
    event WithdrawItem(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address owner
    );

    /**
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            );
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return
            bytes4(
                keccak256(
                    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"
                )
            );
    }

    function setHFHeroContract(address _newAddress) external {
        HFHeroContract = IHFHero(_newAddress);
    }

    /*
     @param
     tokenId: token id
     price: wei
    */
    function createMarketItem(uint256 tokenId, uint256 price) external {
        // validate price
        require(price > 0, "Price must be at least 1 wei");
        HFHeroContract.transferFrom(msg.sender, address(this), tokenId);
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            payable(msg.sender),
            price
        );
        emit MarketItemCreated(itemId, tokenId, msg.sender, price);
    }

    function buyMarketItem(uint256 itemIndex) public payable {
        MarketItem memory currentItem = idToMarketItem[itemIndex];
        require(currentItem.seller != msg.sender, "Can not buy your item");
        uint256 totalPrice = currentItem.price;
        require(
            msg.value >= totalPrice,
            "Please submit the asking price in order to complete the purchase"
        );
        // sell successfully => tax sell 5% of market item's price
        uint256 taxSell = (totalPrice * 5) / 100;
        uint256 tokenId = currentItem.tokenId;
        // send Token to seller
        (bool sent, ) = payable(currentItem.seller).call{
            value: totalPrice - taxSell
        }("");
        require(sent, "Transfer Token to seller failed");
        // send tax sell to DAO treasury
        (bool sentTx, ) = payable(_owner).call{value: taxSell}(""); // transfer Token
        require(sentTx, "Transfer Token to DAO Treasury failed");
        // transfer market item to buyer
        delete idToMarketItem[itemIndex];

        HFHeroContract.transferFrom(address(this), msg.sender, tokenId);
        // remove market item
        emit BuyMarketItem(
            currentItem.itemId,
            tokenId,
            totalPrice,
            currentItem.seller,
            msg.sender
        );
    }

    function withdrawNFT(uint256 itemId)
        external
        onlyOwnerOf(idToMarketItem[itemId].seller)
    {
        MarketItem memory item = idToMarketItem[itemId];
        delete idToMarketItem[itemId];
        HFHeroContract.transferFrom(address(this), msg.sender, item.tokenId);
        emit WithdrawItem(item.itemId, item.tokenId, item.seller);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner)
        public
        virtual
        onlyOwnerOf(_owner)
    {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        _owner = newOwner;
    }

    modifier onlyOwnerOf(address _ownerAddress) {
        require(msg.sender == _ownerAddress, "Ownable: Not owner");
        _;
    }
}
