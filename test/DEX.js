const { expect } = require("chai"); 

describe("DEX", () => {
    let owner;
    let addr1;
    let addr2;

    const totalSupply = "100";
    const price = 100;

    let token;
    let dex; 

    before(async () => {
        [owner, addr1,addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(totalSupply);

        const DEX = await ethers.getContractFactory("DEX");
        dex = await DEX.deploy(token.target, price);
    });

    describe("Sell", () => {
        it("should fail if contract is not approved", async () => {
            await expect(dex.sell()).to.be.reverted;
        })
        it("should allow DEX to transfer tokens", async () => {
            await token.approve(dex.target, 100);
        })
        it("should not allow non-owners to call sell", async () => {
            await expect(dex.connect(addr1).sell()).to.be.reverted;
        })
        it("Sell should transfer tokens from owner to the contract", async () => {
            await expect(dex.sell()).to.changeTokenBalances(token, [owner.address, dex.target], [-100, 100]);
        })
    });

    describe("Getters", () => {
        it("should return correct token balance of the contract", async () => {
            const balance = await token.balanceOf(dex.target);
            expect(await dex.getTokenBalance()).to.equal(balance);
        })
        it("should return correct token price", async () => {
            expect(await dex.getPrice(10)).to.equal(10*price);
        })
    })

    describe("Buying", () => {
        it("should not allow user to buy with invalid amount", async () => {
            await expect(dex.connect(addr1).buyTokens(10, {value : 1100})).to.be.reverted;
        })
        it("should transfer tokens to the buying user upon valid transaction", async () => {
            expect(await dex.connect(addr1).buyTokens(10, {value : 1000})).to.changeTokenBalance(token, [addr1.address, dex.target], [10, -10]);
        })
        it("should fail if not enough tokens available", async () => {
            await expect(dex.connect(addr1).buyTokens(91, {value : 9100})).to.be.reverted;
        })
    })
    
    describe("Withdraw Tokens", () => {
        it("Non-owner cannot withdraw remaining tokens", async () => {
            await expect(dex.connect(addr1).withdrawTokens()).to.be.reverted;
        })
        it("Owner can withdraw remaining tokens", async () => {
            expect(await dex.withdrawTokens()).to.changeTokenBalance(token, [owner.address, dex.target], [90, -90]);
        })
    })

    describe("Withdraw Funds", () => {
        it("Non-owner cannot withdraw funds", async () => {
            await expect(dex.connect(addr1).withdrawFunds()).to.be.reverted;
        })
        it("Owner can withdraw funds", async () => {
            await expect(dex.withdrawFunds()).to.changeEtherBalances([owner.address, dex.target], [1000, -1000]);
        })
    })
})
