# CONTEXT — school-auth

## Glossary

| Term | Definition | NOT |
|---|---|---|
| **School Admin** | Staff member who registers the school tenant and manages teacher access for that school only. | Not a platform-wide operator; not a generic «admin user». |
| **Teacher** | Staff member who signs in to the teacher web workspace for one school after accepting an invite. | Not a student; not a parent. |
| **School (tenant)** | The isolated organization boundary for one mandatory rollout; all staff data belongs to exactly one school. | Not a class; not a user account. |
| **Teacher invite** | A pending invitation tying a work email to a school before the Teacher completes signup. | Not a student enrollment; not an open registration link. |
| **Staff roster** | The list of Teachers (and their invite status) visible to the School Admin for their school. | Does not include Students in this feature. |
| **Student** | Learner who will use the mobile app — **out of scope for school-auth**; added in a later feature. | Not a Teacher; not in staff roster for this slice. |
