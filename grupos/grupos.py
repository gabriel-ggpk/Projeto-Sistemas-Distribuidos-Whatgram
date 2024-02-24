import asyncio
from websockets.server import serve
import json

#{0: {"criador": 0, "nome": "nome_grupo", "membros": [0, 1, 2, 3...]}}

grupos = {}

async def criar_grupo(pedido):
   nova_id = 0
   ids = list(grupos.keys())
   ids.sort()
   async for i in len(grupos):
       if i < len(grupos) - 2:
           if ids[i + 1] - ids[i] > 1:
               nova_id = ids[i] + 1
               break
       else:
           nova_id = ids[i] + 1
   grupos[nova_id] = {"criador": pedido["criador"], "nome": pedido["nome"], "membros": pedido["membros"]}
   return nova_id

async def deletar_grupo(pedido):
    if pedido["requisitor"] == grupo[pedido["grupo"]]["criador"]:
        del grupos[pedido["grupo"]]
    return True

async def entrar_grupo(pedido):
    grupos[pedido["grupo"]]["membros"].append(pedido["requisitor"])

async def sair_grupo(pedido):
    if pedido["requisitor"] in grupos[pedido["grupo"]]["membros"]:
        grupos[pedido["grupo"]]["membros"].remove(pedido["requisitor"])

async def enviar_mensagem(pedido):
    async for membro in grupos[pedido["grupo"]]["membros"]:
        pedir = {
            "servico": "enviar_mensagem",
            "remetente": pedido["remetente"],
            "destino": membro,
            "mensagem": pedido["mensagem"]
        }
        await websocket.send(json.dumps(pedir))

async def salvar_bd():
    pass

async def echo(websocket):
    async for mensagem in websocket:
        pedido = json.loads(mensagem)
        if pedido["servico"] == "criar_grupo":
            nova_id = await criar_grupo(pedido)
            print("grupos - grupo criado")
            
            retorno = {"nova_id": nova_id}
        elif pedido["servico"] == "deletar_grupo":
           deletado = await deletar_grupo(pedido)
           print("grupos - grupo deletado")
           
           retorno = {"deletado": deletado}
        elif pedido["servico"] == "entrar_grupo":
            await entrar_grupo(pedido)
            print("grupos - entrada em grupo")
        elif pedido["servico"] == "sair_grupo":
            await sair_grupo(pedido)
            print("grupos - saída de grupo")
        elif pedido["servico"] == "enviar_mensagem":
            await enviar_mensagem(pedido)
            print("grupos - mensagem enviada")
        if pedido["servico"] != "enviar_mensagem":
            await salvar_bd()
            print("grupos - bd salvo")
        
        await websocket.send(json.dumps(retorno))

async def main():
    async with serve(echo, "", 8765):
        await asyncio.Future()

asyncio.run(main())
