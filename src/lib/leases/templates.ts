import type { ListingType } from "../site";

// Default lease drafts written by KirayBet for attorney review (see render.ts for the syntax).
// The admin can replace each with the lawyer's version; saved versions live in the
// lease_templates table and take precedence over these.
export const defaultLeaseTemplates: Record<ListingType, string> = {
  house: `{{! DRAFT prepared by KirayBet for attorney review. Not legal advice. Colorado residential
landlord-tenant law changed often in 2023-2025; please confirm every clause marked "Attorney" and
anything else that is out of date. Notes like this one never appear in a lease a host generates. }}
# Residential Lease Agreement (Single-Family Home)

This agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_names}}** ("Tenant").
If more than one person signs as Tenant, each of them is responsible for all of Tenant's obligations under this agreement.

## 1. The home

Landlord rents to Tenant the entire single-family home, including its yard, driveway and any garage, located at **{{property_address}}, {{city}}, Colorado {{zip}}** (the "Premises").

{{#if furnished}}The following furniture and items are provided and must be returned in the same condition, except for normal wear and tear: {{furnishings}}.
{{/if}}
Only Tenant and these other occupants may live at the Premises: {{other_occupants}}. Guests may stay no more than 14 nights in any 6-month period without the Landlord's written permission.
{{! Attorney: occupancy and guest limits; confirm they are reasonable and enforceable. }}

## 2. Term

{{#if fixed_term}}This lease starts on **{{lease_start}}** and ends on **{{lease_end}}**. If neither party gives notice to end it, it continues month-to-month after that date on the same terms.
{{else}}This is a month-to-month tenancy starting on **{{lease_start}}**. Either party may end it with written notice as required by Colorado law.
{{/if}}{{! Attorney: confirm required notice to end a month-to-month tenancy (C.R.S. 13-40-107, 21 days at time of drafting) and whether Colorado's 2024 "for cause" eviction law (HB24-1098) limits non-renewal for this kind of tenancy, including any exemption for owner-occupied homes (basement/room types). }}

If Landlord cannot give Tenant possession on the start date, Tenant does not owe rent for the days before possession is given. If possession is not given within 30 days after the start date, either party may cancel this agreement in writing before Tenant moves in, and Landlord will return everything Tenant paid.

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

If a check or electronic payment is returned or fails, Tenant will make that payment again by cashier's check, money order or another method the Landlord accepts, and pay the bank's fee for the failed payment.
{{! Attorney: confirm any Colorado limit on returned-payment fees and whether HB25-1090 (rental fee disclosure) requires listing every possible fee up front. }}
Landlord will give a written receipt for any rent paid in cash. Landlord will give at least the written notice required by Colorado law before any rent increase.
{{! Attorney: confirm current notice period for rent increases and any limit on how often rent may be raised. }}

**Safety:** Tenant should never pay any money before seeing the home in person and signing this agreement. KirayBet does not collect or hold any payments.

## 4. Security deposit

Tenant pays a security deposit of **\${{security_deposit}}** when signing. Landlord may use it only for unpaid rent, utilities Tenant owes, damage beyond normal wear and tear, and other amounts allowed by Colorado law.

Within one month after this tenancy ends and Tenant moves out (or within the longer period stated here, up to 60 days, if both parties initial: ______ / ______), Landlord will return the deposit or give Tenant a written statement listing the exact reasons for keeping any part of it, together with the rest of the deposit. Tenant should give Landlord a forwarding address in writing.
{{! Attorney: C.R.S. 38-12-103 to -104. Also check any newer cap on the deposit amount and rules on move-in condition reports. }}

Landlord and Tenant will walk through the Premises together at move-in and move-out and note its condition in writing, with photos if possible.

## 5. Utilities

Landlord pays: {{utilities_landlord}}.
Tenant pays and puts in Tenant's own name where possible: {{utilities_tenant}}.

## 6. Parking

{{#if parking}}Tenant may park as follows: {{parking_details}}. Vehicles must be in working order and currently registered.
{{else}}No parking space is included. Tenant must follow local street parking rules.
{{/if}}
## 7. Pets

{{#if pets_allowed}}Tenant may keep the following pet(s): {{pet_details}}. Pet deposit: \${{pet_deposit}}. Monthly pet rent: \${{pet_rent}}. Tenant is responsible for any damage caused by the pet and for keeping it from disturbing others.
{{else}}No pets are allowed without the Landlord's written permission.
{{/if}}Assistance animals for people with disabilities are not pets. They are allowed as required by fair housing law, without pet fees.
{{! Attorney: Colorado HB23-1068 limits pet deposits (about $300) and monthly pet rent (greater of $35 or 1.5% of rent) and restricts breed-based rules for insurance. Please confirm current limits. }}

## 8. Use of the home, yard and snow

Tenant will use the Premises only as a private home and will follow all laws and any homeowners' association rules that Landlord gives to Tenant in writing.
Tenant is responsible for: lawn mowing and watering, keeping walkways and driveway clear of snow and ice, and taking trash and recycling to the curb on collection days, unless the parties agree otherwise here: ______________________.
{{! Attorney: snow removal and yard care allocation for a single-family rental; confirm Denver-area municipal snow ordinances place sidewalk duties on the occupant or owner. }}

## 9. Repairs and condition of the home

Landlord will keep the Premises safe and fit to live in as required by Colorado's warranty of habitability, including working heat, plumbing, hot water and electricity, and freedom from conditions that are dangerous to health or safety.
**Every tenant is entitled to safe and healthy housing under Colorado's warranty of habitability. A landlord may not retaliate against a tenant in any way for reporting unsafe conditions, asking for repairs, or using the tenant's right to safe and healthy housing.**

**Tenant must tell Landlord about any condition that makes the home unfit to live in, in writing, by mail or hand delivery to {{landlord_notice_address}}, or by email to {{landlord_email}}.**

**El Inquilino debe notificar al Arrendador por escrito sobre cualquier condición que haga la vivienda inhabitable, por correo o entrega en mano a {{landlord_notice_address}}, o por correo electrónico a {{landlord_email}}.**
{{! Attorney: Colorado requires leases to state the habitability and anti-retaliation rights and how to give notice of uninhabitable conditions, in English and Spanish (C.R.S. 38-12-503 / 38-12-509; please confirm the cite and exact required wording). }}

Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any other problem that needs repair. Landlord will respond within the time required by Colorado law.
{{! Attorney: C.R.S. 38-12-501 to -511 (warranty of habitability), including response times added in 2024 (HB24-1098 / SB24-094?). Please confirm current response deadlines and tenant remedies. }}
Tenant will keep the Premises clean, use appliances properly, not make alterations or paint without written permission, and pay for damage caused by Tenant, occupants or guests beyond normal wear and tear.
Tenant will not change or add locks without Landlord's permission, and will give Landlord a copy of any new key.

## 10. Landlord's entry

Landlord may enter the Premises for repairs, inspections or showings after giving at least 24 hours' notice, at reasonable times, or at any time in an emergency.
{{! Attorney: Colorado has no general statute on landlord entry notice at time of drafting; 24 hours is a common standard. Confirm. }}

## 11. Safety, health and disclosures

**Smoke and carbon monoxide alarms.** The Premises has working smoke alarms and, where required by Colorado law, carbon monoxide alarms. Tenant will not disable them and will tell Landlord right away if one is not working.
{{! Attorney: C.R.S. 38-45-104 (CO alarms) and local fire codes. }}

**Bed bugs.** Tenant will tell Landlord promptly if Tenant suspects bed bugs. Landlord will arrange an inspection and treatment as required by Colorado law, and Tenant will cooperate.
{{! Attorney: C.R.S. 38-12-1001 et seq. (inspection within 96 hours, treatment, cost allocation). }}

**Radon disclosure.**

**The Colorado Department of Public Health and Environment strongly recommends that all tenants have an indoor radon test done before leasing a home, and recommends having radon levels reduced if high levels are found. High radon levels can be reduced by a radon mitigation professional.**

**Homes can have dangerous levels of indoor radon gas, which may put the people living there at risk of radon-induced lung cancer. Radon is a Class A human carcinogen, the leading cause of lung cancer in nonsmokers and the second leading cause of lung cancer overall. A landlord must give the tenant any known information about radon test results for the home.**

What Landlord knows about radon at the Premises (past tests, results, and any radon mitigation system): {{radon_info}}

Tenant confirms receiving, before signing, the Colorado Department of Public Health and Environment brochure "Radon in Real Estate and Rental Transactions in Colorado" (available at cdphe.colorado.gov).

Tenant's initials: ______ / ______
{{! Attorney: C.R.S. 38-12-801 to -804 (radon disclosure, bold-face statement, brochure, tenant remedies). The CDPHE brochure says the remedies for missing disclosure do not apply to leases of one year or less from Jan 1, 2026; please confirm, and confirm the statement wording above. }}

{{#if pre_1978}}**Lead-based paint disclosure.** The home was built before 1978.

**Lead Warning Statement: Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.**

What Landlord knows about lead-based paint or lead-based paint hazards at the Premises, and any records or reports Landlord has given Tenant: {{lead_info}}

Tenant confirms receiving the information above and the EPA pamphlet "Protect Your Family From Lead in Your Home" (epa.gov/lead) before signing. Both parties confirm that, to the best of their knowledge, the information they gave is true and accurate.

Tenant's initials: ______ / ______   Landlord's initials: ______
{{! Attorney: 42 U.S.C. 4852d and 40 CFR 745.113 (lessor disclosure, warning statement, signatures and dates, keep for 3 years). Confirm that initials plus the lease signatures meet the signature and date requirement, or whether a separate signed form is better. }}
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing. Growing marijuana at the Premises is not allowed.
{{! Attorney: confirm a landlord may prohibit home marijuana cultivation and on-premises use in a residential lease in Colorado. }}

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably. Tenant may not rent out any part of the Premises for short stays (for example on Airbnb or VRBO).
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Insurance, breaking this agreement, and legal costs

Landlord's insurance does not cover Tenant's belongings. Landlord recommends that Tenant get renter's insurance.

If Tenant does not pay rent or breaks another part of this agreement, Landlord may use the remedies Colorado law allows, including ending the tenancy through the court process. Landlord may not lock Tenant out, remove Tenant's belongings, or shut off utilities to force Tenant out. If Tenant moves out early, Landlord will make reasonable efforts to rent the Premises again to reduce what Tenant owes.

If either party goes to court over this agreement, the winning party may recover reasonable attorney fees and court costs, to the extent Colorado law allows.
{{! Attorney: confirm attorney-fee clauses are mutual and enforceable (C.R.S. 13-40-123 and 38-12-801 et seq.), current eviction notice periods (10-day demand under C.R.S. 13-40-104 at time of drafting), and the duty to mitigate. }}

## 17. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

Both parties agree that signatures on this agreement may be electronic, and that a signed copy sent electronically counts the same as the original.

**About this form.** Landlord and Tenant each understand and agree that KirayBet (kiraybet.org) only provided this blank form as a free sample. KirayBet is not a party to this agreement, is not a real estate broker or property manager, does not give legal advice, did not review the details either party filled in, and is not responsible for this agreement, the Premises, or what either party does under it. Each party had the chance to have this agreement reviewed by their own lawyer before signing.
{{! Attorney: please review this acknowledgment for enforceability as to both parties (neither of whom contracts with KirayBet through this document), and whether anything here could be read as KirayBet giving legal advice. }}

## Signatures

Landlord: ______________________________  Date: ______________
{{landlord_name}}

Tenant: ________________________________  Date: ______________
{{tenant_names}}

Tenant: ________________________________  Date: ______________
`,
  apartment: `{{! DRAFT prepared by KirayBet for attorney review. Not legal advice. Colorado residential
landlord-tenant law changed often in 2023-2025; please confirm every clause marked "Attorney" and
anything else that is out of date. Notes like this one never appear in a lease a host generates. }}
# Residential Lease Agreement (Apartment)

This agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_names}}** ("Tenant").
If more than one person signs as Tenant, each of them is responsible for all of Tenant's obligations under this agreement.

## 1. The home

Landlord rents to Tenant the apartment unit located at **{{property_address}}, {{city}}, Colorado {{zip}}** (the "Premises").

Tenant may also use the building's shared areas (such as hallways, laundry and outdoor areas) in common with other residents, following the building's posted rules.

{{#if furnished}}The following furniture and items are provided and must be returned in the same condition, except for normal wear and tear: {{furnishings}}.
{{/if}}
Only Tenant and these other occupants may live at the Premises: {{other_occupants}}. Guests may stay no more than 14 nights in any 6-month period without the Landlord's written permission.
{{! Attorney: occupancy and guest limits; confirm they are reasonable and enforceable. }}

## 2. Term

{{#if fixed_term}}This lease starts on **{{lease_start}}** and ends on **{{lease_end}}**. If neither party gives notice to end it, it continues month-to-month after that date on the same terms.
{{else}}This is a month-to-month tenancy starting on **{{lease_start}}**. Either party may end it with written notice as required by Colorado law.
{{/if}}{{! Attorney: confirm required notice to end a month-to-month tenancy (C.R.S. 13-40-107, 21 days at time of drafting) and whether Colorado's 2024 "for cause" eviction law (HB24-1098) limits non-renewal for this kind of tenancy, including any exemption for owner-occupied homes (basement/room types). }}

If Landlord cannot give Tenant possession on the start date, Tenant does not owe rent for the days before possession is given. If possession is not given within 30 days after the start date, either party may cancel this agreement in writing before Tenant moves in, and Landlord will return everything Tenant paid.

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

If a check or electronic payment is returned or fails, Tenant will make that payment again by cashier's check, money order or another method the Landlord accepts, and pay the bank's fee for the failed payment.
{{! Attorney: confirm any Colorado limit on returned-payment fees and whether HB25-1090 (rental fee disclosure) requires listing every possible fee up front. }}
Landlord will give a written receipt for any rent paid in cash. Landlord will give at least the written notice required by Colorado law before any rent increase.
{{! Attorney: confirm current notice period for rent increases and any limit on how often rent may be raised. }}

**Safety:** Tenant should never pay any money before seeing the home in person and signing this agreement. KirayBet does not collect or hold any payments.

## 4. Security deposit

Tenant pays a security deposit of **\${{security_deposit}}** when signing. Landlord may use it only for unpaid rent, utilities Tenant owes, damage beyond normal wear and tear, and other amounts allowed by Colorado law.

Within one month after this tenancy ends and Tenant moves out (or within the longer period stated here, up to 60 days, if both parties initial: ______ / ______), Landlord will return the deposit or give Tenant a written statement listing the exact reasons for keeping any part of it, together with the rest of the deposit. Tenant should give Landlord a forwarding address in writing.
{{! Attorney: C.R.S. 38-12-103 to -104. Also check any newer cap on the deposit amount and rules on move-in condition reports. }}

Landlord and Tenant will walk through the Premises together at move-in and move-out and note its condition in writing, with photos if possible.

## 5. Utilities

Landlord pays: {{utilities_landlord}}.
Tenant pays and puts in Tenant's own name where possible: {{utilities_tenant}}.

## 6. Parking

{{#if parking}}Tenant may park as follows: {{parking_details}}. Vehicles must be in working order and currently registered.
{{else}}No parking space is included. Tenant must follow local street parking rules.
{{/if}}
## 7. Pets

{{#if pets_allowed}}Tenant may keep the following pet(s): {{pet_details}}. Pet deposit: \${{pet_deposit}}. Monthly pet rent: \${{pet_rent}}. Tenant is responsible for any damage caused by the pet and for keeping it from disturbing others.
{{else}}No pets are allowed without the Landlord's written permission.
{{/if}}Assistance animals for people with disabilities are not pets. They are allowed as required by fair housing law, without pet fees.
{{! Attorney: Colorado HB23-1068 limits pet deposits (about $300) and monthly pet rent (greater of $35 or 1.5% of rent) and restricts breed-based rules for insurance. Please confirm current limits. }}

## 8. Use of the apartment and building rules

Tenant will use the Premises only as a private home and will follow the building's written rules that Landlord gives to Tenant. Tenant will keep noise at a reasonable level, especially between 10 pm and 7 am, and will not block hallways, exits or shared spaces.

## 9. Repairs and condition of the home

Landlord will keep the Premises safe and fit to live in as required by Colorado's warranty of habitability, including working heat, plumbing, hot water and electricity, and freedom from conditions that are dangerous to health or safety.
**Every tenant is entitled to safe and healthy housing under Colorado's warranty of habitability. A landlord may not retaliate against a tenant in any way for reporting unsafe conditions, asking for repairs, or using the tenant's right to safe and healthy housing.**

**Tenant must tell Landlord about any condition that makes the home unfit to live in, in writing, by mail or hand delivery to {{landlord_notice_address}}, or by email to {{landlord_email}}.**

**El Inquilino debe notificar al Arrendador por escrito sobre cualquier condición que haga la vivienda inhabitable, por correo o entrega en mano a {{landlord_notice_address}}, o por correo electrónico a {{landlord_email}}.**
{{! Attorney: Colorado requires leases to state the habitability and anti-retaliation rights and how to give notice of uninhabitable conditions, in English and Spanish (C.R.S. 38-12-503 / 38-12-509; please confirm the cite and exact required wording). }}

Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any other problem that needs repair. Landlord will respond within the time required by Colorado law.
{{! Attorney: C.R.S. 38-12-501 to -511 (warranty of habitability), including response times added in 2024 (HB24-1098 / SB24-094?). Please confirm current response deadlines and tenant remedies. }}
Tenant will keep the Premises clean, use appliances properly, not make alterations or paint without written permission, and pay for damage caused by Tenant, occupants or guests beyond normal wear and tear.
Tenant will not change or add locks without Landlord's permission, and will give Landlord a copy of any new key.

## 10. Landlord's entry

Landlord may enter the Premises for repairs, inspections or showings after giving at least 24 hours' notice, at reasonable times, or at any time in an emergency.
{{! Attorney: Colorado has no general statute on landlord entry notice at time of drafting; 24 hours is a common standard. Confirm. }}

## 11. Safety, health and disclosures

**Smoke and carbon monoxide alarms.** The Premises has working smoke alarms and, where required by Colorado law, carbon monoxide alarms. Tenant will not disable them and will tell Landlord right away if one is not working.
{{! Attorney: C.R.S. 38-45-104 (CO alarms) and local fire codes. }}

**Bed bugs.** Tenant will tell Landlord promptly if Tenant suspects bed bugs. Landlord will arrange an inspection and treatment as required by Colorado law, and Tenant will cooperate.
{{! Attorney: C.R.S. 38-12-1001 et seq. (inspection within 96 hours, treatment, cost allocation). }}

**Radon disclosure.**

**The Colorado Department of Public Health and Environment strongly recommends that all tenants have an indoor radon test done before leasing a home, and recommends having radon levels reduced if high levels are found. High radon levels can be reduced by a radon mitigation professional.**

**Homes can have dangerous levels of indoor radon gas, which may put the people living there at risk of radon-induced lung cancer. Radon is a Class A human carcinogen, the leading cause of lung cancer in nonsmokers and the second leading cause of lung cancer overall. A landlord must give the tenant any known information about radon test results for the home.**

What Landlord knows about radon at the Premises (past tests, results, and any radon mitigation system): {{radon_info}}

Tenant confirms receiving, before signing, the Colorado Department of Public Health and Environment brochure "Radon in Real Estate and Rental Transactions in Colorado" (available at cdphe.colorado.gov).

Tenant's initials: ______ / ______
{{! Attorney: C.R.S. 38-12-801 to -804 (radon disclosure, bold-face statement, brochure, tenant remedies). The CDPHE brochure says the remedies for missing disclosure do not apply to leases of one year or less from Jan 1, 2026; please confirm, and confirm the statement wording above. }}

{{#if pre_1978}}**Lead-based paint disclosure.** The home was built before 1978.

**Lead Warning Statement: Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.**

What Landlord knows about lead-based paint or lead-based paint hazards at the Premises, and any records or reports Landlord has given Tenant: {{lead_info}}

Tenant confirms receiving the information above and the EPA pamphlet "Protect Your Family From Lead in Your Home" (epa.gov/lead) before signing. Both parties confirm that, to the best of their knowledge, the information they gave is true and accurate.

Tenant's initials: ______ / ______   Landlord's initials: ______
{{! Attorney: 42 U.S.C. 4852d and 40 CFR 745.113 (lessor disclosure, warning statement, signatures and dates, keep for 3 years). Confirm that initials plus the lease signatures meet the signature and date requirement, or whether a separate signed form is better. }}
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing. Growing marijuana at the Premises is not allowed.
{{! Attorney: confirm a landlord may prohibit home marijuana cultivation and on-premises use in a residential lease in Colorado. }}

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably. Tenant may not rent out any part of the Premises for short stays (for example on Airbnb or VRBO).
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Insurance, breaking this agreement, and legal costs

Landlord's insurance does not cover Tenant's belongings. Landlord recommends that Tenant get renter's insurance.

If Tenant does not pay rent or breaks another part of this agreement, Landlord may use the remedies Colorado law allows, including ending the tenancy through the court process. Landlord may not lock Tenant out, remove Tenant's belongings, or shut off utilities to force Tenant out. If Tenant moves out early, Landlord will make reasonable efforts to rent the Premises again to reduce what Tenant owes.

If either party goes to court over this agreement, the winning party may recover reasonable attorney fees and court costs, to the extent Colorado law allows.
{{! Attorney: confirm attorney-fee clauses are mutual and enforceable (C.R.S. 13-40-123 and 38-12-801 et seq.), current eviction notice periods (10-day demand under C.R.S. 13-40-104 at time of drafting), and the duty to mitigate. }}

## 17. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

Both parties agree that signatures on this agreement may be electronic, and that a signed copy sent electronically counts the same as the original.

**About this form.** Landlord and Tenant each understand and agree that KirayBet (kiraybet.org) only provided this blank form as a free sample. KirayBet is not a party to this agreement, is not a real estate broker or property manager, does not give legal advice, did not review the details either party filled in, and is not responsible for this agreement, the Premises, or what either party does under it. Each party had the chance to have this agreement reviewed by their own lawyer before signing.
{{! Attorney: please review this acknowledgment for enforceability as to both parties (neither of whom contracts with KirayBet through this document), and whether anything here could be read as KirayBet giving legal advice. }}

## Signatures

Landlord: ______________________________  Date: ______________
{{landlord_name}}

Tenant: ________________________________  Date: ______________
{{tenant_names}}

Tenant: ________________________________  Date: ______________
`,
  basement: `{{! DRAFT prepared by KirayBet for attorney review. Not legal advice. Colorado residential
landlord-tenant law changed often in 2023-2025; please confirm every clause marked "Attorney" and
anything else that is out of date. Notes like this one never appear in a lease a host generates. }}
# Lease Agreement for a Unit in an Owner-Occupied Home (Basement)

This agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_names}}** ("Tenant").
If more than one person signs as Tenant, each of them is responsible for all of Tenant's obligations under this agreement.

## 1. The home

Landlord rents to Tenant the basement unit inside the Landlord's home located at **{{property_address}}, {{city}}, Colorado {{zip}}** (the "Premises").

The Landlord lives in the same home. The unit has its own living space; any spaces that are shared are listed in the "Shared spaces" section below. Tenant has no right to use the rest of the home.

{{#if furnished}}The following furniture and items are provided and must be returned in the same condition, except for normal wear and tear: {{furnishings}}.
{{/if}}
Only Tenant and these other occupants may live at the Premises: {{other_occupants}}. Guests may stay no more than 14 nights in any 6-month period without the Landlord's written permission.
{{! Attorney: occupancy and guest limits; confirm they are reasonable and enforceable. }}

## 2. Term

{{#if fixed_term}}This lease starts on **{{lease_start}}** and ends on **{{lease_end}}**. If neither party gives notice to end it, it continues month-to-month after that date on the same terms.
{{else}}This is a month-to-month tenancy starting on **{{lease_start}}**. Either party may end it with written notice as required by Colorado law.
{{/if}}{{! Attorney: confirm required notice to end a month-to-month tenancy (C.R.S. 13-40-107, 21 days at time of drafting) and whether Colorado's 2024 "for cause" eviction law (HB24-1098) limits non-renewal for this kind of tenancy, including any exemption for owner-occupied homes (basement/room types). }}

If Landlord cannot give Tenant possession on the start date, Tenant does not owe rent for the days before possession is given. If possession is not given within 30 days after the start date, either party may cancel this agreement in writing before Tenant moves in, and Landlord will return everything Tenant paid.

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

If a check or electronic payment is returned or fails, Tenant will make that payment again by cashier's check, money order or another method the Landlord accepts, and pay the bank's fee for the failed payment.
{{! Attorney: confirm any Colorado limit on returned-payment fees and whether HB25-1090 (rental fee disclosure) requires listing every possible fee up front. }}
Landlord will give a written receipt for any rent paid in cash. Landlord will give at least the written notice required by Colorado law before any rent increase.
{{! Attorney: confirm current notice period for rent increases and any limit on how often rent may be raised. }}

**Safety:** Tenant should never pay any money before seeing the home in person and signing this agreement. KirayBet does not collect or hold any payments.

## 4. Security deposit

Tenant pays a security deposit of **\${{security_deposit}}** when signing. Landlord may use it only for unpaid rent, utilities Tenant owes, damage beyond normal wear and tear, and other amounts allowed by Colorado law.

Within one month after this tenancy ends and Tenant moves out (or within the longer period stated here, up to 60 days, if both parties initial: ______ / ______), Landlord will return the deposit or give Tenant a written statement listing the exact reasons for keeping any part of it, together with the rest of the deposit. Tenant should give Landlord a forwarding address in writing.
{{! Attorney: C.R.S. 38-12-103 to -104. Also check any newer cap on the deposit amount and rules on move-in condition reports. }}

Landlord and Tenant will walk through the Premises together at move-in and move-out and note its condition in writing, with photos if possible.

## 5. Utilities

Because the unit shares the Landlord's home, some utilities may not be separately metered.
Landlord pays: {{utilities_landlord}}.
Tenant pays: {{utilities_tenant}}.
Any shared utility cost Tenant pays will be split in the way written here, and Landlord will show Tenant the bills on request: ______________________.
{{! Attorney: check Colorado rules on billing tenants for shared or sub-metered utilities. }}

## 6. Parking

{{#if parking}}Tenant may park as follows: {{parking_details}}. Vehicles must be in working order and currently registered.
{{else}}No parking space is included. Tenant must follow local street parking rules.
{{/if}}
## 7. Pets

{{#if pets_allowed}}Tenant may keep the following pet(s): {{pet_details}}. Pet deposit: \${{pet_deposit}}. Monthly pet rent: \${{pet_rent}}. Tenant is responsible for any damage caused by the pet and for keeping it from disturbing others.
{{else}}No pets are allowed without the Landlord's written permission.
{{/if}}Assistance animals for people with disabilities are not pets. They are allowed as required by fair housing law, without pet fees.
{{! Attorney: Colorado HB23-1068 limits pet deposits (about $300) and monthly pet rent (greater of $35 or 1.5% of rent) and restricts breed-based rules for insurance. Please confirm current limits. }}

## 8. Shared spaces and living in the same home

Because the Landlord lives upstairs, both parties agree to respect each other's privacy and quiet.
Shared spaces: {{shared_spaces}}.
House rules: {{house_rules}}.
Tenant will use the unit's own entrance and will not enter the Landlord's living space without permission.

## 9. Repairs and condition of the home

Landlord will keep the Premises safe and fit to live in as required by Colorado's warranty of habitability, including working heat, plumbing, hot water and electricity, and freedom from conditions that are dangerous to health or safety.
**Every tenant is entitled to safe and healthy housing under Colorado's warranty of habitability. A landlord may not retaliate against a tenant in any way for reporting unsafe conditions, asking for repairs, or using the tenant's right to safe and healthy housing.**

**Tenant must tell Landlord about any condition that makes the home unfit to live in, in writing, by mail or hand delivery to {{landlord_notice_address}}, or by email to {{landlord_email}}.**

**El Inquilino debe notificar al Arrendador por escrito sobre cualquier condición que haga la vivienda inhabitable, por correo o entrega en mano a {{landlord_notice_address}}, o por correo electrónico a {{landlord_email}}.**
{{! Attorney: Colorado requires leases to state the habitability and anti-retaliation rights and how to give notice of uninhabitable conditions, in English and Spanish (C.R.S. 38-12-503 / 38-12-509; please confirm the cite and exact required wording). }}

Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any other problem that needs repair. Landlord will respond within the time required by Colorado law.
{{! Attorney: C.R.S. 38-12-501 to -511 (warranty of habitability), including response times added in 2024 (HB24-1098 / SB24-094?). Please confirm current response deadlines and tenant remedies. }}
Tenant will keep the Premises clean, use appliances properly, not make alterations or paint without written permission, and pay for damage caused by Tenant, occupants or guests beyond normal wear and tear.
Tenant will not change or add locks without Landlord's permission, and will give Landlord a copy of any new key.

## 10. Landlord's entry

Landlord may enter the Premises for repairs, inspections or showings after giving at least 24 hours' notice, at reasonable times, or at any time in an emergency.
{{! Attorney: Colorado has no general statute on landlord entry notice at time of drafting; 24 hours is a common standard. Confirm. }}

## 11. Safety, health and disclosures

**Smoke and carbon monoxide alarms.** The Premises has working smoke alarms and, where required by Colorado law, carbon monoxide alarms. Tenant will not disable them and will tell Landlord right away if one is not working.
{{! Attorney: C.R.S. 38-45-104 (CO alarms) and local fire codes. }}

**Bed bugs.** Tenant will tell Landlord promptly if Tenant suspects bed bugs. Landlord will arrange an inspection and treatment as required by Colorado law, and Tenant will cooperate.
{{! Attorney: C.R.S. 38-12-1001 et seq. (inspection within 96 hours, treatment, cost allocation). }}

**Radon disclosure.**

**The Colorado Department of Public Health and Environment strongly recommends that all tenants have an indoor radon test done before leasing a home, and recommends having radon levels reduced if high levels are found. High radon levels can be reduced by a radon mitigation professional.**

**Homes can have dangerous levels of indoor radon gas, which may put the people living there at risk of radon-induced lung cancer. Radon is a Class A human carcinogen, the leading cause of lung cancer in nonsmokers and the second leading cause of lung cancer overall. A landlord must give the tenant any known information about radon test results for the home.**

What Landlord knows about radon at the Premises (past tests, results, and any radon mitigation system): {{radon_info}}

Tenant confirms receiving, before signing, the Colorado Department of Public Health and Environment brochure "Radon in Real Estate and Rental Transactions in Colorado" (available at cdphe.colorado.gov).

Tenant's initials: ______ / ______
{{! Attorney: C.R.S. 38-12-801 to -804 (radon disclosure, bold-face statement, brochure, tenant remedies). The CDPHE brochure says the remedies for missing disclosure do not apply to leases of one year or less from Jan 1, 2026; please confirm, and confirm the statement wording above. }}

{{#if pre_1978}}**Lead-based paint disclosure.** The home was built before 1978.

**Lead Warning Statement: Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.**

What Landlord knows about lead-based paint or lead-based paint hazards at the Premises, and any records or reports Landlord has given Tenant: {{lead_info}}

Tenant confirms receiving the information above and the EPA pamphlet "Protect Your Family From Lead in Your Home" (epa.gov/lead) before signing. Both parties confirm that, to the best of their knowledge, the information they gave is true and accurate.

Tenant's initials: ______ / ______   Landlord's initials: ______
{{! Attorney: 42 U.S.C. 4852d and 40 CFR 745.113 (lessor disclosure, warning statement, signatures and dates, keep for 3 years). Confirm that initials plus the lease signatures meet the signature and date requirement, or whether a separate signed form is better. }}
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing. Growing marijuana at the Premises is not allowed.
{{! Attorney: confirm a landlord may prohibit home marijuana cultivation and on-premises use in a residential lease in Colorado. }}

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably. Tenant may not rent out any part of the Premises for short stays (for example on Airbnb or VRBO).
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Insurance, breaking this agreement, and legal costs

Landlord's insurance does not cover Tenant's belongings. Landlord recommends that Tenant get renter's insurance.

If Tenant does not pay rent or breaks another part of this agreement, Landlord may use the remedies Colorado law allows, including ending the tenancy through the court process. Landlord may not lock Tenant out, remove Tenant's belongings, or shut off utilities to force Tenant out. If Tenant moves out early, Landlord will make reasonable efforts to rent the Premises again to reduce what Tenant owes.

If either party goes to court over this agreement, the winning party may recover reasonable attorney fees and court costs, to the extent Colorado law allows.
{{! Attorney: confirm attorney-fee clauses are mutual and enforceable (C.R.S. 13-40-123 and 38-12-801 et seq.), current eviction notice periods (10-day demand under C.R.S. 13-40-104 at time of drafting), and the duty to mitigate. }}

## 17. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

Both parties agree that signatures on this agreement may be electronic, and that a signed copy sent electronically counts the same as the original.

**About this form.** Landlord and Tenant each understand and agree that KirayBet (kiraybet.org) only provided this blank form as a free sample. KirayBet is not a party to this agreement, is not a real estate broker or property manager, does not give legal advice, did not review the details either party filled in, and is not responsible for this agreement, the Premises, or what either party does under it. Each party had the chance to have this agreement reviewed by their own lawyer before signing.
{{! Attorney: please review this acknowledgment for enforceability as to both parties (neither of whom contracts with KirayBet through this document), and whether anything here could be read as KirayBet giving legal advice. }}

## Signatures

Landlord: ______________________________  Date: ______________
{{landlord_name}}

Tenant: ________________________________  Date: ______________
{{tenant_names}}

Tenant: ________________________________  Date: ______________
`,
  room: `{{! DRAFT prepared by KirayBet for attorney review. Not legal advice. Colorado residential
landlord-tenant law changed often in 2023-2025; please confirm every clause marked "Attorney" and
anything else that is out of date. Notes like this one never appear in a lease a host generates. }}
# Room Rental Agreement (Shared Home)

This agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_names}}** ("Tenant").
If more than one person signs as Tenant, each of them is responsible for all of Tenant's obligations under this agreement.

## 1. The home

Landlord rents to Tenant a private bedroom in the shared home located at **{{property_address}}, {{city}}, Colorado {{zip}}** (the "Premises").

Tenant has the private use of that bedroom and shared use of the common areas listed in the "Shared spaces and house rules" section below. Tenant has no right to use other bedrooms.

{{#if furnished}}The following furniture and items are provided and must be returned in the same condition, except for normal wear and tear: {{furnishings}}.
{{/if}}
Only Tenant and these other occupants may live at the Premises: {{other_occupants}}. Guests may stay no more than 14 nights in any 6-month period without the Landlord's written permission.
{{! Attorney: occupancy and guest limits; confirm they are reasonable and enforceable. }}

## 2. Term

{{#if fixed_term}}This lease starts on **{{lease_start}}** and ends on **{{lease_end}}**. If neither party gives notice to end it, it continues month-to-month after that date on the same terms.
{{else}}This is a month-to-month tenancy starting on **{{lease_start}}**. Either party may end it with written notice as required by Colorado law.
{{/if}}{{! Attorney: confirm required notice to end a month-to-month tenancy (C.R.S. 13-40-107, 21 days at time of drafting) and whether Colorado's 2024 "for cause" eviction law (HB24-1098) limits non-renewal for this kind of tenancy, including any exemption for owner-occupied homes (basement/room types). }}

If Landlord cannot give Tenant possession on the start date, Tenant does not owe rent for the days before possession is given. If possession is not given within 30 days after the start date, either party may cancel this agreement in writing before Tenant moves in, and Landlord will return everything Tenant paid.

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

If a check or electronic payment is returned or fails, Tenant will make that payment again by cashier's check, money order or another method the Landlord accepts, and pay the bank's fee for the failed payment.
{{! Attorney: confirm any Colorado limit on returned-payment fees and whether HB25-1090 (rental fee disclosure) requires listing every possible fee up front. }}
Landlord will give a written receipt for any rent paid in cash. Landlord will give at least the written notice required by Colorado law before any rent increase.
{{! Attorney: confirm current notice period for rent increases and any limit on how often rent may be raised. }}

**Safety:** Tenant should never pay any money before seeing the home in person and signing this agreement. KirayBet does not collect or hold any payments.

## 4. Security deposit

Tenant pays a security deposit of **\${{security_deposit}}** when signing. Landlord may use it only for unpaid rent, utilities Tenant owes, damage beyond normal wear and tear, and other amounts allowed by Colorado law.

Within one month after this tenancy ends and Tenant moves out (or within the longer period stated here, up to 60 days, if both parties initial: ______ / ______), Landlord will return the deposit or give Tenant a written statement listing the exact reasons for keeping any part of it, together with the rest of the deposit. Tenant should give Landlord a forwarding address in writing.
{{! Attorney: C.R.S. 38-12-103 to -104. Also check any newer cap on the deposit amount and rules on move-in condition reports. }}

Landlord and Tenant will walk through the Premises together at move-in and move-out and note its condition in writing, with photos if possible.

## 5. Utilities

Landlord pays: {{utilities_landlord}}.
Tenant pays: {{utilities_tenant}}.
If utilities are shared among people in the home, Tenant's share is calculated as written here, and Landlord will show the bills on request: ______________________.

## 6. Parking

{{#if parking}}Tenant may park as follows: {{parking_details}}. Vehicles must be in working order and currently registered.
{{else}}No parking space is included. Tenant must follow local street parking rules.
{{/if}}
## 7. Pets

{{#if pets_allowed}}Tenant may keep the following pet(s): {{pet_details}}. Pet deposit: \${{pet_deposit}}. Monthly pet rent: \${{pet_rent}}. Tenant is responsible for any damage caused by the pet and for keeping it from disturbing others.
{{else}}No pets are allowed without the Landlord's written permission.
{{/if}}Assistance animals for people with disabilities are not pets. They are allowed as required by fair housing law, without pet fees.
{{! Attorney: Colorado HB23-1068 limits pet deposits (about $300) and monthly pet rent (greater of $35 or 1.5% of rent) and restricts breed-based rules for insurance. Please confirm current limits. }}

## 8. Shared spaces and house rules

Shared spaces: {{shared_spaces}}.
House rules (cleaning, quiet hours, guests, kitchen and bathroom use): {{house_rules}}.
Tenant will keep shared spaces clean after use, respect other residents' privacy and belongings, and keep noise down, especially between 10 pm and 7 am.
Landlord or other residents may enter shared spaces at any time. Landlord will not enter Tenant's bedroom except as allowed in section 10.
{{! Attorney: for a room in a shared home, confirm how Colorado treats the arrangement (tenancy vs. lodger/roommate) and the right process to end it. }}

## 9. Repairs and condition of the home

Landlord will keep the Premises safe and fit to live in as required by Colorado's warranty of habitability, including working heat, plumbing, hot water and electricity, and freedom from conditions that are dangerous to health or safety.
**Every tenant is entitled to safe and healthy housing under Colorado's warranty of habitability. A landlord may not retaliate against a tenant in any way for reporting unsafe conditions, asking for repairs, or using the tenant's right to safe and healthy housing.**

**Tenant must tell Landlord about any condition that makes the home unfit to live in, in writing, by mail or hand delivery to {{landlord_notice_address}}, or by email to {{landlord_email}}.**

**El Inquilino debe notificar al Arrendador por escrito sobre cualquier condición que haga la vivienda inhabitable, por correo o entrega en mano a {{landlord_notice_address}}, o por correo electrónico a {{landlord_email}}.**
{{! Attorney: Colorado requires leases to state the habitability and anti-retaliation rights and how to give notice of uninhabitable conditions, in English and Spanish (C.R.S. 38-12-503 / 38-12-509; please confirm the cite and exact required wording). }}

Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any other problem that needs repair. Landlord will respond within the time required by Colorado law.
{{! Attorney: C.R.S. 38-12-501 to -511 (warranty of habitability), including response times added in 2024 (HB24-1098 / SB24-094?). Please confirm current response deadlines and tenant remedies. }}
Tenant will keep the Premises clean, use appliances properly, not make alterations or paint without written permission, and pay for damage caused by Tenant, occupants or guests beyond normal wear and tear.
Tenant will not change or add locks without Landlord's permission, and will give Landlord a copy of any new key.

## 10. Landlord's entry

Landlord may enter the Tenant's bedroom for repairs, inspections or showings after giving at least 24 hours' notice, at reasonable times, or at any time in an emergency.
{{! Attorney: Colorado has no general statute on landlord entry notice at time of drafting; 24 hours is a common standard. Confirm. }}

## 11. Safety, health and disclosures

**Smoke and carbon monoxide alarms.** The Premises has working smoke alarms and, where required by Colorado law, carbon monoxide alarms. Tenant will not disable them and will tell Landlord right away if one is not working.
{{! Attorney: C.R.S. 38-45-104 (CO alarms) and local fire codes. }}

**Bed bugs.** Tenant will tell Landlord promptly if Tenant suspects bed bugs. Landlord will arrange an inspection and treatment as required by Colorado law, and Tenant will cooperate.
{{! Attorney: C.R.S. 38-12-1001 et seq. (inspection within 96 hours, treatment, cost allocation). }}

**Radon disclosure.**

**The Colorado Department of Public Health and Environment strongly recommends that all tenants have an indoor radon test done before leasing a home, and recommends having radon levels reduced if high levels are found. High radon levels can be reduced by a radon mitigation professional.**

**Homes can have dangerous levels of indoor radon gas, which may put the people living there at risk of radon-induced lung cancer. Radon is a Class A human carcinogen, the leading cause of lung cancer in nonsmokers and the second leading cause of lung cancer overall. A landlord must give the tenant any known information about radon test results for the home.**

What Landlord knows about radon at the Premises (past tests, results, and any radon mitigation system): {{radon_info}}

Tenant confirms receiving, before signing, the Colorado Department of Public Health and Environment brochure "Radon in Real Estate and Rental Transactions in Colorado" (available at cdphe.colorado.gov).

Tenant's initials: ______ / ______
{{! Attorney: C.R.S. 38-12-801 to -804 (radon disclosure, bold-face statement, brochure, tenant remedies). The CDPHE brochure says the remedies for missing disclosure do not apply to leases of one year or less from Jan 1, 2026; please confirm, and confirm the statement wording above. }}

{{#if pre_1978}}**Lead-based paint disclosure.** The home was built before 1978.

**Lead Warning Statement: Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.**

What Landlord knows about lead-based paint or lead-based paint hazards at the Premises, and any records or reports Landlord has given Tenant: {{lead_info}}

Tenant confirms receiving the information above and the EPA pamphlet "Protect Your Family From Lead in Your Home" (epa.gov/lead) before signing. Both parties confirm that, to the best of their knowledge, the information they gave is true and accurate.

Tenant's initials: ______ / ______   Landlord's initials: ______
{{! Attorney: 42 U.S.C. 4852d and 40 CFR 745.113 (lessor disclosure, warning statement, signatures and dates, keep for 3 years). Confirm that initials plus the lease signatures meet the signature and date requirement, or whether a separate signed form is better. }}
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing. Growing marijuana at the Premises is not allowed.
{{! Attorney: confirm a landlord may prohibit home marijuana cultivation and on-premises use in a residential lease in Colorado. }}

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably. Tenant may not rent out any part of the Premises for short stays (for example on Airbnb or VRBO).
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Insurance, breaking this agreement, and legal costs

Landlord's insurance does not cover Tenant's belongings. Landlord recommends that Tenant get renter's insurance.

If Tenant does not pay rent or breaks another part of this agreement, Landlord may use the remedies Colorado law allows, including ending the tenancy through the court process. Landlord may not lock Tenant out, remove Tenant's belongings, or shut off utilities to force Tenant out. If Tenant moves out early, Landlord will make reasonable efforts to rent the Premises again to reduce what Tenant owes.

If either party goes to court over this agreement, the winning party may recover reasonable attorney fees and court costs, to the extent Colorado law allows.
{{! Attorney: confirm attorney-fee clauses are mutual and enforceable (C.R.S. 13-40-123 and 38-12-801 et seq.), current eviction notice periods (10-day demand under C.R.S. 13-40-104 at time of drafting), and the duty to mitigate. }}

## 17. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

Both parties agree that signatures on this agreement may be electronic, and that a signed copy sent electronically counts the same as the original.

**About this form.** Landlord and Tenant each understand and agree that KirayBet (kiraybet.org) only provided this blank form as a free sample. KirayBet is not a party to this agreement, is not a real estate broker or property manager, does not give legal advice, did not review the details either party filled in, and is not responsible for this agreement, the Premises, or what either party does under it. Each party had the chance to have this agreement reviewed by their own lawyer before signing.
{{! Attorney: please review this acknowledgment for enforceability as to both parties (neither of whom contracts with KirayBet through this document), and whether anything here could be read as KirayBet giving legal advice. }}

## Signatures

Landlord: ______________________________  Date: ______________
{{landlord_name}}

Tenant: ________________________________  Date: ______________
{{tenant_names}}

Tenant: ________________________________  Date: ______________
`,
};
