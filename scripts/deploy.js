const PREDICATE_PROXY = '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59'

// async function main(contractType) {
//   const [owner] = await ethers.getSigners();

//   if (contractType === 'POLY') {
//     IOU = await ethers.getContractFactory('IOUPoly', owner);

//     IOUContract = await IOU.deploy();
//     await IOUContract.deployed();
//     await IOUContract.connect(owner).setPredicateProxy(PREDICATE_PROXY)

//     await IOUContract.connect(owner).batchSafeMint([
//       owner.address,
//       owner.address,
//       owner.address,
//     ])
//   } else if (contractType === 'ETH') {

//     IOU = await ethers.getContractFactory('IOUEth', owner);

//     IOUContract = await IOU.deploy();
//     await IOUContract.deployed();
//     await IOUContract.connect(owner).setPredicateProxy(PREDICATE_PROXY)
//   }

//   console.log(`IOU ${contractType} Contract Address: ${IOUContract.address}`)


//   // await IOUContract.connect(owner).flipUseURIPointer()
// }


async function main(contractType) {
  const [owner] = await ethers.getSigners();


    IOU = await ethers.getContractFactory('IOUv7', owner);

    IOUContract = await IOU.deploy();
    await IOUContract.deployed();

    await IOUContract.connect(owner).batchSafeMint([
      owner.address,
      owner.address,
      owner.address,
    ])



  console.log(`IOU Contract Address: ${IOUContract.address}`)


  // await IOUContract.connect(owner).flipUseURIPointer()
}



main(process.env.CONTRACT)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });