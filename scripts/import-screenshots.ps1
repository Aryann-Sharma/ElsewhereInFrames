param(
    [Parameter(Mandatory = $true)]
    [string] $ArchivePath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.Drawing

$folders = @{
    'ac mirage' = 'assassins-creed-mirage'
    'ac odyssey' = 'assassins-creed-odyssey'
    'ac origins' = 'assassins-creed-origins'
    'ac syndicate' = 'assassins-creed-syndicate'
    'ac unity' = 'assassins-creed-unity'
    'Arkham Knight' = 'batman-arkham-knight'
    'cp2077' = 'cyberpunk-2077'
    'GoT' = 'ghost-of-tsushima'
    'gta5' = 'grand-theft-auto-v'
    'rdr2' = 'red-dead-redemption-2'
    'spiderman' = 'marvels-spider-man'
    'spiderman mm' = 'marvels-spider-man-miles-morales'
    'tlou' = 'the-last-of-us-part-i'
    'tlou 2' = 'the-last-of-us-part-ii'
    'uncharted 4' = 'uncharted-4'
}

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq 'image/jpeg' |
    Select-Object -First 1

function Save-Jpeg([System.Drawing.Image] $source, [string] $path, [int] $maxWidth, [int] $quality, [int] $cropTop = 0, [int] $cropBottom = 0) {
    $sourceHeight = $source.Height - $cropTop - $cropBottom
    $scale = [math]::Min(1.0, ([double] $maxWidth / [double] $source.Width))
    $width = [int][math]::Round($source.Width * $scale)
    $height = [int][math]::Round($sourceHeight * $scale)
    if ($width -lt 1 -or $height -lt 1) {
        throw "Invalid image dimensions: $($source.Width)x$($source.Height) -> ${width}x${height}"
    }
    $bitmap = [System.Drawing.Bitmap]::new($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $options = [System.Drawing.Imaging.EncoderParameters]::new(1)

    try {
        $graphics.Clear([System.Drawing.Color]::Black)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $destination = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
        $sourceArea = [System.Drawing.Rectangle]::new(0, $cropTop, $source.Width, $sourceHeight)
        $graphics.DrawImage($source, $destination, $sourceArea, [System.Drawing.GraphicsUnit]::Pixel)
        $options.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
            [System.Drawing.Imaging.Encoder]::Quality, [long] $quality
        )
        $bitmap.Save($path, $encoder, $options)
    }
    finally {
        $options.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $ArchivePath))
$manifest = [ordered]@{}

try {
    $entries = $archive.Entries |
        Where-Object { $_.FullName.EndsWith('.png', [StringComparison]::OrdinalIgnoreCase) } |
        Sort-Object FullName

    foreach ($entry in $entries) {
        if ($entry.FullName -notmatch '^eif/([^/]+)/([^/]+\.png)$') {
            throw "Unexpected archive path: $($entry.FullName)"
        }

        $folder = $Matches[1]
        if ($folder -eq 'spiderman 2') {
            continue
        }
        if (-not $folders.ContainsKey($folder)) {
            throw "No game mapping for archive folder: $folder"
        }

        $slug = $folders[$folder]
        if ($folder -eq 'gta5' -and $entry.Name -in @(
            'Screenshot 2026-03-02 183538.png',
            'Screenshot 2026-06-05 212833.png'
        )) {
            $slug = 'gta-online'
        }
        if (-not $manifest.Contains($slug)) {
            $manifest[$slug] = [System.Collections.ArrayList]::new()
        }

        $number = $manifest[$slug].Count + 1
        $stem = 'frame-{0:d3}' -f $number
        $outputFolder = Join-Path 'assets/screenshots' $slug
        New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
        $fullPath = Join-Path $outputFolder "$stem.jpg"
        $thumbPath = Join-Path $outputFolder "$stem-thumb.jpg"

        $stream = $entry.Open()
        try {
            $image = [System.Drawing.Image]::FromStream($stream)
            try {
                $cropTop = 0
                $cropBottom = 0
                if ($slug -eq 'red-dead-redemption-2') {
                    # These captures contain a 16:9 image inside a 2560x1600 canvas.
                    if ($image.Width -eq 2560 -and $image.Height -eq 1600) {
                        $cropTop = 80
                        $cropBottom = 80
                    }
                    # One separately cropped capture has a narrow strip at the bottom.
                    elseif ($entry.Name -eq 'Screenshot (3653).png') {
                        $cropBottom = 20
                    }
                }

                Save-Jpeg $image $fullPath 2560 88 $cropTop $cropBottom
                Save-Jpeg $image $thumbPath 960 82 $cropTop $cropBottom
                [void] $manifest[$slug].Add([ordered]@{
                    full = ($fullPath -replace '\\', '/')
                    thumb = ($thumbPath -replace '\\', '/')
                    width = $image.Width
                    height = $image.Height - $cropTop - $cropBottom
                })
            }
            finally { $image.Dispose() }
        }
        finally { $stream.Dispose() }
    }
}
finally { $archive.Dispose() }

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path 'assets/screenshots/manifest.json' -Encoding UTF8
$manifest.GetEnumerator() | ForEach-Object { '{0}: {1} frames' -f $_.Key, $_.Value.Count }
