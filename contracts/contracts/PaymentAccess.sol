// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PaymentAccess
/// @notice Production-ready, non-custodial payment-gated access contract for Rootstock.
/// @dev Uses OpenZeppelin's battle-tested Ownable, ReentrancyGuard, and Pausable for security.
contract PaymentAccess is Ownable, ReentrancyGuard, Pausable {
    /// Errors
    error PriceMustBeGreaterThanZero();
    error InsufficientPayment(uint256 sent, uint256 required);
    error NothingToWithdraw();
    error WithdrawFailed(uint256 balance, address recipient);

    /// Events
    event PaymentReceived(address indexed payer, uint256 amount, uint256 newTotalPaid);
    event AccessGranted(address indexed account, uint256 price);
    event Withdrawn(address indexed owner, uint256 amount);

    /// Storage
    uint256 public immutable price;
    mapping(address => bool) public hasAccess;
    mapping(address => uint256) public totalPaid;

    /// @param _price The fixed price (in wei) required to obtain access.
    /// @dev Initializes the contract with the owner set to the deployer.
    constructor(uint256 _price) Ownable(msg.sender) {
        if (_price == 0) revert PriceMustBeGreaterThanZero();
        price = _price;
    }

    /// @notice Pay for access using an explicit function call.
    /// @dev Grants access if the caller does not yet have it and pays at least `price`.
    /// @dev Reverts if contract is paused.
    function payForAccess() external payable whenNotPaused nonReentrant {
        _handlePayment(msg.sender, msg.value);
    }

    /// @notice Fallback receive function to handle plain RBTC transfers.
    /// @dev Mirrors `payForAccess` behavior.
    /// @dev Reverts if contract is paused.
    receive() external payable whenNotPaused nonReentrant {
        _handlePayment(msg.sender, msg.value);
    }

    /// @notice Fallback function to handle transfers with non-empty calldata.
    /// @dev Reverts with a clear error message to guide users to use `payForAccess()` or plain transfers.
    fallback() external payable {
        revert("Use payForAccess() function or send plain RBTC transfer");
    }

    /// @notice Withdraw the entire contract balance to the owner.
    /// @dev Reverts with detailed error information if the transfer fails.
    /// @dev Only callable by the contract owner.
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        address owner_ = owner();
        (bool success, ) = owner_.call{value: balance}("");
        if (!success) revert WithdrawFailed(balance, owner_);

        emit Withdrawn(owner_, balance);
    }

    /// @notice Pause the contract, preventing new payments.
    /// @dev Only callable by the contract owner.
    /// @dev Useful for emergency situations or maintenance.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract, allowing payments to resume.
    /// @dev Only callable by the contract owner.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Returns the contract's current RBTC balance.
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @dev Core payment handling logic shared by `payForAccess` and `receive`.
    function _handlePayment(address payer, uint256 amount) internal {
        if (amount < price && !hasAccess[payer]) {
            revert InsufficientPayment({sent: amount, required: price});
        }

        uint256 newTotal = totalPaid[payer] + amount;
        totalPaid[payer] = newTotal;

        emit PaymentReceived(payer, amount, newTotal);

        if (!hasAccess[payer]) {
            hasAccess[payer] = true;
            emit AccessGranted(payer, price);
        }
    }
}

