const { expect } = require("chai")

const expectFailure = async (fn, err) => {
  let failure
  try {
    await fn()
  } catch (e) {
    failure = e
  }
  expect(failure.message).to.include(err)
}

const num = n => Number(ethers.utils.formatEther(n))

describe('DiscountFastCash', () => {
  it('should work', async () => {
    const [
      _, __,
      god,
      centralBanker,
      platform,
      charity,
      luckyParticipant1,
      luckyParticipant2,
      luckyParticipant3,
      ...signers
    ] = await ethers.getSigners();


    FastCashMoneyPlus = await ethers.getContractFactory('FastCashMoneyPlus', god);
    DiscountFastCash = await ethers.getContractFactory('DiscountFastCash', god);
    deployedFastCashContract = await FastCashMoneyPlus.deploy();
    await deployedFastCashContract.deployed();
    deployedDiscountFastCashContract = await DiscountFastCash.deploy(deployedFastCashContract.address, platform.address, charity.address);
    await deployedDiscountFastCashContract.deployed();
    await deployedDiscountFastCashContract.connect(god).transferOwnership(centralBanker.address)

    expect(await deployedDiscountFastCashContract.fastcashContract()).to.equal(deployedFastCashContract.address)

    await deployedFastCashContract.connect(god).transferFromBank(deployedDiscountFastCashContract.address, ethers.utils.parseEther('2'))


    await deployedDiscountFastCashContract.connect(luckyParticipant1).buy({ value: ethers.utils.parseEther('0.25') })

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).buy({ value: ethers.utils.parseEther('0.25') }),
      "Your luck has run out"
    )


    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).flipIsLocked(),
      "Only owner can flip the lock"
    )

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).transferOwnership(luckyParticipant1.address),
      "Only owner can transfer ownership"
    )

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).updatePrice(ethers.utils.parseEther('0.1')),
      "Only owner can update the price"
    )

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).withdraw(ethers.utils.parseEther('0.1')),
      "Only owner can withdraw"
    )

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).updatePlatform(luckyParticipant1.address, 1),
      "Only owner can update platform info"
    )

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant1).updatePlatform(luckyParticipant1.address, 1),
      "Only owner can update platform info"
    )


    await deployedDiscountFastCashContract.connect(centralBanker).flipIsLocked()

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant2).buy({ value: ethers.utils.parseEther('0.25') }),
      "Discounts are locked up at the moment"
    )
    await deployedDiscountFastCashContract.connect(centralBanker).flipIsLocked()


    await deployedDiscountFastCashContract.connect(luckyParticipant2).buy({ value: ethers.utils.parseEther('0.25') })

    await expectFailure(
      () => deployedDiscountFastCashContract.connect(luckyParticipant3).buy({ value: ethers.utils.parseEther('0.25') }),
      "FastCash balance has run dry"
    )

    // luckyParticipant2.sendTransaction({
    //   to: deployedDiscountFastCashContract.address,
    //   value: ethers.utils.parseEther('100')
    // })



    console.log(`
      centralBankerBalance: ${num(await centralBanker.getBalance())}
      platformBalance: ${num(await platform.getBalance())}
      charityBalance: ${num(await charity.getBalance())}
      luckyParticipant1Balance: ${num(await luckyParticipant1.getBalance())}
      luckyParticipant2Balance: ${num(await luckyParticipant2.getBalance())}
      luckyParticipant3Balance: ${num(await luckyParticipant3.getBalance())}
      luckyParticipant1FCBalance: ${num(await deployedFastCashContract.balanceOf(luckyParticipant1.address))}
      luckyParticipant2FCBalance: ${num(await deployedFastCashContract.balanceOf(luckyParticipant2.address))}
    `)

  })
})

