# SkyFundraising — Wave 2 Slot #82

**Status:** engineering beta / fundraising domain core.

SkyFundraising adds bounded campaign lifecycle and pledge-record behavior to the existing SkyHope package. It validates campaign IDs, titles, goals, timestamps, pledge IDs and pledge amounts; prevents duplicate pledge IDs; exposes deterministic progress; and records `externalPaymentPerformed: false` on every pledge.

## SKYCOIN4444 integration

SkyHope or another authenticated application may use this core to manage campaign metadata before delegating any real payment collection to a separately verified payments component. A payment adapter must never infer that a `Pledge` means money moved: the pledge record is intent/domain state only.

## Security and product boundary

This library does not process cards, connect to payment providers, hold funds, verify donors, perform KYC/AML, issue tax receipts, determine charitable eligibility, guarantee campaign legitimacy, provide escrow, persist state durably, or claim production deployment. Those controls require separate services and evidence.

The package remains dependency-light and uses the repository's existing strict TypeScript build, Node test runner and dependency-audit CI.