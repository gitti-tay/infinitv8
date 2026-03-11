// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/INFINITV8Investment.sol";

/// @notice Configure all 5 projects on the deployed INFINITV8Investment contract.
///         Run with: forge script script/ConfigureProjects.s.sol --rpc-url base --broadcast
contract ConfigureProjectsScript is Script {
    function run() external {
        address contractAddr = vm.envAddress("CONTRACT_ADDRESS");
        INFINITV8Investment investment = INFINITV8Investment(contractAddr);

        vm.startBroadcast();

        // Project 1: Bloombase Sterile Potato Seed (SPPS)
        // minInvestment: $5 = 5_000_000 (6 decimals), targetAmount: $5,000,000 = 5_000_000_000_000
        investment.configureProject(1, 5_000_000, 5_000_000_000_000, true);
        console.log("Configured project 1 (SPPS): min=$5, target=$5M");

        // Project 2: re:H Medical Device Distribution (MDD)
        // minInvestment: $5, targetAmount: $8,000,000
        investment.configureProject(2, 5_000_000, 8_000_000_000_000, true);
        console.log("Configured project 2 (MDD): min=$5, target=$8M");

        // Project 3: K-Beauty Clinic Bangkok (KBB)
        // minInvestment: $5, targetAmount: $4,000,000
        investment.configureProject(3, 5_000_000, 4_000_000_000_000, true);
        console.log("Configured project 3 (KBB): min=$5, target=$4M");

        // Project 4: Zero-Emission Waste Recycle Plant (WRP)
        // minInvestment: $5, targetAmount: $12,000,000
        investment.configureProject(4, 5_000_000, 12_000_000_000_000, true);
        console.log("Configured project 4 (WRP): min=$5, target=$12M");

        // Project 5: Prime City Real Estate Income (REI)
        // minInvestment: $5, targetAmount: $10,000,000
        investment.configureProject(5, 5_000_000, 10_000_000_000_000, true);
        console.log("Configured project 5 (REI): min=$5, target=$10M");

        vm.stopBroadcast();

        console.log("All 5 projects configured successfully!");
    }
}
