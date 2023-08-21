import { ethers } from 'ethers';
import fs from 'fs';

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

async function getBalance() {
    try {

        // providers
        const HARMProvider = new ethers.JsonRpcProvider('https://api.harmony.one/');
        const DFKCProvider = new ethers.JsonRpcProvider('https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc');
        const KLAYProvider = new ethers.JsonRpcProvider('https://klaytn.rpc.defikingdoms.com/');

        // total burn amounts
        const HARMJEWEL = new ethers.Contract("0x72Cb10C6bfA5624dD07Ef608027E366bd690048F", ERC20_ABI, HARMProvider);
        const DFKCJEWEL = await DFKCProvider.getBalance('0x000000000000000000000000000000000000dEaD');
        const DFKCValJEWEL = await DFKCProvider.getBalance('0x0000000000000000000000000000000000000000');
        const KLAYJEWEL = new ethers.Contract("0x30C103f8f5A3A732DFe2dCE1Cc9446f545527b43", ERC20_ABI, KLAYProvider);
        const tokenomicsBurn = 375328483.070918749502816906;

        // get and convert balances
        // harmong
        const balanceHARM = await HARMJEWEL.balanceOf('0x000000000000000000000000000000000000dEaD');
        const formattedHARM = Number(ethers.formatUnits(balanceHARM, 18));

        // DFKChain
        const formattedBalDFKCJewel = Number(ethers.formatUnits(DFKCJEWEL, 18));
        const formattedValDFKCJewel = Number(ethers.formatUnits(DFKCValJEWEL, 18));
        const totalDFKJ = formattedBalDFKCJewel + formattedValDFKCJewel - tokenomicsBurn;

        // Klaytn
        const balanceKLAY = await KLAYJEWEL.balanceOf('0x000000000000000000000000000000000000dEaD');
        const formattedKLAY = Number(ethers.formatUnits(balanceKLAY, 18));

        const totalBurn = totalDFKJ + formattedKLAY + formattedHARM;

        // Create query object
        const query = {
            day: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            totalBurn: totalBurn + ' JEWEL',
            difference: null,
        };

        // Read previous queries from JSON file
        let previousQueries = [];
        try {
            const fileData = fs.readFileSync('queries.json');
            previousQueries = JSON.parse(fileData);
        } catch (error) {
            console.error('Error reading queries.json:', error.message);
        }

        // Calculate difference from previous query
        if (previousQueries.length > 0) {
            const previousQuery = previousQueries[previousQueries.length - 1];
            const previousTotalBurn = parseFloat(previousQuery.totalBurn);
            query.difference = totalBurn - previousTotalBurn + ' JEWEL';
        }

        // Add current query to previous queries
        previousQueries.push(query);

        // Write updated queries to JSON file
        fs.writeFileSync('queries.json', JSON.stringify(previousQueries, null, 2));

        // Display query information
        console.log('Harmony Burn:', formattedHARM);
        console.log('DFKC Burn:', totalDFKJ);
        console.log('Klaytn Burn:', formattedKLAY);
        console.log('\nTotal Burn:', totalBurn + ' JEWEL');
        console.log('Difference from previous query:', query.difference);

    } catch (error) {

        console.error('Error:', error.message);
    }
}

getBalance();
