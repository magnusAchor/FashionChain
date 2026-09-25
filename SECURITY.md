# Security notes

FashionChain is an **unaudited portfolio MVP**, not a production financial system or a formal authentication guarantee.

## Threat model and trust assumptions

The contract protects the integrity of digital records after they are registered. The administrator/manufacturer is trusted to correctly bind a physical item to the product ID at mint time, safely operate its role-holding wallet, and only invalidate items for legitimate reasons. The system cannot establish that a QR label is physically attached to the original item; labels can be copied, damaged, or moved.

## Decisions

- OpenZeppelin ERC-721 and `AccessControl` provide well-reviewed token and role primitives.
- Only `MINTER_ROLE` can mint. `DEFAULT_ADMIN_ROLE` controls minter administration and status changes.
- A mapping makes a non-empty product ID globally unique.
- Invalidation does not burn a token, preserving traceability and ownership history.
- Verification reads the contract directly; UI status is not authoritative.
- There are no payable functions, external callbacks beyond ERC-721 safe mint receiver handling, or custom balance accounting.

## Attack surfaces and limitations

- `DEFAULT_ADMIN_ROLE` is powerful. Production should use a multisig and separated operational roles.
- Metadata URIs are not content-addressed or validated by this MVP; untrusted metadata should never be rendered unsafely.
- Product identifiers and all on-chain fields are public and should not contain customer PII.
- Wallet compromise, incorrect initial registration, RPC censorship, and chain reorgs are outside the contract's control.
- The frontend does not index an owner's entire collection; a production app should use event indexing or an appropriate ERC-721 enumeration/indexer strategy.

## Future hardening

Use a multisig/timelock for admin actions, roles split between registry and recall operators, IPFS/Arweave content-addressed metadata, signed NFC challenge-response labels, monitoring/indexing, invariant/fuzz tests, a professional independent audit, and an incident-response policy.
