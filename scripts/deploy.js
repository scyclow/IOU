async function main() {
    const [owner] = await ethers.getSigners();

    IOU = await ethers.getContractFactory('IOU', owner);

    IOUContract = await IOU.deploy();
    await IOUContract.deployed();


    await IOUContract.connect(owner).batchSafeMint([
      owner.address,
      owner.address,
      owner.address,
    ])

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });