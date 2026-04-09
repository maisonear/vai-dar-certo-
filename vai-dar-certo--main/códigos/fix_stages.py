import re

# Ler stages.js
with open('stages.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Tamanho original:", len(content))

# Remover biome duplicados causados por runs multiplas do script ps1
# Padrão: remover qualquer linha extra "biome: '...'" seguida de outra biome na mesma posição
content = re.sub(r"(\s+biome: '[^']+',\r?\n)+", lambda m: m.group().split('\n')[0] + '\n', content)

# Verificar resultado
count = content.count("biome:")
print(f"Campos biome encontrados: {count}")

with open('stages_debug.txt', 'w', encoding='utf-8') as f:
    f.write(content[:3000])
    
print("Preview salvo em stages_debug.txt")
