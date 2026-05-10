using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Transcendence.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeliveredToMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDelivered",
                schema: "app",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDelivered",
                schema: "app",
                table: "Messages");
        }
    }
}
