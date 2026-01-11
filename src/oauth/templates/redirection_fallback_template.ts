export const renderRedirectionTemplate = (deepLink: string): string =>
  `
     <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirection...</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <p>Redirection vers l'application...</p>
      </div>
      <script>
        window.location.href = "${deepLink}";
        
        setTimeout(function() {
          window.close();
        }, 1000);
        
        setTimeout(function() {
          document.body.innerHTML = '<div style="text-align:center;padding:40px;"><h2>Authentification réussie</h2><p>Vous pouvez fermer cette fenêtre.</p></div>';
        }, 3000);
      </script>
    </body>
    </html>
    `;
