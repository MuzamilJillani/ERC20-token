const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("100");

  const DEX = await hre.ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(token.target, 100);

  await token.waitForDeployment();
  await dex.waitForDeployment();
  await writeDeploymentInfo(token, "token.json");
  await writeDeploymentInfo(dex, "dex.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const data = {
    contract: {
      address: contract.target,
      signerAddress: contract.runner.address,
      abi: contract.interface.format(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(`${filename}`, content, { encoding: "utf-8" });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
