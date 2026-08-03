# Test API Script for Parto CMS - English Only
$baseUrl = "http://localhost:3006/api/v1"

# Login first
$loginBody = @{
    email = "admin@parto.ir"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken
Write-Host "Login successful, token received" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create a Category
Write-Host "Creating Category..." -ForegroundColor Yellow
$categoryBody = @{
    nameEn = "Test Category"
    nameFa = "Test Category FA"
    slug = "test-category"
    descriptionEn = "A test category created by AI"
    descriptionFa = "Test category description FA"
    type = "general"
    status = "PUBLISHED"
} | ConvertTo-Json

try {
    $category = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Body $categoryBody -Headers $headers -ContentType "application/json"
    Write-Host "Category created: $($category.nameEn)" -ForegroundColor Green
} catch {
    Write-Host "Category creation failed: $_" -ForegroundColor Yellow
}

# Create a Project
Write-Host "Creating Project..." -ForegroundColor Yellow
$projectBody = @{
    titleEn = "AI Test Project"
    titleFa = "AI Test Project FA"
    slug = "ai-test-project"
    descriptionEn = "This is a test project created by AI assistant"
    descriptionFa = "Test project description FA"
    status = "PUBLISHED"
    year = 2024
    locationEn = "Tehran, Iran"
    locationFa = "Tehran Iran FA"
    clientNameEn = "Test Client Corp"
    clientNameFa = "Test Client Corp FA"
} | ConvertTo-Json

try {
    $project = Invoke-RestMethod -Uri "$baseUrl/projects" -Method Post -Body $projectBody -Headers $headers -ContentType "application/json"
    Write-Host "Project created: $($project.titleEn)" -ForegroundColor Green
} catch {
    Write-Host "Project creation failed: $_" -ForegroundColor Yellow
}

# Create a Client
Write-Host "Creating Client..." -ForegroundColor Yellow
$clientBody = @{
    name = "Test Client Corporation"
    englishName = "Test Client Corporation"
    slug = "test-client"
    descriptionEn = "A test client for demonstration"
    descriptionFa = "Test client description FA"
    website = "https://test-client.example.com"
    locationEn = "Tehran"
    locationFa = "Tehran FA"
    status = "PUBLISHED"
} | ConvertTo-Json

try {
    $client = Invoke-RestMethod -Uri "$baseUrl/clients" -Method Post -Body $clientBody -Headers $headers -ContentType "application/json"
    Write-Host "Client created: $($client.name)" -ForegroundColor Green
} catch {
    Write-Host "Client creation failed: $_" -ForegroundColor Yellow
}

# Create a Service
Write-Host "Creating Service..." -ForegroundColor Yellow
$serviceBody = @{
    titleEn = "AI Consulting Service"
    titleFa = "AI Consulting Service FA"
    slug = "ai-consulting"
    descriptionEn = "Professional AI consulting services"
    descriptionFa = "AI consulting services FA"
    status = "PUBLISHED"
} | ConvertTo-Json

try {
    $service = Invoke-RestMethod -Uri "$baseUrl/services" -Method Post -Body $serviceBody -Headers $headers -ContentType "application/json"
    Write-Host "Service created: $($service.titleEn)" -ForegroundColor Green
} catch {
    Write-Host "Service creation failed: $_" -ForegroundColor Yellow
}

# Create a Team Member
Write-Host "Creating Team Member..." -ForegroundColor Yellow
$teamBody = @{
    nameEn = "Test Team Member"
    nameFa = "Test Team Member FA"
    positionEn = "AI Assistant"
    positionFa = "AI Assistant FA"
    email = "test@example.com"
    biographyEn = "A test team member created by AI"
    biographyFa = "Test team member biography FA"
    isActive = $true
} | ConvertTo-Json

try {
    $team = Invoke-RestMethod -Uri "$baseUrl/team" -Method Post -Body $teamBody -Headers $headers -ContentType "application/json"
    Write-Host "Team member created: $($team.nameEn)" -ForegroundColor Green
} catch {
    Write-Host "Team member creation failed: $_" -ForegroundColor Yellow
}

# Create a Page
Write-Host "Creating Page..." -ForegroundColor Yellow
$pageBody = @{
    titleEn = "Test Page"
    titleFa = "Test Page FA"
    slug = "test-page"
    contentEn = "This is a test page content"
    contentFa = "Test page content FA"
    status = "PUBLISHED"
} | ConvertTo-Json

try {
    $page = Invoke-RestMethod -Uri "$baseUrl/pages" -Method Post -Body $pageBody -Headers $headers -ContentType "application/json"
    Write-Host "Page created: $($page.titleEn)" -ForegroundColor Green
} catch {
    Write-Host "Page creation failed: $_" -ForegroundColor Yellow
}

# Create a Post
Write-Host "Creating Post..." -ForegroundColor Yellow
$postBody = @{
    titleEn = "Test Blog Post"
    titleFa = "Test Blog Post FA"
    slug = "test-blog-post"
    contentEn = "This is a test blog post content"
    contentFa = "Test blog post content FA"
    excerptEn = "Test excerpt"
    excerptFa = "Test excerpt FA"
    status = "PUBLISHED"
} | ConvertTo-Json

try {
    $post = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $postBody -Headers $headers -ContentType "application/json"
    Write-Host "Post created: $($post.titleEn)" -ForegroundColor Green
} catch {
    Write-Host "Post creation failed: $_" -ForegroundColor Yellow
}

Write-Host "All test content created!" -ForegroundColor Green
Write-Host "Check http://localhost:3003/ to see the content" -ForegroundColor Cyan