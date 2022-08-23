//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

interface IHFHero is IERC721, IERC721Enumerable {
    struct HFHeroTraits {
        uint256 reduce;
        uint256 aprBonus;
        uint256 lockDeadline;
        bool staked;
    }

    function getTraits(uint256) external view returns (HFHeroTraits memory);

    function mintValidTarget(uint256 number) external returns (uint256);

    function burn(uint256 tokenId) external;

    function stakeOrUnstake(uint256, bool) external;
}
