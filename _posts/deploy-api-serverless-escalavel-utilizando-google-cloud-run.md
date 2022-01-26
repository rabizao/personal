---
title: "Deploy de uma API Serverless Flask/Python escalável utilizando Google Cloud Run"
excerpt: "Uma maneira simples de subir uma API Serverless escalável automaticamente (conforme o uso) no Google Cloud Run. Descreverei em detalhes o procedimento para uma API Flask/Python, porém pode ser facilmente adaptado para outras linguagens."
createdAt: "2022-01-27"
author: "rafaelbizao"
keywords: "devops, cloud, gcp, flask, python, google cloud run"
language: "pt-br"
---

Hoje irei demonstrar como subir uma API *web Serverless* de forma simples utilizando o serviço *Cloud Run* da GCP (*Google Cloud Platform*). Como exemplo, irei utilizar uma API *Flask/Python*, porém o procedimento pode ser facilmente replicado para outras linguagens de programação de maneira simples.

O GCP é a plataforma do Google que oferece serviços de *cloud*, equivalente a *AWS* da *Amazon* e *Azure* da *Microsoft*. *Cloud Run* é um serviço automaticamente escalável, tanto para baixo (podendo ficar sem nenhum *container* rodando e nesse caso livre de cobranças), quanto para cima (quando a quantidade de acessos simultâneos é alta). Com isso, você só paga pelo que utiliza, o que faz com que seja uma excelente opção para sistemas em fase inicial de desenvolvimento e com poucos usuários (pois você pagará valores muito baixos ou nada para mantê-lo rodando) e também para sistemas com milhares de usuários, pois não terá que se preocupar com o crescimento da quantidade de usuários, já que tudo será escalado automaticamente para você.

Na minha opinião, o *Cloud Run* tem algumas vantagens quando comparado a serviços que oferecem funções *serverless* diretamente para serem utilizadas. Dentre as vantagens, a principal para mim é o fato de você não ter que se adaptar a nenhuma implementação definida pelos provedores de *cloud*, como ***AWS lambda*** e ***GCP Cloud Functions***. Isso traz uma certa liberadade no desenvolvimento, e torna possível inclusive subir uma API já desenvolvida de maneira muito simples, sem precisar adaptar o código.

Porém também têm algumas desvantagens, como o fato de os ambientes que oferecem funções *serverless* já serem melhor otimizados, com *cold starts* (ambientes escaláveis frequentemente têm que aumentar a quantidade de *containers* para servir o fluxo atual de usuários, o que faz com que a primeira requisição para um *container* que estiver subindo seja mais demorada que as demais, isto é conhecido como *cold start*) frequentemente menores do que o do *Cloud Run*.

## Uma API simples para servir de exemplo

Iniciaremos com uma API que servirá de exemplo. Para isso, criaremos uma pasta chamada ***cloudrun_example***. Dentro dessa pasta, criaremos um arquivo chamado ***main.py*** que ficará o código da API:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def main():
    return {"hello": "world"}

if __name__ == "__main__":
    app.run(debug=True)
```

Ou seja, trata-se da API mais simples que podemos construir utilizando *Flask*, que quando recebe uma chamada retorna um objeto JSON {"hello": "world"}.

Agora precisamos criar um arquivo que será utilizado pela GCP para subir nossa aplicação. Devemos imaginar as instruções abaixo como se nossa API estivesse sendo executada pela primeira vez em um computador normal, ou seja, você deve ter o python instalado e as bibliotecas que utiliza na API (no nosso caso apenas o Flask). Dado isso, crie um arquivo chamado ***Dockerfile*** também na pasta ***cloudrun_example*** com o seguinte conteúdo:

```Dockerfile
# Use the official Python image.
# https://hub.docker.com/_/python
FROM python:3.8-slim

# Change workdir and copy local code to the container image.
WORKDIR /app
COPY . ./

# Install production dependencies.
RUN pip install flask gunicorn

# Startup instructions
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
```

Na primeira instrução do código, utilizamos um comando para partir de uma imagem ***docker*** já disponível para iniciar nosso *container* com python já instalado (em uma versão *slim* que ocupa menos espaço e demora menos tempo para subir). Depois, definimos um diretório que será criado dentro do *container* e utilizado no restante das instruções (seria o equivalente a mkdir app; cd app em um ambiente unix). Na linha seguinte, copiamos todo o conteúdo do nosso diretório atual para o *container*. Depois, instalamos as dependências necessárias para a API funcionar (flask e gunicorn que é o servidor HTTP que utilizaremos para deixar a API *online*).

A parte do código termina por aqui, agora partiremos para a configuração da GCP. Não irei detalhar o processo de cadastro, mas uma vez que sua conta estiver criada, você será instruído a criar um projeto e deverá fazê-lo (pode escolher qualquer nome). Depois disso, você deve instalar o ***Cloud SDK***, que possui instruções para todos os sistemas operacionais [neste link](https://cloud.google.com/sdk/docs/quickstart). Depois de instalado, utilize o comando ***gcloud auth login*** no terminal para efetuar o *login* em sua conta GCP.

Pronto, agora basta subir a API. Para isso, utilizaremos 2 comandos:

```bash
gcloud builds submit --tag=gcr.io/<project>/helloworld
gcloud run deploy helloworld --image=gcr.io/<project>/helloworld
```

O primeiro comando gera a imagem docker com a tag especificada e o segundo sobe a aplicação. Você deve substituir a parte ***<project>*** pelo nome do projeto que criou anteriormente dentro da GCP e ***helloworld*** é o nome que escolhi para o serviço que iremos subir. Quando utilizar o segundo comando, deverá responder se deseja permitir chamadas sem autenticação para o serviço que está subindo (*Allow unauthenticated invocations to [helloworld] (y/N)?*), o que é o nosso caso já que queremos que qualquer pessoa tenha acesso a ela, então deve responder com ***y***.

![Cloud Run](/images/post-cloud-run/cloudrun.png "Cloud Run")

É isso, após finalizar você receberá direto no terminal a URL para a API que acabou de subir!

![API](/images/post-cloud-run/api.png "API")

Você pode verificar direto na página da GCP o *status* do serviço, logs e métricas importantes como, por exemplo, quantidade de requisições média por segundo, quantidade de *containers* atualmente em uso, utilização de CPU e RAM do *container*, etc.

![Métricas](/images/post-cloud-run/metrics.png "Métricas")

Por hoje é isso! Agora temos uma API serverless automaticamente escalável rodando!
