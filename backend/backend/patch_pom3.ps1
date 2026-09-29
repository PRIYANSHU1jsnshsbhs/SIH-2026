$content = Get-Content "pom.xml" -Raw
$content = $content -replace "<version>1.18.30</version>", "<version>1.18.36</version>"
Set-Content "pom.xml" -Value $content
