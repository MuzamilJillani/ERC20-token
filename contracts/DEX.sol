// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    address owner;
    IERC20 public token;
    uint price;

    constructor(IERC20 _token, uint _price) {
        owner = msg.sender;
        price = _price;
        token = _token;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function sell() external onlyOwner {
        uint allowance = token.allowance(msg.sender, address(this));
        require(allowance > 0, "allow access to contract for at least 1 token");
        bool sent = token.transferFrom(msg.sender, address(this), allowance);
        require(sent);
    }

    function withdrawTokens() external onlyOwner {
        uint balance = token.balanceOf(address(this));
        bool sent = token.transfer(msg.sender, balance);
        require(sent);
    }

    function withdrawFunds() external onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent);
    }

    function buyTokens(uint numTokens) public payable {
        require(msg.value == getPrice(numTokens), "invalid amount");
        require(numTokens <= getTokenBalance(), "not enough tokens available");
        bool sent = token.transfer(msg.sender, numTokens);
        require(sent);
    }

    function getPrice(uint numTokens) public view returns (uint) {
        return numTokens * price;
    }

    function getTokenBalance() public view returns (uint) {
        return token.balanceOf(address(this));
    }
}
