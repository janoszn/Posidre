using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearningProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "Questions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OptionsJson",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScaleMax",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScaleMaxLabel",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScaleMin",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScaleMinLabel",
                table: "Questions",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "OptionsJson",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ScaleMax",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ScaleMaxLabel",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ScaleMin",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "ScaleMinLabel",
                table: "Questions");
        }
    }
}
