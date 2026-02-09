using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Posidre.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolAdminAndMultiplePins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TeacherId",
                table: "Surveys",
                newName: "TeacherEmail");

            migrationBuilder.RenameColumn(
                name: "PinCode",
                table: "Surveys",
                newName: "SchoolYear");

            migrationBuilder.RenameColumn(
                name: "StudentName",
                table: "Submissions",
                newName: "PinUsed");

            migrationBuilder.AddColumn<string>(
                name: "ClassNumber",
                table: "Surveys",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SchoolAdminId",
                table: "Surveys",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StudentCount",
                table: "Surveys",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "SurveyPins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SurveyId = table.Column<int>(type: "int", nullable: false),
                    Pin = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmissionId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyPins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyPins_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SurveyPins_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPins_Pin",
                table: "SurveyPins",
                column: "Pin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPins_SubmissionId",
                table: "SurveyPins",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPins_SurveyId",
                table: "SurveyPins",
                column: "SurveyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SurveyPins");

            migrationBuilder.DropColumn(
                name: "ClassNumber",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "SchoolAdminId",
                table: "Surveys");

            migrationBuilder.DropColumn(
                name: "StudentCount",
                table: "Surveys");

            migrationBuilder.RenameColumn(
                name: "TeacherEmail",
                table: "Surveys",
                newName: "TeacherId");

            migrationBuilder.RenameColumn(
                name: "SchoolYear",
                table: "Surveys",
                newName: "PinCode");

            migrationBuilder.RenameColumn(
                name: "PinUsed",
                table: "Submissions",
                newName: "StudentName");
        }
    }
}
