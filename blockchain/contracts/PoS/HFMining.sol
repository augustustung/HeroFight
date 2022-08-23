// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../hero/IHFHero.sol";

contract Mining {
    // uint256 public mintedQuantity;
    // struct Mint {
    //     uint256 id;
    //     address owner;
    //     uint256 timestamp;
    //     uint256 amount;
    //     uint256 duration;
    //     uint256 contributeNFTId;
    //     uint256 receiveNFTId;
    // }
    // struct Package {
    //     uint8 id;
    //     uint256 amount;
    //     uint256 duration;
    // }
    // event Mined(
    //     uint256 indexed id,
    //     address indexed owner,
    //     uint256 amount,
    //     uint256 indexed duration,
    //     uint256 contributeNFTId,
    //     uint256 receiveNFTId
    // );
    // event Claimed(
    //     uint256 indexed id,
    //     address indexed owner,
    //     uint256 indexed tokenId,
    //     uint256 amount,
    //     uint256 duration
    // );
    // address _WDAtokenAddress;
    // address _owner;
    // Package[3] packages;
    // ICrownNFT CrownContract;
    // // maps address of user to stake
    // Mint[] vault;
    // constructor(address _token) {
    //     _WDAtokenAddress = _token;
    //     _owner = msg.sender;
    // }
    // /** ============== TEST ONLY ================ */
    // function setDuration(uint256 miningId, uint256 newDuration) public {
    //     vault[miningId].duration = newDuration;
    // }
    // function setCrownContract(address _CrownAddress) external {
    //     CrownContract = ICrownNFT(_CrownAddress);
    // }
    // uint256 maxPercentProposal = 10;
    // function setMaxPercentProposal(uint256 percent) external {
    //     maxPercentProposal = percent;
    // }
    // address WinDaoAddress;
    // function setWinDAOAddress(address _newWinDaoAddress) external {
    //     WinDaoAddress = _newWinDaoAddress;
    // }
    // uint256 unitToSecond = 60 * 60;
    // function setToSecond(uint256 newUnit) external {
    //     unitToSecond = newUnit;
    // }
    // /** ============== END OF TEST ONLY ============== */
    // function initialize() external {
    //     require(msg.sender == _owner, "Ownable: Not owner");
    //     packages[0].amount = 330000 * 10**18;
    //     packages[0].duration = 3; // MUST CHANGE TO 360
    //     packages[0].id = 0;
    //     packages[1].amount = 800000 * 10**18;
    //     packages[1].duration = 2; // MUST CHANGE TO 180
    //     packages[1].id = 1;
    //     packages[2].amount = 2000000 * 10**18;
    //     packages[2].duration = 1; // MUST CHANGE TO 90
    //     packages[2].id = 2;
    // }
    // function setProposal(uint256 percentChange, uint8 action) external {
    //     require(
    //         msg.sender == _owner || msg.sender == WinDaoAddress,
    //         "Ownable: Not owner"
    //     );
    //     require(percentChange <= maxPercentProposal, "Percentage too big");
    //     uint256 amountChangePackage1 = (packages[0].amount * percentChange) /
    //         100;
    //     uint256 amountChangePackage2 = (packages[1].amount * percentChange) /
    //         100;
    //     uint256 amountChangePackage3 = (packages[2].amount * percentChange) /
    //         100;
    //     if (action == 0) {
    //         packages[0].amount -= amountChangePackage1;
    //         packages[1].amount -= amountChangePackage2;
    //         packages[2].amount = amountChangePackage3;
    //     } else {
    //         packages[0].amount += amountChangePackage1;
    //         packages[1].amount += amountChangePackage2;
    //         packages[2].amount += amountChangePackage3;
    //     }
    // }
    // function getListPackage(uint256 nftId)
    //     external
    //     view
    //     returns (Package[3] memory)
    // {
    //     Package[3] memory finalPackages = packages;
    //     if (nftId != 0) {
    //         ICrownNFT.CrownTraits memory nftDetail = CrownContract.getTraits(
    //             nftId
    //         );
    //         finalPackages[0].amount -= ((finalPackages[0].amount *
    //             nftDetail.reduce) / 100);
    //         finalPackages[1].amount -= ((finalPackages[1].amount *
    //             nftDetail.reduce) / 100);
    //         finalPackages[2].amount -= ((finalPackages[2].amount *
    //             nftDetail.reduce) / 100);
    //     }
    //     return finalPackages;
    // }
    // /**
    //  * @param _miningId: 0, 1, 2
    //  * @param _nftId: apply nft to reduce fee
    //  */
    // function mint(uint256 _miningId, uint256 _nftId) external {
    //     require(CrownContract.totalSupply() < 5000, "Over Crown supply");
    //     Package memory finalPackage = packages[_miningId];
    //     if (_nftId != 0) {
    //         require(
    //             CrownContract.ownerOf(_nftId) == msg.sender,
    //             "Ownable: Not owner"
    //         );
    //         ICrownNFT.CrownTraits memory nftDetail = CrownContract.getTraits(
    //             _nftId
    //         );
    //         require(nftDetail.staked == false, "Crown staked");
    //         finalPackage.amount -= ((finalPackage.amount * nftDetail.reduce) /
    //             100);
    //     }
    //     uint256 allowance = IERC20(_WDAtokenAddress).allowance(
    //         msg.sender,
    //         address(this)
    //     );
    //     require(allowance >= finalPackage.amount, "Over allowance WDA");
    //     IERC20(_WDAtokenAddress).transferFrom(
    //         msg.sender,
    //         address(this),
    //         finalPackage.amount
    //     );
    //     if (_nftId != 0) {
    //         CrownContract.stakeOrUnstake(_nftId, true);
    //     }
    //     // mint crown for this mining
    //     uint256 receiveTokenId = CrownContract.mintValidTarget(1);
    //     vault.push(
    //         Mint(
    //             mintedQuantity,
    //             msg.sender,
    //             block.timestamp,
    //             finalPackage.amount,
    //             finalPackage.duration,
    //             _nftId,
    //             receiveTokenId
    //         )
    //     );
    //     emit Minted(
    //         mintedQuantity,
    //         msg.sender,
    //         finalPackage.amount,
    //         finalPackage.duration,
    //         _nftId,
    //         receiveTokenId
    //     );
    //     mintedQuantity++;
    // }
    // function claim(uint256 _miningId) external {
    //     Mint memory minted = vault[_miningId];
    //     require(msg.sender == minted.owner, "Ownable: Not owner");
    //     uint256 lastTimeCheck = minted.timestamp;
    //     uint256 miningDuration = minted.duration;
    //     // phải đúng thời hạn mới claim được
    //     require(
    //         block.timestamp >=
    //             (lastTimeCheck + (miningDuration * unitToSecond)),
    //         "Mining locked"
    //     );
    //     // delete mining
    //     if (minted.contributeNFTId != 0) {
    //         CrownContract.stakeOrUnstake(minted.contributeNFTId, false);
    //     }
    //     delete vault[_miningId];
    //     //
    //     CrownContract.transferFrom(
    //         address(this),
    //         msg.sender,
    //         minted.receiveNFTId
    //     );
    //     emit Claimed(
    //         minted.id,
    //         minted.owner,
    //         minted.receiveNFTId,
    //         minted.amount,
    //         minted.duration
    //     );
    //     IERC20(_WDAtokenAddress).transfer(msg.sender, minted.amount);
    // }
    // /**
    //  * @dev Transfers ownership of the contract to a new account (`newOwner`).
    //  * Can only be called by the current owner.
    //  */
    // function transferOwnership(address newOwner) public virtual {
    //     require(
    //         newOwner != address(0),
    //         "Ownable: new owner is the zero address"
    //     );
    //     require(msg.sender == _owner, "Ownable: Not owner");
    //     _transferOwnership(newOwner);
    // }
    // /**
    //  * @dev Transfers ownership of the contract to a new account (`newOwner`).
    //  * Internal function without access restriction.
    //  */
    // function _transferOwnership(address newOwner) internal virtual {
    //     _owner = newOwner;
    // }
}
