
⸻

1️⃣ General Structure Concept

The backend is divided by responsibility, not by UI features.

In a very simplified way:
• API — accepts requests
• Application — business logic
• Domain — entities and rules
• Infrastructure — database, external services

⸻

2️⃣ Back end Project Structure
```text
src/
 ├── Api/
 │    ├── Controllers/        (или Endpoints/ если Minimal API)
 │    ├── Middleware/
 │    │     ├── ErrorHandlingMiddleware.cs
 │    │     ├── LocalizationMiddleware.cs
 │    ├── Program.cs
 │
 ├── Application/
 │    ├── Posts/
 │    │     ├── CreatePost/
 │    │     │     ├── CreatePostCommand.cs
 │    │     │     ├── CreatePostHandler.cs
 │    │     │     └── CreatePostDto.cs
 │    │
 │    ├── Moderation/
 │    │     ├── Interfaces/
 │    │     │     └── IModerationService.cs
 │    │     ├── ModerationDecision.cs
 │    │     └── ModerationResult.cs
 │
 ├── Infrastructure/
 │    ├── AI/
 │    │     ├── OpenAIModerationService.cs (или другой провайдер)
 │    │
 │    ├── BackgroundJobs/
 │    │     └── ModeratePostWorker.cs
 │    │
 │    ├── Persistence/
 │    │     ├── AppDbContext.cs
 │    │     ├── Entities/
 │    │     │     ├── Post.cs
 │    │     │     └── ModerationLog.cs
 │
 ├── Domain/
 │    ├── Entities/
 │    │     ├── Post.cs
 │    │     └── User.cs
 │    ├── Enums/
 │    │     └── PostStatus.cs
 │
 └── Shared/
      ├── Localization/
      │     └── ErrorMessages.de.json
      ├── Settings/
      │     └── ModerationSettings.cs
```
🔹 API

**Backend entry point**

• Controllers
	→ accept HTTP requests
	→ do not contain business logic
• Middlewares
	→ auth
	→ logging
	→ error handling
• Program.cs
	→ application configuration
	→ DI
	→ middleware pipeline

The API layer is only responsible for handling requests and responses.

🔹 Application

**The Heart of Logic**

• Services
	→ user logic
	→ posts logic
	→ moderation logic
• DTOs
	→ data transfer objects
	→ entity leak protection
• Interfaces
	→ contracts
	→ allow implementation changes

📌 Phrase:

“Business rules live in the Application layer, not in controllers.”

🔹 Domain

**Clean System Model**

• Entities
	→ User
	→ Profile
	→ Post
	→ Comment
• Enums
	→ Roles
	→ ModerationStatus

📌 Important:
	• There is no database here
	• There are no framework dependencies here

⸻

🔹 Infrastructure

**Technical Implementation**

•Data
	→ DbContext
	→ migrations 
•Repositories
	→ working with the database 
•External
	→ AI moderation API
	→ email
	→ third-party services

Infrastructure contains technical details, not business logic.

🔹 Shared (optional, but nice)
• General stuff
• Configurations
• Helpers

**me** (backend/architecture): 
•Domain 
• Application 
• Infrastructure 
• API structure 
•auth/moderation integration

**Michaela** (frontend): 
•UI 
• i18n 
• language switch 
• API consumption

**Denis (users)**: 
• user-related services 
• profile logic 
•permissions 
• features on top of auth
