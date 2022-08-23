// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../hero/IHFHero.sol";

contract Staking {
    // uint256 public totalStaked;
    // struct Package {
    //     uint256 apr;
    //     uint256 duration;
    //     uint8 id;
    //     uint256 testLockTime;
    // }
    // /**
    //  * @param owner: address of user staked
    //  * @param timestamp: last time check
    //  * @param amount: amount that user spent
    //  */
    // struct Stake {
    //     uint256 stakeId;
    //     address owner;
    //     uint256 timestamp;
    //     uint256 amount;
    //     uint256 nftId;
    //     uint256 duration;
    //     uint256 apr;
    //     uint256 testLockTime;
    // }
    // event Staked(
    //     uint256 indexed stakeId,
    //     address indexed owner,
    //     uint256 amount,
    //     uint256 duration,
    //     uint256 apr,
    //     uint256 nftId
    // );
    // event Unstaked(
    //     uint256 indexed stakeId,
    //     address indexed owner,
    //     uint256 claimed
    // );
    // event Claimed(
    //     uint256 indexed stakeId,
    //     address indexed owner,
    //     uint256 indexed amount
    // );
    // address _WDAtokenAddress;
    // address _owner;
    // address _DaoTreasuryWallet;
    // ICrownNFT CrownContract;
    // // maps address of user to stake
    // Stake[] vault;
    // Package[4] packages;
    // constructor(address _token) {
    //     _WDAtokenAddress = _token;
    //     _owner = msg.sender;
    // }
    // //** -------------- TEST ONLY --------------- */
    // function setDuration(uint256 stakingId, uint256 newDurationTime) public {
    //     vault[stakingId].duration = newDurationTime;
    // }
    // function setCrownContract(address _CrownAddress) external {
    //     CrownContract = ICrownNFT(_CrownAddress);
    // }
    // function setDaoTreasuryWallet(address newAddress) external {
    //     _DaoTreasuryWallet = newAddress;
    // }
    // uint256 maxPercent = 10;
    // function setMaxPercent(uint256 maxP) external {
    //     maxPercent = maxP;
    // }
    // address WinDaoAddress;
    // function setWinDAOAddress(address _newDAOAddress) external {
    //     WinDaoAddress = _newDAOAddress;
    // }
    // uint256 unitToSecond = 60 * 60;
    // function setToSecond(uint256 newUnit) external {
    //     unitToSecond = newUnit;
    // }
    // function decreasingTime(uint256 stakingId, uint256 decreasingAmount)
    //     external
    // {
    //     vault[stakingId].timestamp -= decreasingAmount;
    // }
    // //** -------------- END OF TEST ONLY --------------- */
    // function initialize() external {
    //     require(msg.sender == _owner, "Ownable: Not owner");
    //     packages[0].apr = 100;
    //     packages[0].duration = 30;
    //     packages[0].id = 0;
    //     packages[0].testLockTime = 1;
    //     packages[1].apr = 138;
    //     packages[1].duration = 90;
    //     packages[1].id = 1;
    //     packages[1].testLockTime = 2;
    //     packages[2].apr = 220;
    //     packages[2].duration = 180;
    //     packages[2].testLockTime = 3;
    //     packages[2].id = 2;
    //     packages[3].apr = 5;
    //     packages[3].duration = 0;
    //     packages[3].id = 3;
    // }
    // /**
    //  * @dev function for the future voting for update staking v2
    //  */
    // function withdrawWDAToDAOTreasury() external {
    //     require(msg.sender == _owner);
    //     uint256 amount = IERC20(_WDAtokenAddress).balanceOf(address(this));
    //     IERC20(_WDAtokenAddress).transfer(_DaoTreasuryWallet, amount);
    // }
    // /**
    //  * @param percentChange: update percent proposal
    //  * @param action: 0 deceasing, 1: increasting
    //  */
    // function setProposal(uint256 percentChange, uint8 action) external {
    //     require(
    //         msg.sender == _owner || msg.sender == WinDaoAddress,
    //         "Ownable: Not owner"
    //     );
    //     require(percentChange <= maxPercent, "Percentage too big");
    //     if (action == 0) {
    //         packages[0].apr -= percentChange;
    //         packages[1].apr -= percentChange;
    //         packages[2].apr = percentChange;
    //     } else {
    //         packages[0].apr += percentChange;
    //         packages[1].apr += percentChange;
    //         packages[2].apr += percentChange;
    //     }
    // }
    // /**
    //  * @param nftId: 0-unuse
    //  */
    // function getListPackage(uint256 nftId)
    //     public
    //     view
    //     returns (Package[4] memory)
    // {
    //     Package[4] memory finalPackage = packages;
    //     if (nftId != 0) {
    //         ICrownNFT.CrownTraits memory nftDetail = CrownContract.getTraits(
    //             nftId
    //         );
    //         finalPackage[0].apr += nftDetail.aprBonus;
    //         finalPackage[1].apr += nftDetail.aprBonus;
    //         finalPackage[2].apr += nftDetail.aprBonus;
    //     }
    //     return finalPackage;
    // }
    // function _calculateEarned(uint256 stakingId, bool isGetAll)
    //     internal
    //     view
    //     returns (uint256)
    // {
    //     Stake memory ownerStaking = vault[stakingId];
    //     uint256 finalApr = ownerStaking.apr;
    //     if (ownerStaking.duration == 0) {
    //         uint256 stakedTimeClaim = (block.timestamp -
    //             ownerStaking.timestamp) / 1 days;
    //         uint256 earned = (ownerStaking.amount *
    //             finalApr *
    //             stakedTimeClaim) /
    //             100 /
    //             12 /
    //             30; // tiền lãi theo ngày * số ngày
    //         return isGetAll ? ownerStaking.amount + earned : earned;
    //     } else {
    //         return
    //             ownerStaking.amount +
    //             ((ownerStaking.duration * ownerStaking.amount * finalApr) /
    //                 100 /
    //                 30 /
    //                 12); // tiền lãi theo ngày * số ngày
    //     }
    // }
    // /**
    //  * @param _stakingId: 0 fixed - 30, 1 fixed - 90, 2 fixed - 180, 3: unfixed
    //  * @param _nftId: nft id for more % bonus nft
    //  * @param _amount: amount user spent
    //  */
    // function stake(
    //     uint8 _stakingId,
    //     uint256 _nftId,
    //     uint256 _amount
    // ) external {
    //     Package memory finalPackage = packages[_stakingId];
    //     if (_nftId != 0 && _stakingId != 3) {
    //         require(
    //             CrownContract.ownerOf(_nftId) == msg.sender,
    //             "Ownable: Not owner"
    //         );
    //         ICrownNFT.CrownTraits memory nftDetail = CrownContract.getTraits(
    //             _nftId
    //         );
    //         require(nftDetail.staked == false, "Crown staked");
    //         finalPackage.apr += nftDetail.aprBonus;
    //     }
    //     uint256 allowance = IERC20(_WDAtokenAddress).allowance(
    //         msg.sender,
    //         address(this)
    //     );
    //     require(allowance >= _amount, "Over allowance WDA");
    //     IERC20(_WDAtokenAddress).transferFrom(
    //         msg.sender,
    //         address(this),
    //         _amount
    //     );
    //     if (_nftId != 0 && _stakingId != 3) {
    //         CrownContract.stakeOrUnstake(_nftId, true);
    //     }
    //     totalStaked += _amount;
    //     uint256 newStakeId = vault.length;
    //     vault.push(
    //         Stake(
    //             newStakeId,
    //             msg.sender,
    //             block.timestamp,
    //             _amount,
    //             _stakingId != 3 ? _nftId : 0,
    //             finalPackage.duration,
    //             finalPackage.apr,
    //             finalPackage.testLockTime
    //         )
    //     );
    //     emit Staked(
    //         newStakeId,
    //         msg.sender,
    //         _amount,
    //         finalPackage.duration,
    //         finalPackage.apr,
    //         _nftId
    //     );
    // }
    // function claim(uint256 _stakingId) external {
    //     Stake memory staked = vault[_stakingId];
    //     require(msg.sender == staked.owner, "Ownable: Not owner");
    //     uint256 lastTimeCheck = staked.timestamp;
    //     uint256 stakeDuration = staked.duration;
    //     if (stakeDuration != 0) {
    //         require(
    //             block.timestamp >=
    //                 (lastTimeCheck + (staked.testLockTime * unitToSecond)),
    //             "Staking locked"
    //         );
    //     }
    //     uint256 earned = _calculateEarned(_stakingId, false);
    //     if (stakeDuration != 0) {
    //         totalStaked -= staked.amount;
    //         _deleteStakingPackage(_stakingId); // gói cố định rút xong thì unstake luôn
    //     } else {
    //         vault[_stakingId].timestamp = uint32(block.timestamp);
    //     }
    //     if (earned > 0) {
    //         IERC20(_WDAtokenAddress).transfer(msg.sender, earned);
    //         emit Claimed(_stakingId, msg.sender, earned);
    //     }
    // }
    // function unstake(uint256 _stakingId) external {
    //     Stake memory staked = vault[_stakingId];
    //     require(staked.duration == 0, "Cannot unstake fixed staking package");
    //     require(msg.sender == staked.owner, "Ownable: Not owner");
    //     // xoá staking
    //     uint256 earned = _calculateEarned(_stakingId, true);
    //     totalStaked -= staked.amount;
    //     _deleteStakingPackage(_stakingId);
    //     emit Unstaked(_stakingId, msg.sender, earned);
    //     if (earned > 0) {
    //         IERC20(_WDAtokenAddress).transfer(msg.sender, earned);
    //         emit Claimed(_stakingId, msg.sender, earned);
    //     }
    // }
    // function getEarned(uint256 stakingId) external view returns (uint256) {
    //     return _calculateEarned(stakingId, true);
    // }
    // function _deleteStakingPackage(uint256 stakingId) internal {
    //     if (vault[stakingId].nftId != 0) {
    //         CrownContract.stakeOrUnstake(vault[stakingId].nftId, false);
    //     }
    //     delete vault[stakingId];
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
