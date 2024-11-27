# Instalação

1. clone o repositório com `git clone https://github.com/athlete-connect/athlete-connect-code.git`
2. Vá para o terminal e abra o repositório remoto
3. No terminal, execute `python -m venv venv` para windows, ou `python3 -m venv venv` para linux, e em seguida `venv\Scripts\activate` no windows, ou `source venv/bin/activate` para linux. Isso irá criar o ambiente virtual venv e ativá-lo para isolar as dependências do projeto
4. Abra a paleta de comando com `ctrl + shift + p`, pesquise por `Python: Select Interpreter` e selecione o interpretador python do ambiente virtual criado (venv)
5. Execute `pip install -r server/requirements.txt` para instalar as dependências do back-end
6. Instale o driver do mysql com `pip install mysql-connector-python` ou o do mariadb com `pip install mariadb`
7. Instale o [Node.js](https://nodejs.org/) caso ainda não o tenha instalado, dessa forma. O npm será instalado automaticamente junto com o Node.js.
8. Confirme a instalação do Node.js e do npm executando `node -v` e `npm -v`. Caso apareça suas versões, a instalação foi concluida com sucesso. 
9. Instale as dependências do front-end indo até o diretório "client" dentro do projeto pelo terminal do vscodde e executando o comando `npm install`.
10. habilite o serviço do mysql
11. crie a database "athleteconnect" no mysql
12. caso necessário, mude os parâmetros da conexão no arquivo `app.py` na pasta `/server`
13. pelo terminal do vscode, vá até o diretório `/server` e execute `python app.py`, em seguida, vá até o diretório `/client` e execute o comando `npm start`

obs: verifique se a extensão do python está instalada no vscode
