## The most important page to understand

Every permission in TaskFlow is granted through a role, and never directly to a person. Once that clicks, the rest of the access model is straightforward.

## Naming roles

Name a role for the **job**, not the person: "Project manager", not "Sam". You will reuse it every time somebody new does that job, and you will not have to remember what "Sam's role" was supposed to mean a year from now.

## What a role controls

Ticking permissions on a role decides whether its holders can do things like create projects, assign tasks, invite members, manage teams or run meetings. Changes take effect immediately for everyone holding that role.

## The owner bypass

The organization's owner always has full access, regardless of roles. This is deliberate: without it, one bad permission change could lock everybody out of their own workspace with no way back.

## The order that works

1. Create your **roles** first.
2. Invite **members** into those roles.
3. Group them into **teams**.
4. Then create **projects** and **tasks**.

Doing it in the other order means going back to fix who can do what - usually after somebody has already hit a wall.

## When to add a role instead of a permission

If you find yourself wanting to give one person in a role something the others should not have, that is the signal to create a new role. Widening the existing one to fit one person quietly widens it for everybody.
