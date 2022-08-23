// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HFHero is ERC20, Ownable {
    uint256 public _sellTax;
    uint256 public _buyTax;

    address public _rewardPool;

    mapping(address => bool) _liquidityAddress;
    mapping(address => bool) _exclusidAccount;

    event ChangeTax(uint256 sellTax, uint256 _buyTax);
    event SetLiquidity(address indexed liquidity);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    function setLiquidityAddress(address liquidity, bool permission)
        external
        onlyOwner
    {
        _liquidityAddress[liquidity] = permission;
        emit SetLiquidity(liquidity);
    }

    function setRewardPool(address rewardPool_) external onlyOwner {
        _rewardPool = rewardPool_;
    }

    function setTaxes(uint256 sellTax_, uint256 buyTax_) external onlyOwner {
        _sellTax = sellTax_;
        _buyTax = buyTax_;
        emit ChangeTax(sellTax_, buyTax_);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        uint256 amountTax = 0;
        if (_liquidityAddress[from]) {
            amountTax = (_buyTax * amount) / 100;
        } else if (_liquidityAddress[to]) {
            amountTax = (_sellTax * amount) / 100;
        }
        if (
            _exclusidAccount[from] ||
            _exclusidAccount[to] ||
            from == _rewardPool ||
            to == _rewardPool
        ) {
            amountTax = 0;
        }
        if (amountTax > 0) {
            super._transfer(from, _rewardPool, amountTax);
        }
        super._transfer(from, to, amount - amountTax);
    }
}
