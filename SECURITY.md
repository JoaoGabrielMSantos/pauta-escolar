# Security Policy

Pauta Escolar handles personal data of minors (students), their guardians and school staff, under Brazil's LGPD. Security reports are taken seriously and handled privately.

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private vulnerability reporting:

1. Go to [Security → Report a vulnerability](https://github.com/JoaoGabrielMSantos/pauta-escolar/security/advisories/new).
2. Describe the issue, the affected area and the steps to reproduce.
3. If possible, include a proof of concept that uses **only fictitious data**.

You will get an acknowledgement within **3 business days** and a status update at least every **7 days** until the issue is resolved. Fixed issues are credited in the release notes unless you prefer to stay anonymous.

## Scope

Especially relevant:

- **Tenant isolation.** Reading or writing another school's data (RLS, composite keys, tenant resolution).
- **Authorization.** A role accessing what it shouldn't: teacher → other classes, guardian → other children, student → other students.
- **Audit log integrity.** Any way to update, delete or forge entries, or to break the hash chain without detection.
- **Authentication.** Invitations, password reset, student login, sessions and MFA for platform admins.
- **Document verification.** Forging `/verificar` results, or leaking data through it.
- **LGPD.** Exposure of PII: CPF, contact data, grades, incidents, attachments.

Out of scope:

- denial of service and volumetric attacks;
- social engineering;
- findings that require a compromised device;
- missing best-practice headers that carry no demonstrable impact.

## Rules of engagement

- Test only against your own local environment or the public demo (`demo.<root-domain>`, once it exists). **Never** against production schools.
- Do not access, modify or retain data that is not yours. Stop and report as soon as you reach real data.
- Give us reasonable time to fix the issue before any public disclosure.

Good-faith research that follows these rules will not be pursued legally.

## Supported versions

Only the latest release on `main` receives security fixes while the project is pre-1.0.
