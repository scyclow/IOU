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

describe('IOU', () => {
  it('should work', async () => {
    const [
      _, __,
      god,
      owner,
      luckyParticipant1,
      luckyParticipant2,
      luckyParticipant3,
      ...signers
    ] = await ethers.getSigners();


    IOU = await ethers.getContractFactory('IOU', god);

    IOUContract = await IOU.deploy();
    await IOUContract.deployed();

    await IOUContract.connect(god).transferOwnership(owner.address)
    await IOUContract.connect(owner).batchSafeMint([
      owner.address,
      owner.address,
      owner.address,
      luckyParticipant1.address,
      luckyParticipant2.address,
      luckyParticipant3.address
    ])

    console.log(await IOUContract.connect(owner).ownerOf(0))
    console.log(await IOUContract.connect(owner).ownerOf(1))
    console.log(await IOUContract.connect(owner).ownerOf(2))
    console.log(await IOUContract.connect(owner).ownerOf(3))
    console.log(await IOUContract.connect(owner).ownerOf(4))
    console.log(await IOUContract.connect(owner).ownerOf(5))

    const metadata = await IOUContract.connect(owner).tokenURI(1)
    console.log(Buffer.from(metadata.split(',')[1], 'base64').toString('utf-8'))

    await IOUContract.connect(owner).flipUseURIPointer()

    const metadata2 = await IOUContract.connect(owner).tokenURI(1)

    console.log(metadata2)
    // console.log(Buffer.from(metadata2.split(',')[1], 'base64').toString('utf-8'))



  })
})

