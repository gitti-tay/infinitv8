// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title INFINITV8 Investment Token
/// @notice ERC-1155 token representing tokenized RWA investments on Base.
///         Each tokenId maps to a project. Token amount equals USD invested (6 decimals).
contract INFINITV8Investment is ERC1155, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    struct ProjectConfig {
        bool active;
        uint256 minInvestment; // 6 decimals (e.g., 500e6 = $500)
        uint256 totalRaised;   // 6 decimals
        uint256 targetAmount;  // 6 decimals
    }

    address public treasury;
    mapping(uint256 => ProjectConfig) public projects;
    mapping(address => bool) public acceptedTokens;
    bool public ethAccepted;
    uint256 public ethPriceUsd; // 6 decimals (e.g., 3500e6 = $3,500)

    mapping(address => mapping(uint256 => uint256)) public userInvestment;

    event InvestmentMade(
        address indexed investor,
        uint256 indexed projectId,
        address paymentToken,
        uint256 paymentAmount,
        uint256 usdValue,
        uint256 tokensMinted
    );

    event ProjectConfigured(
        uint256 indexed projectId,
        uint256 minInvestment,
        uint256 targetAmount,
        bool active
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(
        address _treasury,
        string memory _uri
    ) ERC1155(_uri) {
        require(_treasury != address(0), "Zero treasury");
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);
    }

    // ─── Investment Functions ────────────────────────────────────────

    /// @notice Invest in a project using an accepted ERC-20 stablecoin (USDC/USDT).
    /// @param projectId The on-chain project identifier.
    /// @param paymentToken Address of the ERC-20 token (must be accepted).
    /// @param amount Amount in the token's smallest unit (6 decimals for USDC/USDT).
    function invest(
        uint256 projectId,
        address paymentToken,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(acceptedTokens[paymentToken], "Token not accepted");

        ProjectConfig storage proj = projects[projectId];
        require(proj.active, "Project not active");
        require(amount >= proj.minInvestment, "Below minimum");
        require(proj.totalRaised + amount <= proj.targetAmount, "Exceeds target");

        IERC20(paymentToken).safeTransferFrom(msg.sender, treasury, amount);

        proj.totalRaised += amount;
        userInvestment[msg.sender][projectId] += amount;

        _mint(msg.sender, projectId, amount, "");

        emit InvestmentMade(msg.sender, projectId, paymentToken, amount, amount, amount);
    }

    /// @notice Invest in a project using ETH. USD value is calculated from ethPriceUsd.
    /// @param projectId The on-chain project identifier.
    function investETH(uint256 projectId) external payable nonReentrant whenNotPaused {
        require(ethAccepted, "ETH not accepted");
        require(msg.value > 0, "No ETH sent");
        require(ethPriceUsd > 0, "ETH price not set");

        ProjectConfig storage proj = projects[projectId];
        require(proj.active, "Project not active");

        // msg.value is wei (18 decimals), ethPriceUsd is 6 decimals
        // result: 6 decimals USD
        uint256 usdValue = (msg.value * ethPriceUsd) / 1e18;
        require(usdValue >= proj.minInvestment, "Below minimum");
        require(proj.totalRaised + usdValue <= proj.targetAmount, "Exceeds target");

        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        proj.totalRaised += usdValue;
        userInvestment[msg.sender][projectId] += usdValue;

        _mint(msg.sender, projectId, usdValue, "");

        emit InvestmentMade(msg.sender, projectId, address(0), msg.value, usdValue, usdValue);
    }

    // ─── Admin Functions ─────────────────────────────────────────────

    function configureProject(
        uint256 projectId,
        uint256 minInvestment,
        uint256 targetAmount,
        bool active
    ) external onlyRole(MANAGER_ROLE) {
        projects[projectId] = ProjectConfig({
            active: active,
            minInvestment: minInvestment,
            totalRaised: projects[projectId].totalRaised,
            targetAmount: targetAmount
        });
        emit ProjectConfigured(projectId, minInvestment, targetAmount, active);
    }

    function setProjectActive(uint256 projectId, bool active) external onlyRole(MANAGER_ROLE) {
        projects[projectId].active = active;
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Zero address");
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    function setAcceptedToken(address token, bool accepted) external onlyRole(MANAGER_ROLE) {
        acceptedTokens[token] = accepted;
    }

    function setEthAccepted(bool accepted) external onlyRole(MANAGER_ROLE) {
        ethAccepted = accepted;
    }

    function setEthPrice(uint256 priceUsd) external onlyRole(MANAGER_ROLE) {
        ethPriceUsd = priceUsd;
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function withdrawToTreasury(address token, uint256 amount) external onlyRole(TREASURY_ROLE) {
        if (token == address(0)) {
            (bool sent, ) = treasury.call{value: amount}("");
            require(sent, "ETH withdraw failed");
        } else {
            IERC20(token).safeTransfer(treasury, amount);
        }
    }

    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    // ─── View Functions ──────────────────────────────────────────────

    function getProjectInfo(uint256 projectId)
        external
        view
        returns (bool active, uint256 minInvestment, uint256 totalRaised, uint256 targetAmount)
    {
        ProjectConfig storage p = projects[projectId];
        return (p.active, p.minInvestment, p.totalRaised, p.targetAmount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
