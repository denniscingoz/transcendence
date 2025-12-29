| Entity            | Main API Responsibility            | Example Endpoints                                                                          |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| **User**          | registration, login, token refresh | `POST /auth/register``POST /auth/login``POST /auth/refresh`                                |
| **Profile**       | view/edit public user data         | `GET /users/{userId}/profile``PUT /users/{userId}/profile`                                 |
| **UserSettings**  | update preferences                 | `GET /users/me/settings``PUT /users/me/settings`                                           |
| **RefreshToken**  | refresh / revoke sessions          | `POST /auth/refresh``POST /auth/logout`                                                    |
| **Post**          | create, read, update, delete posts | `POST /posts``GET /posts/{postId}``PUT /posts/{postId}``DELETE /posts/{postId}``GET /feed` |
| **Media**         | upload / attach media              | `POST /media/upload``POST /posts/{postId}/media`                                           |
| **Like**          | like / unlike posts                | `POST /posts/{postId}/likes``DELETE /posts/{postId}/likes`                                 |
| **Comment**       | add / edit / delete comments       | `POST /posts/{postId}/comments``PUT /comments/{commentId}``DELETE /comments/{commentId}`   |
| **Follow**        | follow / unfollow users            | `POST /users/{userId}/follow``DELETE /users/{userId}/follow`                               |
| **Notification**  | fetch / mark as read               | `GET /notifications``PUT /notifications/{id}/read`                                         |
| **Report**        | submit reports                     | `POST /reports`                                                                            |
| **ModerationLog** | moderation review & status         | `GET /moderation/queue``GET /moderation/{targetId}``PUT /moderation/{logId}`               |
### DTO

| Entity        | Example DTOs                 |     |
| ------------- | ---------------------------- | --- |
| User          | UserPublicDto, UserAuthDto   |     |
| Profile       | ProfileDto, UpdateProfileDto |     |
| UserSettings  | UserSettingsDto              |     |
| Post          | PostDto, CreatePostDto       |     |
| Comment       | CommentDto, CreateCommentDto |     |
| Like          | LikeDto                      |     |
| Follow        | FollowDto                    |     |
| Notification  | NotificationDto              |     |
| Report        | CreateReportDto              |     |
| ModerationLog | ModerationStatusDto          |     |
