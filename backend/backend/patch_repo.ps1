$content = Get-Content "src/main/java/in/sih/vaspattribution/entity/repository/EntityAddressRepository.java" -Raw
$content = $content -replace "\}", "    java.util.List<EntityAddress> findByAddressIn(java.util.List<String> addresses);`n}"
Set-Content "src/main/java/in/sih/vaspattribution/entity/repository/EntityAddressRepository.java" -Value $content
