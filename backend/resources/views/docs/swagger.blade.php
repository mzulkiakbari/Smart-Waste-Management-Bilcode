<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - Smart Waste Management</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" sizes="32x32" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .top-banner {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .top-banner h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .top-banner a {
      color: #ecfdf5;
      text-decoration: none;
      font-size: 0.875rem;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      transition: background 0.2s ease;
    }
    .top-banner a:hover {
      background: rgba(255, 255, 255, 0.35);
    }
    #swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px;
    }
  </style>
</head>
<body>
  <div class="top-banner">
    <h1>♻️ Smart Waste Management - REST API Docs</h1>
    <a href="/api/documentation.yaml" target="_blank" download>Download OpenAPI Spec (.yaml)</a>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/documentation.yaml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>

