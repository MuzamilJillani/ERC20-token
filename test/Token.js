const { expect } = require("chai");

describe("Token", () => {
    let owner;
    let addr1;
    let addr2;
    let token;
    const totalSupply = "100";

    before(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(totalSupply);
    });

    describe("Deployment", () => {
        it("should asign total supply of token to owner/deployer", async () => {
            const ownerBalance = await token.balanceOf(owner);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        })
    })

    describe("Transaction", () => {
        it("should transfer tokens between accounts", async () => {
            expect (await token.transfer(addr1, 50)).to.changeTokenBalances(token, [addr1, owner], [50, -50]);
        })
        it("should not allow transfer of invalid amount", async () => {
            await expect(token.transfer(addr1, 51)).to.be.reverted;
        })
    })
});