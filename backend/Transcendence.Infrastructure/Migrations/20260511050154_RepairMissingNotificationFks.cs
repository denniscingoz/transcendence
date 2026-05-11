using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Transcendence.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RepairMissingNotificationFks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE schemaname = 'app'
                          AND tablename = 'Notifications'
                          AND indexname = 'IX_Notifications_ActorUserId'
                    ) THEN
                        CREATE INDEX "IX_Notifications_ActorUserId"
                            ON app."Notifications" ("ActorUserId");
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE schemaname = 'app'
                          AND tablename = 'Notifications'
                          AND indexname = 'IX_Notifications_RelatedConversationId'
                    ) THEN
                        CREATE INDEX "IX_Notifications_RelatedConversationId"
                            ON app."Notifications" ("RelatedConversationId");
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE schemaname = 'app'
                          AND tablename = 'Notifications'
                          AND indexname = 'IX_Notifications_RelatedRequestId'
                    ) THEN
                        CREATE INDEX "IX_Notifications_RelatedRequestId"
                            ON app."Notifications" ("RelatedRequestId");
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE schemaname = 'app'
                          AND tablename = 'Notifications'
                          AND indexname = 'IX_Notifications_UserId'
                    ) THEN
                        CREATE INDEX "IX_Notifications_UserId"
                            ON app."Notifications" ("UserId");
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE schemaname = 'app'
                          AND tablename = 'ConversationParticipants'
                          AND indexname = 'IX_ConversationParticipants_UserId'
                    ) THEN
                        CREATE INDEX "IX_ConversationParticipants_UserId"
                            ON app."ConversationParticipants" ("UserId");
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_ConversationParticipants_users_UserId'
                    ) THEN
                        ALTER TABLE app."ConversationParticipants"
                            ADD CONSTRAINT "FK_ConversationParticipants_users_UserId"
                            FOREIGN KEY ("UserId") REFERENCES app."users" ("Id") ON DELETE CASCADE;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Messages_users_SenderId'
                    ) THEN
                        ALTER TABLE app."Messages"
                            ADD CONSTRAINT "FK_Messages_users_SenderId"
                            FOREIGN KEY ("SenderId") REFERENCES app."users" ("Id") ON DELETE RESTRICT;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Notifications_Conversations_RelatedConversationId'
                    ) THEN
                        ALTER TABLE app."Notifications"
                            ADD CONSTRAINT "FK_Notifications_Conversations_RelatedConversationId"
                            FOREIGN KEY ("RelatedConversationId") REFERENCES app."Conversations" ("Id") ON DELETE SET NULL;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Notifications_FriendshipRequests_RelatedRequestId'
                    ) THEN
                        ALTER TABLE app."Notifications"
                            ADD CONSTRAINT "FK_Notifications_FriendshipRequests_RelatedRequestId"
                            FOREIGN KEY ("RelatedRequestId") REFERENCES app."FriendshipRequests" ("Id") ON DELETE SET NULL;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Notifications_users_ActorUserId'
                    ) THEN
                        ALTER TABLE app."Notifications"
                            ADD CONSTRAINT "FK_Notifications_users_ActorUserId"
                            FOREIGN KEY ("ActorUserId") REFERENCES app."users" ("Id") ON DELETE SET NULL;
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Notifications_users_UserId'
                    ) THEN
                        ALTER TABLE app."Notifications"
                            ADD CONSTRAINT "FK_Notifications_users_UserId"
                            FOREIGN KEY ("UserId") REFERENCES app."users" ("Id") ON DELETE CASCADE;
                    END IF;
                END
                $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    ALTER TABLE app."Notifications" DROP CONSTRAINT IF EXISTS "FK_Notifications_users_UserId";
                    ALTER TABLE app."Notifications" DROP CONSTRAINT IF EXISTS "FK_Notifications_users_ActorUserId";
                    ALTER TABLE app."Notifications" DROP CONSTRAINT IF EXISTS "FK_Notifications_FriendshipRequests_RelatedRequestId";
                    ALTER TABLE app."Notifications" DROP CONSTRAINT IF EXISTS "FK_Notifications_Conversations_RelatedConversationId";
                    ALTER TABLE app."Messages" DROP CONSTRAINT IF EXISTS "FK_Messages_users_SenderId";
                    ALTER TABLE app."ConversationParticipants" DROP CONSTRAINT IF EXISTS "FK_ConversationParticipants_users_UserId";

                    DROP INDEX IF EXISTS app."IX_ConversationParticipants_UserId";
                    DROP INDEX IF EXISTS app."IX_Notifications_UserId";
                    DROP INDEX IF EXISTS app."IX_Notifications_RelatedRequestId";
                    DROP INDEX IF EXISTS app."IX_Notifications_RelatedConversationId";
                    DROP INDEX IF EXISTS app."IX_Notifications_ActorUserId";
                END
                $$;
                """);
        }
    }
}
