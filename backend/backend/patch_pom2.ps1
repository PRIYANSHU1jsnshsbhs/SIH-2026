$content = Get-Content "pom.xml" -Raw
$content = $content -replace "(?s)<groupId>org.projectlombok</groupId>\s*<artifactId>lombok</artifactId>\s*<version>.*?</version>", "<groupId>org.projectlombok</groupId>`n<artifactId>lombok</artifactId>`n<version>1.18.30</version>"
Set-Content "pom.xml" -Value $content
