export default {
  async fetch(request, env, ctx) {
    return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset=UTF-8>
    <meta name=viewport content=width=device-width, initial-scale=1.0>
    <title>BREAK</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            color: #fff;
            font-family: monospace;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-size: 72px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    BREAK
</body>
</html>`, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
