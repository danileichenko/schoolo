# Tracker — school-auth

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | Promote unique schools.name migration | migration | Backend Lead | S | — | todo |
| T2 | Promote staff_members table migration | migration | Backend Lead | S | T1 | todo |
| T3 | Promote teacher_invites table migration | migration | Backend Lead | S | T1 | todo |
| T4 | Promote sessions table migration | migration | Backend Lead | S | T2 | todo |
| T5 | Implement School domain unique-name rules | domain | Backend Lead | S | — | todo |
| T6 | Implement staff, invite, and session domain rules | domain | Backend Lead | M | — | todo |
| T7 | Wire schools Prisma repository adapter | infra | Backend Lead | S | T1, T5 | todo |
| T8 | Wire users Prisma repos and EmailPort adapter | infra | Backend Lead | M | T2, T3, T4, T6 | todo |
| T9 | Implement RegisterSchool use case | app | Backend Lead | M | T7, T8 | todo |
| T10 | Implement InviteTeacher and ReissueInvite use cases | app | Backend Lead | M | T8 | todo |
| T11 | Implement AcceptInvite use case | app | Backend Lead | M | T8 | todo |
| T12 | Implement SignIn use case with lockout | app | Backend Lead | M | T8 | todo |
| T13 | Implement roster, revoke, and tenancy checks | app | Backend Lead | M | T7, T8 | todo |
| T14 | Expose register, sign-in, and accept-invite HTTP ports | ports | Backend Lead | M | T9, T11, T12 | todo |
| T15 | Expose invite, reissue, roster, and revoke HTTP ports | ports | Backend Lead | M | T10, T13 | todo |
| T16 | Compose DI, session cookie middleware, and route registration | wiring | Backend Lead | M | T14, T15 | todo |
| T17 | Build public register, sign-in, and accept-invite screens | ui | Frontend Lead | L | T16 | todo |
| T18 | Build school administration staff roster screen | ui | Frontend Lead | L | T16 | todo |
| T19 | Build teacher workspace shell placeholder | ui | Frontend Lead | S | T16 | todo |

**Total:** 19 tasks, ~12–14 person-days (size M, dual surface).
