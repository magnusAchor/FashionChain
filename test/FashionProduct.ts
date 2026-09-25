import { expect } from "chai";
import { ethers } from "hardhat";

describe("FashionProduct", function () {
  async function fixture() {
    const [admin, minter, owner, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FashionProduct");
    const product = await Factory.deploy(admin.address, minter.address);
    const mint = () => product.connect(minter).mintProduct(owner.address, "SG-JKT-000001", "Signature Jacket", "SABRINAGOH", "Jacket", "2026-B04", "ipfs://metadata/1");
    return { product, admin, minter, owner, stranger, mint };
  }

  it("assigns admin and designated minter roles", async () => {
    const { product, admin, minter } = await fixture();
    expect(await product.hasRole(await product.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true);
    expect(await product.hasRole(await product.MINTER_ROLE(), minter.address)).to.equal(true);
  });

  it("mints a structured product and emits ProductMinted", async () => {
    const { product, owner, mint } = await fixture();
    await expect(mint()).to.emit(product, "ProductMinted").withArgs(1, "SG-JKT-000001", owner.address);
    expect(await product.ownerOf(1)).to.equal(owner.address);
    const data = await product.getProduct(1);
    expect(data.productName).to.equal("Signature Jacket");
    expect(data.active).to.equal(true);
    expect(await product.tokenURI(1)).to.equal("ipfs://metadata/1");
  });

  it("increments token IDs and rejects duplicate or empty IDs", async () => {
    const { product, minter, owner, mint } = await fixture();
    await mint();
    await product.connect(minter).mintProduct(owner.address, "SG-TEE-000002", "Heritage Tee", "SABRINAGOH", "T-Shirt", "2026-B04", "");
    expect(await product.tokenIdForProductId("SG-TEE-000002")).to.equal(2);
    await expect(mint()).to.be.revertedWithCustomError(product, "ProductIdAlreadyRegistered");
    await expect(product.connect(minter).mintProduct(owner.address, "", "", "", "", "", "")).to.be.revertedWithCustomError(product, "EmptyProductId");
  });

  it("only allows minters to mint", async () => {
    const { product, stranger, owner } = await fixture();
    await expect(product.connect(stranger).mintProduct(owner.address, "X", "", "", "", "", "")).to.be.reverted;
  });

  it("returns verification data and rejects unknown products", async () => {
    const { product, owner, mint } = await fixture();
    await mint();
    const [data, verifiedOwner] = await product.verifyProduct(1);
    expect(data.productId).to.equal("SG-JKT-000001");
    expect(verifiedOwner).to.equal(owner.address);
    await expect(product.verifyProduct(99)).to.be.reverted;
    await expect(product.tokenIdForProductId("missing")).to.be.revertedWithCustomError(product, "ProductNotFound");
  });

  it("allows only admins to deactivate, preserves history, and can reactivate", async () => {
    const { product, admin, stranger, mint } = await fixture();
    await mint();
    await expect(product.connect(stranger).deactivateProduct(1, "recall")).to.be.reverted;
    await expect(product.connect(admin).deactivateProduct(1, "recall")).to.emit(product, "ProductDeactivated").withArgs(1, "recall");
    expect((await product.getProduct(1)).active).to.equal(false);
    expect(await product.ownerOf(1)).to.not.equal(ethers.ZeroAddress);
    await expect(product.connect(admin).reactivateProduct(1)).to.emit(product, "ProductReactivated");
  });

  it("uses standard ERC-721 ownership transfers and rejects unauthorized transfer", async () => {
    const { product, owner, stranger, mint } = await fixture();
    await mint();
    await expect(product.connect(stranger).transferFrom(owner.address, stranger.address, 1)).to.be.reverted;
    await product.connect(owner).transferFrom(owner.address, stranger.address, 1);
    expect(await product.ownerOf(1)).to.equal(stranger.address);
  });
});
