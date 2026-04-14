using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Transcendence.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexOnUsersAvatarFileId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_AvatarFileId",
                schema: "app",
                table: "users");

            migrationBuilder.CreateIndex(
                name: "IX_users_AvatarFileId",
                schema: "app",
                table: "users",
                column: "AvatarFileId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_AvatarFileId",
                schema: "app",
                table: "users");

            migrationBuilder.CreateIndex(
                name: "IX_users_AvatarFileId",
                schema: "app",
                table: "users",
                column: "AvatarFileId");
        }
    }
}
