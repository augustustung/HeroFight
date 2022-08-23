// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../hero/IHFHero.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AuctionCrown is Ownable {
    // address wdaToken;
    // address daoTreasuryAddress; // Dao Treasury address
    // struct Auction {
    //     uint256 highestBid;
    //     uint256 withBnb;
    //     uint256 closingTime;
    //     address highestBidder;
    //     address originalOwner;
    //     bool isActive;
    //     uint256 totalBid;
    // }
    // // NFT id => Auction data
    // mapping(uint256 => Auction) public auctions;
    // // CrownNFT contract interface
    // ICrownNFT private sNft_;
    // // BNB balance
    // uint256 public balances;
    // uint256 constant SECONDS_PER_DAY = 24 * 60 * 60;
    // // initialize Time
    // uint256 private initTime;
    // // period days
    // uint256 public periodDays; //days
    // // BNB price
    // uint256 public priceBnb;
    // // BNB plus by periodDays
    // uint256 public decimalPlusBnb;
    // //avaibale currently Auction
    // bool public isAuction;
    // //id NFT is auctioning
    // uint256 public lastNftId;
    // //duration Time
    // uint256 public durationTime = 2 * 60 * 60;
    // //mapping of admin
    // mapping(address => bool) private adminHandle;
    // /**
    //  * @dev New Auction Opened Event
    //  * @param nftId Auction NFT Id
    //  * @param startingBid NFT starting bid price
    //  * @param withBnb Bnb with bid price
    //  * @param closingTime Auction close time
    //  * @param originalOwner Auction creator address
    //  */
    // event NewAuctionOpened(
    //     uint256 nftId,
    //     uint256 startingBid,
    //     uint256 withBnb,
    //     uint256 closingTime,
    //     address originalOwner
    // );
    // /**
    //  * @dev Auction Closed Event
    //  * @param nftId Auction NFT id
    //  * @param highestBid Auction highest bid
    //  * @param withBnb Bnb with bid price
    //  * @param highestBidder Auction highest bidder
    //  */
    // event AuctionClosed(
    //     uint256 nftId,
    //     uint256 highestBid,
    //     uint256 withBnb,
    //     address highestBidder,
    //     uint256 totalBid
    // );
    // /**
    //  * @dev Bid Placed Event
    //  * @param nftId Auction NFT id
    //  * @param bidPrice Bid price
    //  * @param withBnb with Bnb price
    //  * @param bidder Bidder address
    //  */
    // event BidPlaced(
    //     uint256 nftId,
    //     uint256 bidPrice,
    //     uint256 withBnb,
    //     address bidder
    // );
    // /**
    //  * @dev Receive BNB. msg.data is empty
    //  */
    // receive() external payable {
    //     balances += msg.value;
    // }
    // /**
    //  * @dev Receive BNB. msg.data is not empty
    //  */
    // fallback() external payable {
    //     balances += msg.value;
    // }
    // /**
    //  * @dev Contructor Smart contract
    //  * @param token_ address token
    //  */
    // constructor(address token_, address daoTreasuryAddress_) {
    //     wdaToken = token_;
    //     daoTreasuryAddress = daoTreasuryAddress_;
    //     adminHandle[msg.sender] = true;
    // }
    // /**
    //  * @dev Initialize states
    //  * @param _sNft CrownNFT contract address
    //  */
    // function initialize(address _sNft) external onlyAdmin {
    //     require(_sNft != address(0), "Invalid address");
    //     sNft_ = ICrownNFT(_sNft);
    //     balances = 0;
    //     periodDays = 30;
    //     priceBnb = 0.00001 * 10**18;
    //     initTime = block.timestamp;
    //     isAuction = false;
    //     decimalPlusBnb = 10;
    // }
    // /**
    //  * @dev Open Auction
    //  */
    // function openAuction() external onlyAdmin {
    //     require(isAuction == false, "One Auction is opening");
    //     //Mint Nft for Auction
    //     uint256 _nftId = sNft_.mintValidTarget(1);
    //     require(auctions[_nftId].isActive == false, "Ongoing auction detected");
    //     lastNftId = _nftId;
    //     isAuction = true;
    //     uint256 _withBnb = priceBnb + augmentBnb();
    //     // Opening new auction
    //     auctions[_nftId].highestBid = 0;
    //     auctions[_nftId].withBnb = _withBnb;
    //     auctions[_nftId].closingTime = block.timestamp + durationTime;
    //     auctions[_nftId].highestBidder = msg.sender;
    //     auctions[_nftId].originalOwner = msg.sender;
    //     auctions[_nftId].isActive = true;
    //     auctions[_nftId].totalBid = 0;
    //     emit NewAuctionOpened(
    //         _nftId,
    //         auctions[_nftId].highestBid,
    //         auctions[_nftId].withBnb,
    //         auctions[_nftId].closingTime,
    //         auctions[_nftId].highestBidder
    //     );
    // }
    // /**
    //  * @dev Place Bid
    //  */
    // function placeBid(uint256 _priceBid) external payable {
    //     require(isAuction == true, "Not found Auction is opening");
    //     require(auctions[lastNftId].isActive == true, "Not active auction");
    //     require(
    //         auctions[lastNftId].closingTime > block.timestamp,
    //         "Auction is closed"
    //     );
    //     require(
    //         msg.value >= auctions[lastNftId].withBnb,
    //         "With Bnb not enough"
    //     );
    //     require(_priceBid > auctions[lastNftId].highestBid, "Bid is too low");
    //     // check allowance of msg.sender
    //     uint256 allowance = IERC20(wdaToken).allowance(
    //         msg.sender,
    //         address(this)
    //     );
    //     require(allowance >= _priceBid, "Over allowance");
    //     // Holding : Transfer Amount of price Bid to SM Wallet
    //     bool holding = IERC20(wdaToken).transferFrom(
    //         msg.sender,
    //         address(this),
    //         _priceBid
    //     );
    //     require(holding, "Token can't hold");
    //     if (
    //         auctions[lastNftId].originalOwner !=
    //         auctions[lastNftId].highestBidder
    //     ) {
    //         //Transfer WDA token to Previous Highest Bidder
    //         bool backWDA = IERC20(wdaToken).transfer(
    //             auctions[lastNftId].highestBidder,
    //             auctions[lastNftId].highestBid
    //         );
    //         require(backWDA, "transfer WDA Token failed");
    //         // Transfer BNB to Previous Highest Bidder
    //         (bool sent, ) = payable(auctions[lastNftId].highestBidder).call{
    //             value: auctions[lastNftId].withBnb
    //         }("");
    //         require(sent, "Transfer BNB failed");
    //     }
    //     auctions[lastNftId].highestBid = _priceBid;
    //     auctions[lastNftId].withBnb = msg.value;
    //     auctions[lastNftId].highestBidder = msg.sender;
    //     auctions[lastNftId].totalBid = auctions[lastNftId].totalBid + 1;
    //     emit BidPlaced(
    //         lastNftId,
    //         auctions[lastNftId].highestBid,
    //         auctions[lastNftId].withBnb,
    //         auctions[lastNftId].highestBidder
    //     );
    // }
    // /**
    //  * @dev Close Auction
    //  */
    // function closeAuction() external onlyAdmin {
    //     require(isAuction == true, "Not found Auction is opening");
    //     require(auctions[lastNftId].isActive == true, "Not active auction");
    //     require(
    //         auctions[lastNftId].closingTime <= block.timestamp,
    //         "Lastest Auction is not closed"
    //     );
    //     if (auctions[lastNftId].highestBid == 0) {
    //         //Bids is empty, NFT will be burn
    //         sNft_.burn(lastNftId);
    //     } else {
    //         // Transfer BNB to Dao Treasury
    //         (bool sent, ) = payable(daoTreasuryAddress).call{
    //             value: auctions[lastNftId].withBnb
    //         }("");
    //         require(sent, "Transfer BNB failed");
    //         // Transfer NFT to Highest Bidder
    //         sNft_.transferFrom(
    //             address(this),
    //             auctions[lastNftId].highestBidder,
    //             lastNftId
    //         );
    //     }
    //     // Close Auction
    //     auctions[lastNftId].isActive = false;
    //     isAuction = false;
    //     emit AuctionClosed(
    //         lastNftId,
    //         auctions[lastNftId].highestBid,
    //         auctions[lastNftId].withBnb,
    //         auctions[lastNftId].highestBidder,
    //         auctions[lastNftId].totalBid
    //     );
    // }
    // /**
    //  * if owner want to force close a Auction
    //  */
    // function forceCloseAuction() external onlyAdmin {
    //     require(isAuction == true, "Not found Auction is opening");
    //     require(auctions[lastNftId].isActive == true, "Not active auction");
    //     if (auctions[lastNftId].highestBid > 0) {
    //         //Transfer WDA token to Previous Highest Bidder
    //         bool backWDA = IERC20(wdaToken).transfer(
    //             auctions[lastNftId].highestBidder,
    //             auctions[lastNftId].highestBid
    //         );
    //         require(backWDA, "transfer WDA Token failed");
    //         // Transfer BNB to Previous Highest Bidder
    //         (bool sent, ) = payable(auctions[lastNftId].highestBidder).call{
    //             value: auctions[lastNftId].withBnb
    //         }("");
    //         require(sent, "Transfer BNB failed");
    //     }
    //     //burn NFT
    //     sNft_.burn(lastNftId);
    //     // Close Auction
    //     auctions[lastNftId].isActive = false;
    //     isAuction = false;
    //     emit AuctionClosed(
    //         lastNftId,
    //         auctions[lastNftId].highestBid,
    //         auctions[lastNftId].withBnb,
    //         auctions[lastNftId].highestBidder,
    //         auctions[lastNftId].totalBid
    //     );
    // }
    // /**
    //  * @dev Withdraw BNB
    //  * @param _target Spender address
    //  * @param _amount Transfer amount
    //  */
    // function withdraw(address _target, uint256 _amount) external onlyAdmin {
    //     require(isAuction == false, "A auction is opening");
    //     require(_target != address(0), "Invalid address");
    //     require(_amount > 0 && _amount < balances, "Invalid amount");
    //     payable(_target).transfer(_amount);
    //     balances = balances - _amount;
    // }
    // /**
    //  * @dev Withdraw WDA token
    //  * @param _target Spender address
    //  * @param _amount Transfer amount
    //  */
    // function withdrawWDA(address _target, uint256 _amount) external onlyAdmin {
    //     require(isAuction == false, "A auction is opening");
    //     require(_target != address(0), "Invalid address");
    //     require(
    //         _amount > 0 && _amount < IERC20(wdaToken).balanceOf(address(this)),
    //         "Invalid amount"
    //     );
    //     IERC20(wdaToken).transferFrom(address(this), _target, _amount);
    // }
    // /*
    //  * @dev Set Dao Treasury Address
    //  * @param daoTreasuryAdress_ address
    //  */
    // function setDaoTreasuryAddress(address daoTreasuryAddress_)
    //     external
    //     onlyAdmin
    // {
    //     daoTreasuryAddress = daoTreasuryAddress_;
    // }
    // /*
    //  * Different beetween 2 timestamps
    //  */
    // function diffDays(uint256 fromTimestamp, uint256 toTimestamp)
    //     internal
    //     pure
    //     returns (uint256 _days)
    // {
    //     require(fromTimestamp <= toTimestamp);
    //     _days = (toTimestamp - fromTimestamp) / SECONDS_PER_DAY;
    // }
    // /**
    //  * calculate Augement Bnb by time
    //  */
    // function augmentBnb() internal view returns (uint256 _bnb) {
    //     uint256 _time = diffDays(initTime, block.timestamp) / periodDays;
    //     return ((_time * 2) / decimalPlusBnb) * 10**18;
    // }
    // /**
    //  * Set Period days
    //  */
    // function setAugmentBnb(uint256 days_, uint256 decimalPlusBnb_)
    //     public
    //     onlyAdmin
    // {
    //     periodDays = days_;
    //     decimalPlusBnb = decimalPlusBnb_;
    // }
    // function setDurationTime(uint256 duration_) public onlyAdmin {
    //     durationTime = duration_;
    // }
    // /**
    //  * set admin
    //  * target: target address
    //  * permission : true/false
    //  */
    // function setAdmin(address target, bool permission) external onlyOwner {
    //     adminHandle[target] = permission;
    // }
    // modifier onlyAdmin() {
    //     require(adminHandle[msg.sender]);
    //     _;
    // }
}
