using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Posidre.Server.Controllers;
using Posidre.Server.Data;
using Posidre.Server.Models;

namespace Posidre.Server.Tests.Controllers
{
    public class TeacherControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private TeacherController GetControllerWithUser(ApplicationDbContext context, string userId = "test-teacher-id")
        {
            var controller = new TeacherController(context);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, "test@teacher.com"),
                new Claim(ClaimTypes.Role, "Teacher")
            };

            var identity = new ClaimsIdentity(claims, "TestAuthentication");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            };

            return controller;
        }

        [Fact]
        public async Task CreateSurvey_ShouldGenerateUniquePinCode()
        {
            var context = GetInMemoryDbContext();
            var controller = GetControllerWithUser(context);

            var result = await controller.CreateSurvey();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var survey = Assert.IsType<Survey>(okResult.Value);

            Assert.NotNull(survey);
            Assert.NotNull(survey.PinCode);
            Assert.Equal(6, survey.PinCode.Length);
            Assert.All(survey.PinCode, c => Assert.True(char.IsDigit(c)));
        }

        [Fact]
        public async Task CreateSurvey_ShouldAssignCorrectTeacherId()
        {
            var context = GetInMemoryDbContext();
            var teacherId = "my-teacher-123";
            var controller = GetControllerWithUser(context, teacherId);

            var result = await controller.CreateSurvey();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var survey = Assert.IsType<Survey>(okResult.Value);

            Assert.Equal(teacherId, survey.TeacherId);
        }

        [Fact]
        public async Task CreateSurvey_ShouldCreateQuestionsWithCorrectOrder()
        {
            var context = GetInMemoryDbContext();
            var controller = GetControllerWithUser(context);

            var result = await controller.CreateSurvey();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var survey = Assert.IsType<Survey>(okResult.Value);

            Assert.NotNull(survey.Questions);
            Assert.Equal(20, survey.Questions.Count); // ✅ CORRIGÉ: 20 questions au lieu de 6

            // Vérifie que les questions sont bien ordonnées
            var orderedQuestions = survey.Questions.OrderBy(q => q.Order).ToList();
            for (int i = 0; i < orderedQuestions.Count; i++)
            {
                Assert.True(orderedQuestions[i].Order > 0);
                Assert.True(orderedQuestions[i].Order <= 24); // Les numéros vont jusqu'à 24
            }
        }

        [Fact]
        public async Task CreateSurvey_ShouldPersistToDatabase()
        {
            var context = GetInMemoryDbContext();
            var controller = GetControllerWithUser(context);

            var result = await controller.CreateSurvey();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var survey = Assert.IsType<Survey>(okResult.Value);

            var savedSurvey = await context.Surveys
                .Include(s => s.Questions)
                .FirstOrDefaultAsync(s => s.Id == survey.Id);

            Assert.NotNull(savedSurvey);
            Assert.Equal(survey.PinCode, savedSurvey.PinCode);
            Assert.Equal(20, savedSurvey.Questions.Count); // ✅ CORRIGÉ: 20 questions
        }

        [Fact]
        public async Task GetSurveys_ShouldReturnOnlyTeachersSurveys()
        {
            var context = GetInMemoryDbContext();
            var teacherId1 = "teacher-1";
            var teacherId2 = "teacher-2";

            context.Surveys.AddRange(
                new Survey { TeacherId = teacherId1, Title = "Survey 1", PinCode = "111111" },
                new Survey { TeacherId = teacherId1, Title = "Survey 2", PinCode = "222222" },
                new Survey { TeacherId = teacherId2, Title = "Survey 3", PinCode = "333333" }
            );
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, teacherId1);

            var result = await controller.GetMySurveys();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var surveys = Assert.IsAssignableFrom<IEnumerable<Survey>>(okResult.Value);

            Assert.Equal(2, surveys.Count());
            Assert.All(surveys, s => Assert.Equal(teacherId1, s.TeacherId));
        }

        [Fact]
        public async Task DeleteSurvey_ShouldRemoveSurveyAndRelatedData()
        {
            var context = GetInMemoryDbContext();
            var teacherId = "test-teacher";

            var survey = new Survey
            {
                TeacherId = teacherId,
                Title = "Test Survey",
                PinCode = "123456",
                Questions = new List<Question>
                {
                    new Question { Text = "Q1", Type = "text", Order = 1 }
                }
            };
            context.Surveys.Add(survey);
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, teacherId);

            var result = await controller.DeleteSurvey(survey.Id);

            Assert.IsType<OkObjectResult>(result); // ✅ CORRIGÉ: OkObjectResult au lieu de OkResult

            var deletedSurvey = await context.Surveys.FindAsync(survey.Id);
            Assert.Null(deletedSurvey);
        }

        [Fact]
        public async Task DeleteSurvey_ShouldReturn404_WhenSurveyNotFound()
        {
            var context = GetInMemoryDbContext();
            var controller = GetControllerWithUser(context);

            var result = await controller.DeleteSurvey(999);

            Assert.IsType<NotFoundObjectResult>(result); // ✅ CORRIGÉ: NotFoundObjectResult
        }

        [Fact]
        public async Task DeleteSurvey_ShouldReturnForbidden_WhenNotOwner()
        {
            var context = GetInMemoryDbContext();

            var survey = new Survey
            {
                TeacherId = "other-teacher",
                Title = "Other's Survey",
                PinCode = "111111"
            };
            context.Surveys.Add(survey);
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, "my-teacher");

            var result = await controller.DeleteSurvey(survey.Id);

            Assert.IsType<ForbidResult>(result); // ✅ CORRIGÉ: ForbidResult au lieu de ObjectResult
        }
    }
}