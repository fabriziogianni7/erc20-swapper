import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";

describe("ERC20Swapper", function () {
  let account_1 : Signer
  let account_2:Signer
  let account_3:Signer
  beforeEach(async () => {
    [account_1, account_2, account_3] = await ethers.getSigners();


  })
  it("general test", async () =>{
    expect(await account_1.getAddress()).equals(process.env.ACCOUNT_1)
  })

});
