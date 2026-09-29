$content = Get-Content "src/main/java/in/sih/vaspattribution/engine/AttributionEngine.java" -Raw
$content = $content -replace "findAllByAddressIn", "findByAddressIn"
Set-Content "src/main/java/in/sih/vaspattribution/engine/AttributionEngine.java" -Value $content
