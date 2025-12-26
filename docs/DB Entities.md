**User** (entity)
```text
User ── Profile (1:1)
  │
  ├── Post (1:N)
  │     └── Comment (1:N)
  │
  ├── Like (N:M) ── Post
  │
  └── Friendship (N:M) ── User
```

**Relationship types:**
- **1 : 1 (One-to-One)**
	One record in entity A is linked to exactly one record in entity B.
- **1 : N (One-to-Many)**
	One record in entity A can be linked to many records in entity B.
- **N : M (Many-to-Many)**
    Multiple records in entity A can be linked to multiple records in entity B, usually through a linking table.

ModerationLog (entity)
 ├── Post
 └── Comment

*  *( "for Minor: Content moderation AI (auto moderation, auto deletion, auto warning, etc.")*


#### **🔹 User (entity) — core entity**

  **Purpose:**
Represents a system user and serves as the **central entity** of the application.


**Why it exists as a separate entity:**
- stores authentication-related data (email, password hash)
- defines user identity and role in the system
- acts as the owner of most other entities
   
**Key responsibilities:**

- authentication and authorization
- ownership of content (posts, comments)
- participation in social relationships
    
    **User is the core entity** — almost everything else in the system is directly or indirectly connected to users.


#### **🔹 Like (relationship entity) — N : M (User ↔ Post)**

**Purpose:** Represents the fact that a user liked a post.

**Why it is a separate table:**
- implements a many-to-many relationship between users and posts  
- stores additional data (e.g. when the like was created)
- prevents data duplication
      

**Important clarification:**
- Like has its **own table and class**
- Like **never exists on its own**
     It only exists as a link:
User ───< Like >─── Post  
 **Like** is a relationship entity - it has its own table and class, but it only exists as a link between User and Post.

####  **🔹 Profile (entity) — 1 : 1**

Represents public user information that can be shown to other users.
 - not all user data is public
  - profile can be extended independently
  - privacy settings belong here
    
Profile depends on User, but not vice versa.

#### **🔹 Post (entity) — 1 : N (User → Post)**

Represents user-generated content.

- has its own lifecycle
- can be moderated
- belongs to exactly one user
    
 A post cannot exist without an author.

#### **🔹 Comment (entity) — 1 : N (Post → Comment)**

Represents interaction with content.

- belongs to a post
- authored by a user
    
 Comment is similar to Post, but always scoped to another entity.

---

#### **🔹 Friendship (entity) — N : M (User ↔ User)**

Represents social connections between users.

- relationship has its own state (pending / accepted / rejected)    
- cannot be stored directly inside User
     

 This is a relationship entity, not a core business object.

#### **🔹 ModerationLog (entity) — OPTIONAL**
 
Stores moderation decisions for posts and comments.

- not required for basic moderation  
- useful for transparency and explanation
    
 This is a technical/log entity, not a core domain entity.




