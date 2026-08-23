using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Shopera.Common.Exceptions;
using Shopera.Configuration;
using Shopera.Data;
using Shopera.Features.Admin.Categories.Contracts;
using Shopera.Features.Admin.Categories.Services;
using Shopera.Features.Admin.Coupons.Contracts;
using Shopera.Features.Admin.Coupons.Services;
using Shopera.Features.Coupons.Contracts;
using Shopera.Features.Coupons.Services;
using Shopera.Features.Admin.Contracts;
using Shopera.Features.Admin.Services;
using Shopera.Features.Admin.Management.Contracts;
using Shopera.Features.Admin.Management.Services;
using Shopera.Features.Buyer.Addresses.Contracts;
using Shopera.Features.Buyer.Addresses.Services;
using Shopera.Features.Buyer.Reviews.Contracts;
using Shopera.Features.Buyer.Reviews.Services;
using Shopera.Features.Buyer.Wishlist.Contracts;
using Shopera.Features.Buyer.Wishlist.Services;
using Shopera.Features.Catalogue.Contracts;
using Shopera.Features.Catalogue.Services;
using Shopera.Features.Cart.Contracts;
using Shopera.Features.Cart.Services;
using Shopera.Features.Identity.Authentication.Contracts;
using Shopera.Features.Identity.Authentication.Services;
using Shopera.Features.Notifications.Contracts;
using Shopera.Features.Notifications.Hubs;
using Shopera.Features.Notifications.Services;
using Shopera.Features.Orders.Contracts;
using Shopera.Features.Orders.Services;
using Shopera.Features.Profile.Contracts;
using Shopera.Features.Profile.Services;
using Shopera.Features.Seller.Analytics.Contracts;
using Shopera.Features.Seller.Analytics.Services;
using Shopera.Features.Seller.Products.Contracts;
using Shopera.Features.Seller.Products.Services;
using Shopera.Features.Seller.Stores.Contracts;
using Shopera.Features.Seller.Stores.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

string jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key is required. Configure it with user-secrets or an environment variable.");

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must contain at least 32 characters.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                string token = context.Request.Query["access_token"].ToString();
                if (!string.IsNullOrWhiteSpace(token) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Add controllers. Expected request/business exceptions are handled inside
// the MVC pipeline so normal 400/401/404/409 outcomes do not bubble out as
// debugger-stopping "User-Unhandled" exceptions. Unexpected failures still
// fall through to GlobalExceptionHandler.
builder.Services.AddScoped<SafeRequestExceptionFilter>();
builder.Services.AddControllers(options =>
    options.Filters.AddService<SafeRequestExceptionFilter>());

var frontendOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Frontend",
        policy =>
        {
            if (frontendOrigins.Length > 0)
            {
                policy
                    .WithOrigins(frontendOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        });
});
// Register SignalR. The explicit user-ID provider keeps Clients.User(...)
// aligned with the JWT NameIdentifier claim used throughout Shopera.
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, ShoperaUserIdProvider>();

// Register the notification service.
builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<IProfileService, ProfileService>();

// Register the admin seller-approval and messaging service.
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAdminManagementService, AdminManagementService>();
builder.Services.AddScoped<
    IAdminCategoryService,
    AdminCategoryService>();
builder.Services.AddScoped<
    IAdminCouponService,
    AdminCouponService>();

// Register the buyer address and product review services.
builder.Services.AddScoped<
    IBuyerAddressService,
    BuyerAddressService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();

// Register the seller-owned store submission service.
builder.Services.AddScoped<
    ISellerStoreService,
    SellerStoreService>();

// Register seller analytics backed by Order and financial snapshots.
builder.Services.AddScoped<ISellerAnalyticsService, SellerAnalyticsService>();

// Register seller catalogue management and public discovery.
builder.Services.AddScoped<
    ISellerProductService,
    SellerProductService>();
builder.Services.AddScoped<
    IProductCatalogueService,
    ProductCatalogueService>();

// Register product image validation service.
builder.Services.AddScoped<
    IProductImageValidator,
    ProductImageValidator>();

// Register product image service for handling binary uploads.
builder.Services.AddScoped<
    IProductImageService,
    ProductImageService>();

// Connect ApplicationDbContext to SQL Server.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "The DefaultConnection connection string was not found."
        )
    )
);

// Add OpenAPI.
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

// Configure development-only endpoints.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

if (frontendOrigins.Length > 0)
{
    app.UseCors("Frontend");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map the SignalR notification endpoint.
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

public partial class Program
{
}
