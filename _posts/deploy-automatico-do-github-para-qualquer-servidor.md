---
title: "Deploy automático do GitHub para qualquer servidor"
excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
createdAt: "2022-01-05 00:00"
author: rafaelbizao
---



Neste tutorial irei demonstrar uma maneira simples de implementar integração contínua nos seus projetos do GitHub para quaisquer servidores (tanto em *clouds* - AWS, Google, Azure, etc como servidores próprios ou VPS).

Existem diversas maneiras de se fazer isso e a que utilizaremos aqui consiste em permitir que o GitHub realize uma conexão SSH com o servidor em que sua aplicação está hospedada e execute um script dentro do seu servidor que realiza o *deploy*.

## No GitHub

Na página do seu repositório no GitHub clique em ***Settings*** e depois em ***Secrets***. Você será direcionado para uma página que é utilizada para armazenar informações sensíveis do seu repositório, como senhas de acesso. Isso é uma precaução de segurança importante pois não queremos que ninguém tenha acesso as nossas senhas. Desta forma, nem mesmo os colaboradores de um repositório privado terão acesso a elas. Essas informações serão utilizadas posteriormente em nosso *script*.

Para a implementação contínua funcionar, precisaremos fornecer as credenciais para o acesso SSH que são: endereço do servidor remoto (HOST), nome de usuário (USERNAME), senha (PASSWORD) e porta (PORT). Para adicionar uma nova informação clique em ***New repository secret***. Vale lembrar que a porta de acesso padrão para SSH é a 22, então caso não tenha feito nenhuma mudança em seu servidor, deverá utilizar PORT=22.

Suas ***secrets*** deverão ficar da seguinte forma:

![Secrets](/images/post-deploy-automatico/secrets.png "Secrets")

Ainda no seu repositório no GitHub clique em ***Actions*** e depois em ***New workflow***. Na página seguinte clique em ***set up a workflow yourself*** para criarmos um workflow sem nenhum template específico.

Você será redirecionado para uma página que irá criar um novo arquivo em seu repositório na pasta **.github/workflows**. O nome do arquivo é indiferente e iremos escolher **ci.yml**. O conteúdo do arquivo será o seguinte:

~~~yaml
name: deploy
on: [push]
jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
    - name: executing remote ssh commands using password
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        port: ${{ secrets.PORT }}
        script: ./deploy.sh
~~~

Na primeira linha, na entrada ***name*** podemos atribuir um nome que irá identificar o *workflow* posteriormente, aqui escolhemos ***deploy***. A entrada ***on*** recebe os eventos que deverão acionar o *workflow* e queremos que ele seja acionado quando um evento de ***push*** ocorrer no repositório. Na entrada ***jobs*** podemos designar uma ou mais ações que serão tomadas na execução do *workflow*. Aqui desejamos que o *script* seja disparado por um servidor ubuntu na ultima versão disponível (***ubuntu-latest***) e os passos (***steps***) desse evento são descritos abaixo. Novamente podemos atribuir um nome para o passo atual, que utiliza uma extensão que será responsável pela conexão SSH e execução do *script* (***appleboy/ssh-action@master***). Essa extensão terá acesso as credenciais definidas previamente (*secrets*) e irá executar o *script* **deploy.sh** que deverá estar presente no servidor que está servindo sua aplicação. Vale destacar que o *script* deverá estar localizado na pasta *home* do usuário que está realizando a conexão SSH, ou você deverá fornecer o caminho completo de execução do *script* **deploy.sh**.

## No servidor

O conteúdo do arquivo **deploy.sh** depende do tipo de aplicação que você está servindo. Em meu caso, trata-se de uma API Flask com um *frontend* em ReactJS e meu **deploy.sh** é o seguinte

~~~sh
#!/bin/sh
folder="foldername"
echo "----Pulling from github----"
cd ~/"$folder" && git pull;
echo "----BACKEND----"
echo "----Requirements----"
cd ~/"$folder"/backend && ~/"$folder"/backend/venv/bin/pip install -r requirements.txt;
echo "----Migrating DB----"
cd ~/"$folder"/backend && ~/"$folder"/backend/venv/bin/flask db migrate;
echo "----Upgrading DB----"
cd ~/"$folder"/backend && ~/"$folder"/backend/venv/bin/flask db upgrade;
echo "----Restarting API"
sudo service apitest restart;
echo "----FRONTEND----"
echo "----Yarn Packages---"
cd ~/"$folder"/frontend && yarn install;
echo "----Yarn BUILD---"
cd ~/"$folder"/frontend && yarn build;
echo "----Restarting NGINX"
sudo service nginx restart;
~~~

Ou seja, no início defino a variável ***folder*** que é a localização da pasta que é a base da minha aplicação. Em seguida, navego até essa pasta e rodo o comando **git pull** para baixar as novas atualizações do repositório. Em seguida, rodo os comandos para instalar os *requirements*, migrar, atualizar a *database* e reiniciar o serviço responsável pela API que no meu caso chamei de **apitest**. Em seguida, realizo procedimentos semelhantes para aplicar as mudanças no *frontend* e reiniciar o serviço.

Vale destacar que o usuário que irá realizar o acesso SSH e disparar o *script* deve ter permissão para rodar os comandos sem ter que digitar qualquer senha ou confirmação, caso contrário o *script* ficará travado no GitHub e terá que ser interrompido manualmente. É possível fazer isso configurando chaves no GitHub que permitem operações específicas no repositório e adicionando entradas no arquivo **sudoers** do linux para controlar as permissões do usuário. Portanto, certifique-se que tudo está funcionando reproduzindo os passos acima manualmente.

Por fim, salve o arquivo **deploy.sh** e confirme o commit do workflow para seu repositório clicando em ***Start commit*** e depois em ***Commit new file***.

Você poderá ver o progresso do deploy, assim como consultar o log clicando em ***Actions*** e depois em ***Build***.

![Deploy](/images/post-deploy-automatico/deploy.png "Deploy")

Por hoje é isso, pessoal! Abraços.
