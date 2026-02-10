export const renderInvitationTemplate = (deepLink: string): string =>
  `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation - Safeo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #333;
      margin-bottom: 8px;
    }
    p {
      color: #666;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📄</div>
    <h2>Invitation reçue</h2>
    <div class="spinner"></div>
    <p>Redirection vers l'application...</p>
  </div>

  <script>
    window.location.href = "${deepLink}";

    setTimeout(function() {
      window.close();
    }, 1000);

    setTimeout(function() {
      document.body.innerHTML =
        '<div style="text-align:center;padding:40px;">' +
        '<div style="font-size:48px;margin-bottom:16px;">✅</div>' +
        '<h2>Invitation reçue</h2>' +
        '<p>Vous pouvez fermer cette fenêtre.</p>' +
        '</div>';
    }, 3000);
  </script>
</body>
</html>
`;
