using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Transcendence.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationFks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorUserId",
                schema: "app",
                table: "Notifications",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RelatedConversationId",
                schema: "app",
                table: "Notifications",
                column: "RelatedConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RelatedRequestId",
                schema: "app",
                table: "Notifications",
                column: "RelatedRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                schema: "app",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId",
                schema: "app",
                table: "ConversationParticipants",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_users_UserId",
                schema: "app",
                table: "ConversationParticipants",
                column: "UserId",
                principalSchema: "app",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_users_SenderId",
                schema: "app",
                table: "Messages",
                column: "SenderId",
                principalSchema: "app",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Conversations_RelatedConversationId",
                schema: "app",
                table: "Notifications",
                column: "RelatedConversationId",
                principalSchema: "app",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_FriendshipRequests_RelatedRequestId",
                schema: "app",
                table: "Notifications",
                column: "RelatedRequestId",
                principalSchema: "app",
                principalTable: "FriendshipRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_users_ActorUserId",
                schema: "app",
                table: "Notifications",
                column: "ActorUserId",
                principalSchema: "app",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_users_UserId",
                schema: "app",
                table: "Notifications",
                column: "UserId",
                principalSchema: "app",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationParticipants_users_UserId",
                schema: "app",
                table: "ConversationParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_users_SenderId",
                schema: "app",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Conversations_RelatedConversationId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_FriendshipRequests_RelatedRequestId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_users_ActorUserId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_users_UserId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_ActorUserId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RelatedConversationId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RelatedRequestId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                schema: "app",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_UserId",
                schema: "app",
                table: "ConversationParticipants");
        }
    }
}
