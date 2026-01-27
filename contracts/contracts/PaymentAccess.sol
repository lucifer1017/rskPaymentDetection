// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PaymentAccess
/// @notice Minimal, non-custodial payment-gated access contract for Rootstock.
contract PaymentAccess {
    /// Errors
    error PriceMustBeGreaterThanZero();
    error InsufficientPayment(uint256 sent, uint256 required);
    error NotOwner();
    error NothingToWithdraw();
    error ReentrancyNotAllowed();

    /// Events
    event PaymentReceived(address indexed payer, uint256 amount, uint256 newTotalPaid);
    event AccessGranted(address indexed account, uint256 price);
    event Withdrawn(address indexed owner, uint256 amount);

    /// Storage
    address public immutable owner;
    uint256 public immutable price;
    mapping(address => bool) public hasAccess;
    mapping(address => uint256) public totalPaid;
    bool private _entered;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (_entered) revert ReentrancyNotAllowed();
        _entered = true;
        _;
        _entered = false;
    }

    /// @param _price The fixed price (in wei) required to obtain access.
    constructor(uint256 _price) {
        if (_price == 0) revert PriceMustBeGreaterThanZero();
        owner = msg.sender;
        price = _price;
    }

    /// @notice Pay for access using an explicit function call.
    /// @dev Grants access if the caller does not yet have it and pays at least `price`.
    function payForAccess() external payable nonReentrant {
        _handlePayment(msg.sender, msg.value);
    }

    /// @notice Fallback receive function to handle plain RBTC transfers.
    /// @dev Mirrors `payForAccess` behavior.
    receive() external payable nonReentrant {
        _handlePayment(msg.sender, msg.value);
    }

    /// @notice Withdraw the entire contract balance to the owner.
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert();

        emit Withdrawn(owner, balance);
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

