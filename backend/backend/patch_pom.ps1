$content = Get-Content "pom.xml" -Raw
$content = $content -replace "<lombok.version>.*?</lombok.version>", "<lombok.version>1.18.30</lombok.version>"
if (-not ($content -match "<lombok.version>")) {
    $content = $content -replace "(?s)<dependency>\s*<groupId>org.projectlombok</groupId>\s*<artifactId>lombok</artifactId>\s*<optional>true</optional>\s*</dependency>", "<dependency>`n<groupId>org.projectlombok</groupId>`n<artifactId>lombok</artifactId>`n<version>1.18.30</version>`n<optional>true</optional>`n</dependency>"
}
Set-Content "pom.xml" -Value $content
