export const renderInvitationTemplate = (appLink: string): string => `
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
      font-size: 48px;
      margin-bottom: 20px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #333;
      margin: 0 0 10px 0;
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
    window.location.href = ${appLink};
    
    setTimeout(function() {
      window.close();
    }, 1000);
    
    setTimeout(function() {
      document.body.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:16px;max-width:400px;margin:auto;"><div style="font-size:48px;margin-bottom:20px;">✅</div><h2 style="color:#333;margin-bottom:10px;">Invitation reçue</h2><p style="color:#666;margin-bottom:20px;">Vous pouvez fermer cette fenêtre et retourner à l\'application.</p><button onclick="window.close()" style="background:#667eea;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:14px;">Fermer</button></div>';
    }, 3000);
  </script>
</body>
</html>
`;
