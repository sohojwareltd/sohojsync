<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>SohojSync - Project Management</title>
    
    @php
        $buildPath = public_path('build/index.html');
        $buildHtml = file_exists($buildPath) ? file_get_contents($buildPath) : '';
        
        // Extract CSS files
        preg_match_all('/<link[^>]+href="([^"]+\.css)"[^>]*>/i', $buildHtml, $cssMatches);
        // Extract JS files
        preg_match_all('/<script[^>]+src="([^"]+\.js)"[^>]*>/i', $buildHtml, $jsMatches);
    @endphp
    
    @foreach($cssMatches[1] ?? [] as $css)
        <link rel="stylesheet" crossorigin href="{{ $css }}">
    @endforeach
</head>
<body>
    <div id="root"></div>
    
    @foreach($jsMatches[1] ?? [] as $js)
        <script type="module" crossorigin src="{{ $js }}"></script>
    @endforeach
</body>
</html>
