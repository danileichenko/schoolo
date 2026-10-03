# CONTEXT — school-auth

## Glossary

| Term | Definition | NOT |
|---|---|---|
| **School Admin** | The **single** staff member who registers the school tenant and manages teacher access for that school in this feature. Uses the same sign-in flow as Teachers after registration. | Not a platform-wide operator; not co-admin (deferred). |
| **Teacher** | Staff member who signs in to the **teacher workspace** for one school after accepting an invite. | Not a student; not a parent. |
| **School (tenant)** | The isolated organization boundary for one mandatory rollout; all staff data belongs to exactly one school. | Not a class; not a user account. |
| **Work email** | A deliverable email address in valid format used for staff identity and invites; not required to match a school domain in the pilot. | Not a personal-vs-work policy beyond valid format. |
| **Staff identity** | One work email maps to **at most one school** in the product for this feature; a person cannot be active staff at two schools. | Not multi-school membership. |
| **Teacher invite** | A pending invitation tying a work email to a school before the Teacher completes signup. Expires after **14 days** unless reissued. | Not a student enrollment; not an open registration link. |
| **Staff roster** | The list of Teachers (invite status: pending, active, expired, inactive) visible to the School Admin; includes **Teachers only**, not the School Admin row. | Does not include Students. |
| **Teacher workspace** | The post-sign-in experience for Teachers (journal tools added in later features). | Not the School Admin console. |
| **School administration** | The post-sign-in experience for the School Admin (invite teachers, view roster, revoke access). | Not the teacher workspace. |
| **Reissue invite** | Creates a **new** Teacher invite; the previous invite link stops working. | Not an extension of the old link. |
| **Student** | Learner who will use the mobile app — **out of scope for school-auth**. | Not in staff roster for this slice. |
