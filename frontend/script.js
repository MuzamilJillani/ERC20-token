const provider = new ethers.providers.Web3Provider(window.ethereum);

let signer;

const tokenAbi = [
    "constructor(uint256 initialSupply) nonpayable",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
    "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)"
  ];
const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let tokenContract = null;

const dexAbi = [
    "constructor(address _token, uint256 _price) nonpayable",
    "function buyTokens(uint256 numTokens) payable",
    "function getPrice(uint256 numTokens) view returns (uint256)",
    "function getTokenBalance() view returns (uint256)",
    "function sell()",
    "function token() view returns (address)",
    "function withdrawFunds()",
    "function withdrawTokens()"
];
const dexAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let dexContract = null;

async function getAccess(){
    if(tokenContract) return;
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    dexContract = new ethers.Contract(dexAddress, dexAbi, signer);
}

async function getPrice(){
    await getAccess();

    const price = await dexContract.getPrice(1);
    document.getElementById("tokenPrice").innerHTML = price;
    return price;
}

async function getTokensAvailable(){
    await getAccess();

    const balance = await dexContract.getTokenBalance();
    document.getElementById("tokensAvailable").innerHTML = balance;
}

async function getTokenBalance(){
    await getAccess();

    const balance = await tokenContract.balanceOf(await signer.getAddress());
    document.getElementById("tokenBalance").innerHTML = balance;
}

async function approveTokens(){
    await getAccess();

    const numTokens = document.getElementById("accessTokens").value;
    await tokenContract.approve(dexAddress, numTokens).then(() => alert("success")).catch((error) => alert(error));
}

async function sellTokens(){
    await getAccess();

    await dexContract.sell().then(() => alert("success")).catch((error) => alert(error));
}

async function buy(){
    await getAccess();

    const numTokens = document.getElementById("buyTokens").value;
    const value = (await getPrice()) * numTokens;
    await dexContract.buyTokens(numTokens, {value : value}).then(() => alert("success")).catch((error) => alert(error));
}

