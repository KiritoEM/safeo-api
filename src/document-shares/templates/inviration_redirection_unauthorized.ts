export const renderInvitationUnauthorizedTemplate = (): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation expirée - Safeo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h2 {
      color: #333;
      margin: 0 0 10px 0;
    }
    p {
      color: #666;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔒</div>
    <h2>Invitation expirée</h2>
    <p>Cette invitation a expiré ou n'est plus valide. Veuillez demander une nouvelle invitation.</p>
  </div>
</body>
</html>
`;