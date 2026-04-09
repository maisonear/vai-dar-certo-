$file = 'stages.js'
$content = Get-Content $file -Raw

# Adicionar campo biome apos campo theme em cada dungeon
$content = $content -replace "theme: 'goblin_cave',", "theme: 'goblin_cave',`r`n                biome: 'cave',"
$content = $content -replace "theme: 'graveyard',", "theme: 'graveyard',`r`n                biome: 'graveyard',"
$content = $content -replace "theme: 'wolf_den',", "theme: 'wolf_den',`r`n                biome: 'wolf_den',"
$content = $content -replace "theme: 'mine',", "theme: 'mine',`r`n                biome: 'cave',"
$content = $content -replace "theme: 'swamp',", "theme: 'swamp',`r`n                biome: 'swamp',"
$content = $content -replace "theme: 'mage_tower',", "theme: 'mage_tower',`r`n                biome: 'magic',"
$content = $content -replace "theme: 'orc_fortress',", "theme: 'orc_fortress',`r`n                biome: 'wolf_den',"
$content = $content -replace "theme: 'catacombs',", "theme: 'catacombs',`r`n                biome: 'graveyard',"
$content = $content -replace "theme: 'void_temple',", "theme: 'void_temple',`r`n                biome: 'magic',"
$content = $content -replace "theme: 'dragon_mountain',", "theme: 'dragon_mountain',`r`n                biome: 'cave',"
$content = $content -replace "theme: 'demon_abyss',", "theme: 'demon_abyss',`r`n                biome: 'cave',"
$content = $content -replace "theme: 'chaos_sanctuary',", "theme: 'chaos_sanctuary',`r`n                biome: 'magic',"

# Adicionar setBiome em startStage (apos mainBossDefeated = false e antes de Clear existing enemies)
$oldBlock = "        this.mainBossDefeated = false;

        // Clear existing enemies and loot"
$newBlock = "        this.mainBossDefeated = false;

        // Trocar bioma do mundo ao entrar na dungeon
        if (this.game.world && stage.biome) {
            this.game.world.setBiome(stage.biome);
        }

        // Clear existing enemies and loot"
$content = $content.Replace($oldBlock, $newBlock)

# Adicionar setBiome('overworld') em returnToTown (apos inSecretRoom = false e antes de Clear enemies)
$oldReturn = "        this.inSecretRoom = false;

        // Clear enemies and loot"
$newReturn = "        this.inSecretRoom = false;

        // Restaurar bioma do overworld ao retornar a cidade
        if (this.game.world) {
            this.game.world.setBiome('overworld');
        }

        // Clear enemies and loot"
$content = $content.Replace($oldReturn, $newReturn)

Set-Content $file $content -NoNewline -Encoding UTF8
Write-Host "stages.js atualizado com sucesso!"
