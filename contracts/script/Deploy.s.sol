// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/INFINITV8Investment.sol";

contract DeployScript is Script {
    // Base mainnet token addresses
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant USDT_BASE = 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2;

    function run() external {
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        string memory metadataUri = vm.envOr("METADATA_URI", string("https://infinitv8.com/api/token-metadata/{id}"));

        vm.startBroadcast();

        INFINITV8Investment token = new INFINITV8Investment(treasury, metadataUri);

        // Accept stablecoins
        token.setAcceptedToken(USDC_BASE, true);
        token.setAcceptedToken(USDT_BASE, true);

        // Enable ETH with initial price
        uint256 ethPrice = vm.envOr("ETH_PRICE_USD", uint256(3500e6));
        token.setEthPrice(ethPrice);
        token.setEthAccepted(true);

        vm.stopBroadcast();

        console.log("INFINITV8Investment deployed at:", address(token));
        console.log("Treasury:", treasury);
    }
}
