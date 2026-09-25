// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title FashionChain physical-product digital identity registry
/// @notice Each NFT represents the digital identity record associated with one physical item.
contract FashionProduct is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct Product {
        string productId;
        string productName;
        string brand;
        string category;
        string batchNumber;
        uint256 mintedAt;
        bool active;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => Product) private _products;
    mapping(string => uint256) private _tokenIdByProductId;

    event ProductMinted(uint256 indexed tokenId, string indexed productId, address indexed owner);
    event ProductDeactivated(uint256 indexed tokenId, string reason);
    event ProductReactivated(uint256 indexed tokenId);

    error EmptyProductId();
    error ProductIdAlreadyRegistered(string productId);
    error ProductNotFound(string productId);

    constructor(address initialAdmin, address initialMinter) ERC721("FashionChain Digital Product Identity", "FCP") {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialMinter);
    }

    function mintProduct(
        address to,
        string calldata productId,
        string calldata productName,
        string calldata brand,
        string calldata category,
        string calldata batchNumber,
        string calldata metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (bytes(productId).length == 0) revert EmptyProductId();
        if (_tokenIdByProductId[productId] != 0) revert ProductIdAlreadyRegistered(productId);

        tokenId = _nextTokenId++;
        _tokenIdByProductId[productId] = tokenId;
        _products[tokenId] = Product(productId, productName, brand, category, batchNumber, block.timestamp, true);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        emit ProductMinted(tokenId, productId, to);
    }

    /// @notice Resolves a QR product ID to its token ID; reverts if absent.
    function tokenIdForProductId(string calldata productId) external view returns (uint256) {
        uint256 tokenId = _tokenIdByProductId[productId];
        if (tokenId == 0) revert ProductNotFound(productId);
        return tokenId;
    }

    /// @notice Verifies the on-chain product state. Existence is enforced by ownerOf.
    function verifyProduct(uint256 tokenId) external view returns (Product memory product, address owner) {
        owner = ownerOf(tokenId);
        product = _products[tokenId];
    }

    function getProduct(uint256 tokenId) external view returns (Product memory) {
        ownerOf(tokenId);
        return _products[tokenId];
    }

    function deactivateProduct(uint256 tokenId, string calldata reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ownerOf(tokenId);
        _products[tokenId].active = false;
        emit ProductDeactivated(tokenId, reason);
    }

    function reactivateProduct(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ownerOf(tokenId);
        _products[tokenId].active = true;
        emit ProductReactivated(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
