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

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

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
Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any problem that needs repair. Landlord will respond within the time required by Colorado law.
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

**Radon.** Colorado has high natural radon levels. Landlord has provided the radon disclosure and information required by Colorado law: ______________________.
{{! Attorney: confirm the current Colorado radon disclosure requirements for residential leases and attach the required form or notice. }}

{{#if pre_1978}}**Lead-based paint.** The home was built before 1978. Before signing, Landlord has given Tenant the EPA pamphlet "Protect Your Family From Lead in Your Home" and the federal Lead-Based Paint Disclosure form, which is attached and signed by both parties.
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing.

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably.
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

KirayBet (kiraybet.org) provided this form only. KirayBet is not a party to this agreement and does not give legal advice.

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

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

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
Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any problem that needs repair. Landlord will respond within the time required by Colorado law.
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

**Radon.** Colorado has high natural radon levels. Landlord has provided the radon disclosure and information required by Colorado law: ______________________.
{{! Attorney: confirm the current Colorado radon disclosure requirements for residential leases and attach the required form or notice. }}

{{#if pre_1978}}**Lead-based paint.** The home was built before 1978. Before signing, Landlord has given Tenant the EPA pamphlet "Protect Your Family From Lead in Your Home" and the federal Lead-Based Paint Disclosure form, which is attached and signed by both parties.
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing.

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably.
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

KirayBet (kiraybet.org) provided this form only. KirayBet is not a party to this agreement and does not give legal advice.

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

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

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
Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any problem that needs repair. Landlord will respond within the time required by Colorado law.
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

**Radon.** Colorado has high natural radon levels. Landlord has provided the radon disclosure and information required by Colorado law: ______________________.
{{! Attorney: confirm the current Colorado radon disclosure requirements for residential leases and attach the required form or notice. }}

{{#if pre_1978}}**Lead-based paint.** The home was built before 1978. Before signing, Landlord has given Tenant the EPA pamphlet "Protect Your Family From Lead in Your Home" and the federal Lead-Based Paint Disclosure form, which is attached and signed by both parties.
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing.

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably.
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

KirayBet (kiraybet.org) provided this form only. KirayBet is not a party to this agreement and does not give legal advice.

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

## 3. Rent

Rent is **\${{monthly_rent}} per month**, due on the **{{rent_due_day}}** day of each month. Rent is paid by: {{payment_method}}.
The first month's rent is due when this agreement is signed. If the lease starts on a day other than the due day, the first payment is prorated by the day.

If rent is not received in full within **7 days** after it is due, Tenant owes a late fee of **\${{late_fee}}**. The late fee will not be more than the greater of $50 or 5% of the past-due rent, and only one late fee may be charged for each late payment.
{{! Attorney: late fee rules from HB21-1121 (C.R.S. 38-12-105): 7-day grace period, cap of the greater of $50 or 5%. Please confirm still current. }}

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
Tenant will tell Landlord in writing (a text or email counts if Landlord accepts them for notices) about any problem that needs repair. Landlord will respond within the time required by Colorado law.
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

**Radon.** Colorado has high natural radon levels. Landlord has provided the radon disclosure and information required by Colorado law: ______________________.
{{! Attorney: confirm the current Colorado radon disclosure requirements for residential leases and attach the required form or notice. }}

{{#if pre_1978}}**Lead-based paint.** The home was built before 1978. Before signing, Landlord has given Tenant the EPA pamphlet "Protect Your Family From Lead in Your Home" and the federal Lead-Based Paint Disclosure form, which is attached and signed by both parties.
{{/if}}
**Smoking.** Smoking or vaping of any substance inside the Premises is not allowed unless the Landlord agrees in writing.

## 12. Subletting and ending the agreement early

Tenant may not sublet or transfer this agreement without the Landlord's written permission, which Landlord will not refuse unreasonably.
A Tenant who is a victim of domestic violence, domestic abuse, sexual assault or stalking may end this agreement early as allowed by Colorado law, and Tenants in military service may end it early as allowed by federal law.
{{! Attorney: C.R.S. 38-12-402 and the Servicemembers Civil Relief Act. }}

## 13. Moving out

At the end of the tenancy, Tenant will return all keys, remove all belongings, and leave the Premises clean and in the same condition as at move-in except for normal wear and tear.

## 14. Notices

Notices to the Landlord go to: {{landlord_notice_address}}, and by phone or email to {{landlord_contact}}. Notices to the Tenant go to the Premises, and by phone or email to: ______________________.

## 15. Fair housing

Landlord does not discriminate based on race, color, religion, sex, national origin, ancestry, disability, familial status, sexual orientation, gender identity or expression, marital status, creed, source of income, or any other status protected by federal or Colorado law.

## 16. Other terms

This is the whole agreement between the parties. Any change must be in writing and signed by both. If any part of this agreement is not valid under the law, the rest still applies. Colorado law governs this agreement. Anything this agreement says that conflicts with Colorado landlord-tenant law is replaced by what the law requires.
If this agreement is also given in Amharic, the English version is the official one.

Additional terms agreed by both parties: ______________________________________________

KirayBet (kiraybet.org) provided this form only. KirayBet is not a party to this agreement and does not give legal advice.

## Signatures

Landlord: ______________________________  Date: ______________
{{landlord_name}}

Tenant: ________________________________  Date: ______________
{{tenant_names}}

Tenant: ________________________________  Date: ______________
`,
};
