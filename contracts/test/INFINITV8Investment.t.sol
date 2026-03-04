// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/INFINITV8Investment.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Minimal ERC-20 mock for testing.
contract MockERC20 is ERC20 {
    uint8 private _dec;

    constructor(string memory name, string memory symbol, uint8 dec_) ERC20(name, symbol) {
        _dec = dec_;
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract INFINITV8InvestmentTest is Test {
    INFINITV8Investment public token;
    MockERC20 public usdc;
    MockERC20 public usdt;

    address public admin = address(1);
    address public treasury = address(2);
    address public investor = address(3);
    address public investor2 = address(4);

    uint256 constant PROJECT_1 = 1;
    uint256 constant MIN_INVEST = 500e6;      // $500
    uint256 constant TARGET = 5_000_000e6;    // $5M

    function setUp() public {
        vm.startPrank(admin);

        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdt = new MockERC20("Tether USD", "USDT", 6);

        token = new INFINITV8Investment(treasury, "https://infinitv8.com/api/token-metadata/{id}");

        token.setAcceptedToken(address(usdc), true);
        token.setAcceptedToken(address(usdt), true);
        token.setEthAccepted(true);
        token.setEthPrice(3500e6); // $3,500

        token.configureProject(PROJECT_1, MIN_INVEST, TARGET, true);

        vm.stopPrank();

        // Fund investors
        usdc.mint(investor, 100_000e6);
        usdt.mint(investor, 100_000e6);
        vm.deal(investor, 100 ether);

        usdc.mint(investor2, 100_000e6);
    }

    // ─── Invest with USDC ────────────────────────────────────────

    function test_investUSDC() public {
        uint256 amount = 1000e6; // $1,000

        vm.startPrank(investor);
        usdc.approve(address(token), amount);
        token.invest(PROJECT_1, address(usdc), amount);
        vm.stopPrank();

        assertEq(token.balanceOf(investor, PROJECT_1), amount);
        assertEq(usdc.balanceOf(treasury), amount);
        assertEq(token.userInvestment(investor, PROJECT_1), amount);

        (,, uint256 raised,) = token.getProjectInfo(PROJECT_1);
        assertEq(raised, amount);
    }

    function test_investUSDT() public {
        uint256 amount = 2500e6;

        vm.startPrank(investor);
        usdt.approve(address(token), amount);
        token.invest(PROJECT_1, address(usdt), amount);
        vm.stopPrank();

        assertEq(token.balanceOf(investor, PROJECT_1), amount);
        assertEq(usdt.balanceOf(treasury), amount);
    }

    function test_investETH() public {
        uint256 ethAmount = 1 ether; // $3,500 at ethPriceUsd=3500e6
        uint256 expectedUsd = 3500e6;

        vm.prank(investor);
        token.investETH{value: ethAmount}(PROJECT_1);

        assertEq(token.balanceOf(investor, PROJECT_1), expectedUsd);
        assertEq(treasury.balance, ethAmount);
    }

    function test_multipleInvestments() public {
        vm.startPrank(investor);
        usdc.approve(address(token), 3000e6);
        token.invest(PROJECT_1, address(usdc), 1000e6);
        token.invest(PROJECT_1, address(usdc), 2000e6);
        vm.stopPrank();

        assertEq(token.balanceOf(investor, PROJECT_1), 3000e6);
        assertEq(token.userInvestment(investor, PROJECT_1), 3000e6);
    }

    function test_multipleInvestors() public {
        vm.startPrank(investor);
        usdc.approve(address(token), 1000e6);
        token.invest(PROJECT_1, address(usdc), 1000e6);
        vm.stopPrank();

        vm.startPrank(investor2);
        usdc.approve(address(token), 2000e6);
        token.invest(PROJECT_1, address(usdc), 2000e6);
        vm.stopPrank();

        assertEq(token.balanceOf(investor, PROJECT_1), 1000e6);
        assertEq(token.balanceOf(investor2, PROJECT_1), 2000e6);
        (,, uint256 raised,) = token.getProjectInfo(PROJECT_1);
        assertEq(raised, 3000e6);
    }

    // ─── Revert Cases ────────────────────────────────────────────

    function test_revert_belowMinimum() public {
        vm.startPrank(investor);
        usdc.approve(address(token), 100e6);
        vm.expectRevert("Below minimum");
        token.invest(PROJECT_1, address(usdc), 100e6);
        vm.stopPrank();
    }

    function test_revert_exceedsTarget() public {
        // Configure a small project
        vm.prank(admin);
        token.configureProject(2, 500e6, 1000e6, true);

        vm.startPrank(investor);
        usdc.approve(address(token), 1500e6);
        vm.expectRevert("Exceeds target");
        token.invest(2, address(usdc), 1500e6);
        vm.stopPrank();
    }

    function test_revert_inactiveProject() public {
        vm.prank(admin);
        token.setProjectActive(PROJECT_1, false);

        vm.startPrank(investor);
        usdc.approve(address(token), 1000e6);
        vm.expectRevert("Project not active");
        token.invest(PROJECT_1, address(usdc), 1000e6);
        vm.stopPrank();
    }

    function test_revert_unacceptedToken() public {
        MockERC20 badToken = new MockERC20("Bad", "BAD", 6);
        badToken.mint(investor, 1000e6);

        vm.startPrank(investor);
        badToken.approve(address(token), 1000e6);
        vm.expectRevert("Token not accepted");
        token.invest(PROJECT_1, address(badToken), 1000e6);
        vm.stopPrank();
    }

    function test_revert_paused() public {
        vm.prank(admin);
        token.pause();

        vm.startPrank(investor);
        usdc.approve(address(token), 1000e6);
        vm.expectRevert();
        token.invest(PROJECT_1, address(usdc), 1000e6);
        vm.stopPrank();
    }

    function test_revert_ethNotAccepted() public {
        vm.prank(admin);
        token.setEthAccepted(false);

        vm.prank(investor);
        vm.expectRevert("ETH not accepted");
        token.investETH{value: 1 ether}(PROJECT_1);
    }

    function test_revert_ethPriceNotSet() public {
        vm.prank(admin);
        token.setEthPrice(0);

        vm.prank(investor);
        vm.expectRevert("ETH price not set");
        token.investETH{value: 1 ether}(PROJECT_1);
    }

    // ─── Access Control ──────────────────────────────────────────

    function test_onlyManagerCanConfigure() public {
        vm.prank(investor);
        vm.expectRevert();
        token.configureProject(99, 100e6, 1000e6, true);
    }

    function test_onlyAdminCanSetTreasury() public {
        vm.prank(investor);
        vm.expectRevert();
        token.setTreasury(address(5));
    }

    function test_setTreasury() public {
        address newTreasury = address(10);
        vm.prank(admin);
        token.setTreasury(newTreasury);
        assertEq(token.treasury(), newTreasury);
    }

    function test_revert_zeroTreasury() public {
        vm.prank(admin);
        vm.expectRevert("Zero address");
        token.setTreasury(address(0));
    }

    // ─── Pause / Unpause ─────────────────────────────────────────

    function test_pauseUnpause() public {
        vm.startPrank(admin);
        token.pause();
        assertTrue(token.paused());
        token.unpause();
        assertFalse(token.paused());
        vm.stopPrank();
    }

    // ─── Event Emissions ─────────────────────────────────────────

    function test_emitsInvestmentMade() public {
        uint256 amount = 1000e6;

        vm.startPrank(investor);
        usdc.approve(address(token), amount);

        vm.expectEmit(true, true, false, true);
        emit INFINITV8Investment.InvestmentMade(investor, PROJECT_1, address(usdc), amount, amount, amount);

        token.invest(PROJECT_1, address(usdc), amount);
        vm.stopPrank();
    }

    function test_emitsProjectConfigured() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit INFINITV8Investment.ProjectConfigured(99, 100e6, 500e6, true);
        token.configureProject(99, 100e6, 500e6, true);
    }

    // ─── Withdraw ────────────────────────────────────────────────

    function test_withdrawERC20() public {
        // Send some USDC to the contract directly
        usdc.mint(address(token), 500e6);

        vm.prank(admin);
        token.withdrawToTreasury(address(usdc), 500e6);

        assertEq(usdc.balanceOf(treasury), 500e6);
    }

    function test_withdrawETH() public {
        // Send ETH to the contract
        vm.deal(address(token), 1 ether);

        vm.prank(admin);
        token.withdrawToTreasury(address(0), 1 ether);

        assertEq(treasury.balance, 1 ether);
    }

    // ─── ERC-1155 Interface ──────────────────────────────────────

    function test_supportsInterface() public view {
        assertTrue(token.supportsInterface(type(IERC1155).interfaceId));
        assertTrue(token.supportsInterface(type(IAccessControl).interfaceId));
    }
}
