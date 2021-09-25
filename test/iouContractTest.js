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
      proxy,
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

    await IOUContract.connect(owner).updateMetadataParams(
      'SomethingElse #',
      'prettyPictures/',
      '.jpg',
      'www.google.com/tokenPage/',
    )
    await IOUContract.connect(owner).updateProjectDescription('new description')


    const metadata2 = await IOUContract.connect(owner).tokenURI(1)
    console.log(Buffer.from(metadata2.split(',')[1], 'base64').toString('utf-8'))

    await IOUContract.connect(owner).flipUseURIPointer()

    const metadata3 = await IOUContract.connect(owner).tokenURI(1)

    console.log(metadata3)

    console.log(`owner before revoke: ${await IOUContract.connect(owner).ownerOf(5)}`)
    await IOUContract.connect(owner).revoke(5)

    console.log(`owner after revoke: ${await IOUContract.connect(owner).ownerOf(5)}`)

    await IOUContract.connect(owner).emitProjectEvent('Hello project')
    await IOUContract.connect(owner).emitTokenEvent(4, 'Hello token 4')
    await IOUContract.connect(luckyParticipant2).emitTokenEvent(4, 'Hello token 4 holder')

    expectFailure(() => IOUContract.connect(luckyParticipant1).revoke(1), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).safeMint(luckyParticipant1.address), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).batchSafeMint([luckyParticipant1.address]), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).flipUseURIPointer(), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).updateBaseUrl('www.wrong.com'), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).emitProjectEvent('wrong project event'), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).emitTokenEvent(1, 'wrong token event'), 'Only project or token owner can emit token event')
    expectFailure(() => IOUContract.connect(luckyParticipant1).updateProjectDescription('wong description'), 'Ownable:')
    expectFailure(() => IOUContract.connect(luckyParticipant1).updateMetadataParams(
      'Wrong #',
      'wrongPictures/',
      '.wrong',
      'www.wrong.com/wrongPage/',
    ), 'Ownable:')

  })

  xit('should measure gas cost', async () => {
    const [
      _, __,
      proxy,
      owner,
      ...signers
    ] = await ethers.getSigners();

    const startingBalance = num(await owner.getBalance())
    IOU = await ethers.getContractFactory('IOU_IOU', owner);

    IOUContract = await IOU.deploy();
    await IOUContract.deployed();

    await IOUContract.connect(owner).setPredicateProxy(proxy.address)

    const addresses = []
    for (let i = 0; i < 250; i++) addresses.push(owner.address)
    await IOUContract.connect(owner).batchWhiteList(addresses)
    const endingBalance = num(await owner.getBalance())

    console.log(startingBalance - endingBalance)
  })


  xit('ETH contract should work', async () => {
    const [
      _, __,
      god,
      proxy,
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

    await IOUContract.connect(owner).setPredicateProxy(proxy.address)
    await IOUContract.connect(owner).safeMint(owner.address, 0)
    await IOUContract.connect(owner).safeMint(owner.address, 1)
    await IOUContract.connect(owner).safeMint(owner.address, 2)
    await IOUContract.connect(owner).safeMint(luckyParticipant1.address, 3)
    await IOUContract.connect(owner).safeMint(luckyParticipant2.address, 4)
    await IOUContract.connect(owner).safeMint(luckyParticipant3.address, 5)

    console.log(await IOUContract.connect(owner).ownerOf(0))
    console.log(await IOUContract.connect(owner).ownerOf(1))
    console.log(await IOUContract.connect(owner).ownerOf(2))
    console.log(await IOUContract.connect(owner).ownerOf(3))
    console.log(await IOUContract.connect(owner).ownerOf(4))
    console.log(await IOUContract.connect(owner).ownerOf(5))

    const metadata = await IOUContract.connect(owner).tokenURI(1)
    console.log(metadata)
    // console.log(Buffer.from(metadata.split(',')[1], 'base64').toString('utf-8'))

    await IOUContract.connect(owner).flipUseURIPointer()

    const metadata2 = await IOUContract.connect(owner).tokenURI(1)

    console.log(metadata2)
    // console.log(Buffer.from(metadata2.split(',')[1], 'base64').toString('utf-8'))

  })
})

