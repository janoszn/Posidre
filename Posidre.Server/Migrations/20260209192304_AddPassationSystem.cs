using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Posidre.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPassationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "SurveyPins");

            migrationBuilder.DropTable(
                name: "TodoItems");

            migrationBuilder.DropTable(
                name: "Surveys");

            migrationBuilder.DropColumn(
                name: "PinUsed",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "ClassNumber",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "SurveyId",
                table: "Submissions",
                newName: "PassationId");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "SubmittedAt",
                table: "Submissions",
                type: "datetimeoffset",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "CodeId",
                table: "Submissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CompletedInSeconds",
                table: "Submissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MeasurementTime",
                table: "Submissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Questionnaires",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsTemplate = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questionnaires", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Passations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionnaireId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SchoolAdminId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SchoolYear = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TeacherEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ClosedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ArchivedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Passations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Passations_Questionnaires_QuestionnaireId",
                        column: x => x.QuestionnaireId,
                        principalTable: "Questionnaires",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "QuestionnaireQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionnaireId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScaleMin = table.Column<int>(type: "int", nullable: true),
                    ScaleMax = table.Column<int>(type: "int", nullable: true),
                    ScaleMinLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScaleMaxLabel = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionnaireQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionnaireQuestions_Questionnaires_QuestionnaireId",
                        column: x => x.QuestionnaireId,
                        principalTable: "Questionnaires",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PassationGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PassationId = table.Column<int>(type: "int", nullable: false),
                    GroupName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StudentCount = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PassationGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PassationGroups_Passations_PassationId",
                        column: x => x.PassationId,
                        principalTable: "Passations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PassationCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PassationId = table.Column<int>(type: "int", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    TimesUsed = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastActivatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastUsedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PassationCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PassationCodes_PassationGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "PassationGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PassationCodes_Passations_PassationId",
                        column: x => x.PassationId,
                        principalTable: "Passations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_CodeId",
                table: "Submissions",
                column: "CodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_MeasurementTime",
                table: "Submissions",
                column: "MeasurementTime");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_PassationId",
                table: "Submissions",
                column: "PassationId");

            migrationBuilder.CreateIndex(
                name: "IX_Answers_QuestionId",
                table: "Answers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_PassationCodes_Code",
                table: "PassationCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PassationCodes_GroupId",
                table: "PassationCodes",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PassationCodes_PassationId",
                table: "PassationCodes",
                column: "PassationId");

            migrationBuilder.CreateIndex(
                name: "IX_PassationGroups_PassationId",
                table: "PassationGroups",
                column: "PassationId");

            migrationBuilder.CreateIndex(
                name: "IX_Passations_IsArchived",
                table: "Passations",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_Passations_QuestionnaireId",
                table: "Passations",
                column: "QuestionnaireId");

            migrationBuilder.CreateIndex(
                name: "IX_Passations_SchoolAdminId",
                table: "Passations",
                column: "SchoolAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionnaireQuestions_QuestionnaireId",
                table: "QuestionnaireQuestions",
                column: "QuestionnaireId");

            migrationBuilder.CreateIndex(
                name: "IX_Questionnaires_CreatedBy",
                table: "Questionnaires",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Answers_QuestionnaireQuestions_QuestionId",
                table: "Answers",
                column: "QuestionId",
                principalTable: "QuestionnaireQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_PassationCodes_CodeId",
                table: "Submissions",
                column: "CodeId",
                principalTable: "PassationCodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Passations_PassationId",
                table: "Submissions",
                column: "PassationId",
                principalTable: "Passations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Answers_QuestionnaireQuestions_QuestionId",
                table: "Answers");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_PassationCodes_CodeId",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Passations_PassationId",
                table: "Submissions");

            migrationBuilder.DropTable(
                name: "PassationCodes");

            migrationBuilder.DropTable(
                name: "QuestionnaireQuestions");

            migrationBuilder.DropTable(
                name: "PassationGroups");

            migrationBuilder.DropTable(
                name: "Passations");

            migrationBuilder.DropTable(
                name: "Questionnaires");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_CodeId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_MeasurementTime",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_PassationId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Answers_QuestionId",
                table: "Answers");

            migrationBuilder.DropColumn(
                name: "CodeId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "CompletedInSeconds",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "MeasurementTime",
                table: "Submissions");

            migrationBuilder.RenameColumn(
                name: "PassationId",
                table: "Submissions",
                newName: "SurveyId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "SubmittedAt",
                table: "Submissions",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset");

            migrationBuilder.AddColumn<string>(
                name: "PinUsed",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClassNumber",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Surveys",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SchoolAdminId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SchoolYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StudentCount = table.Column<int>(type: "int", nullable: false),
                    TeacherEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surveys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TodoItems_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SurveyId = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    ScaleMax = table.Column<int>(type: "int", nullable: true),
                    ScaleMaxLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScaleMin = table.Column<int>(type: "int", nullable: true),
                    ScaleMinLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyPins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubmissionId = table.Column<int>(type: "int", nullable: true),
                    SurveyId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    Pin = table.Column<string>(type: "nvarchar(450)", nullable: false)
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
                name: "IX_Questions_SurveyId",
                table: "Questions",
                column: "SurveyId");

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

            migrationBuilder.CreateIndex(
                name: "IX_TodoItems_UserId",
                table: "TodoItems",
                column: "UserId");
        }
    }
}
