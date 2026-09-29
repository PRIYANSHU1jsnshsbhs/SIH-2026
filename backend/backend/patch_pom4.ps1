$content = Get-Content "pom.xml" -Raw
$content = $content -replace "<java.version>21</java.version>", "<java.version>21</java.version>`n		<lombok.version>1.18.36</lombok.version>"
Set-Content "pom.xml" -Value $content
