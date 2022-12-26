try:
    # Verificando se biblioteca json existe.
    from json import loads, dumps
except:
    print('{"message": "Biblioteca json não encontrado. Por favor, faça a instalação dos requerimentos.", "code": "errorLib"}')
    exit(0)

try: 
    # Verificando se biblioteca sys existe.
    from sys import argv
except:
    print('{"message": "Biblioteca sys não encontrado. Por favor, faça a instalação dos requerimentos."}')
    exit(0)


# Carregando e convertendo JSON enviado por parâmetro em dicionário.
namesParams = loads(argv[1])

# Auxiliar de nomes de caixas.
boxesNames = []

for nameInd in namesParams:
    for name in namesParams[nameInd]:
        try:
            boxesNames.append(str(name).split('-')[0])

        except:
            continue


# Substituindo dados desconhecidos.
for idx, bxname in enumerate(boxesNames):
    if "NOME_DESCONHECIDO" in bxname:
        boxesNames[idx] = "UNKNOWN"
    
    elif "Inativo" in bxname:
        boxesNames[idx] = "INACTIVE"

    else:
        pass


# Iniciando dicionário de caixas.
boxesFrequency = {}
boxesNamesUnique = []

# Percorrendo a posição array caixas.
for b in boxesNames:
    # Verificando se já existe a posição para dada a caixa.
    if not b in boxesFrequency.keys():
        # Caso não exista, será criada a posição iniciando com 0.
        boxesFrequency[b] = 0
        boxesNamesUnique.append(b)

    # Se a posição já existe, será apenas incrementado.
    boxesFrequency[b] = (boxesFrequency[b] or 0)+1


# Iniciando valor de total 
totalOnus=0

# Realizando a contagem de ONUs no total.
for bf in boxesFrequency:
    # Contagem.
    totalOnus = int(boxesFrequency[bf]) + totalOnus

# Asc order boxesFrequency.
oderBoxesFrequency={}
for box in sorted(boxesFrequency.keys()):
    oderBoxesFrequency[box] = boxesFrequency[box]

# Adiciando o total em uma posição a si.
oderBoxesFrequency["TOTAL"] = totalOnus
oderBoxesFrequency["BOX_NAMES"] = sorted(boxesNamesUnique)

# Retorno do novo objeto JSON.
print(dumps(oderBoxesFrequency).strip())