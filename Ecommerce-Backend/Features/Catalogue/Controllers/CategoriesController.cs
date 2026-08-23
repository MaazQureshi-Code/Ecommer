using Microsoft.AspNetCore.Mvc;
using Shopera.Features.Catalogue.Contracts;
using Shopera.Features.Catalogue.DTOs;

namespace Shopera.Features.Catalogue.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public sealed class CategoriesController : ControllerBase
    {
        private readonly IProductCatalogueService
            _catalogueService;

        public CategoriesController(
            IProductCatalogueService catalogueService)
        {
            _catalogueService = catalogueService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<
            PublicCategoryResponse>>> GetCategories()
        {
            return Ok(
                await _catalogueService.GetCategoriesAsync());
        }
    }
}
