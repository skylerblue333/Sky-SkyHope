# SkyHope

**Status: engineering beta / major-application core.** SkyHope currently provides a dependency-light TypeScript resource/referral domain layer for the SKYCOIN4444 ecosystem.

It supports validated resource registration, category/tag filtering, and local referral-request intent. A referral object explicitly reports `externalSubmissionPerformed: false`; this repository does not claim that any provider, agency, shelter, school, clinic, employer, government office, or other organization received or accepted a request.

## Supported today

- bounded support-resource directory;
- categories for housing, food, health, education, employment, transport, legal, and other support;
- deterministic tag matching;
- inactive-resource filtering;
- validated referral-request metadata;
- strict TypeScript build and Node tests.

## Not claimed

This repository is **not** an emergency-response service, crisis hotline, benefits eligibility system, case-management platform, medical/legal advice system, provider network, payment system, identity-verification service, or verified production deployment. Resource data must be independently sourced, reviewed, and kept current by a real operating organization before user-facing deployment.

## Development

```bash
npm install
npm run check
npm test
```

## Integration

The `SkyHopeDirectory` class can be consumed by SKYCOIN4444 as a resource-catalog and referral-intent boundary. A production service would still need durable storage, authentication and authorization, consent/privacy controls, audit logging, provider integrations, data freshness processes, observability, accessibility review, and deployment evidence.

## Security and privacy

The current core intentionally stores no personal case notes, medical details, legal records, credentials, or payment data. Callers should avoid attaching sensitive personal data to identifiers or tags and must implement appropriate privacy controls before extending this core.

## License

See `LICENSE`.
