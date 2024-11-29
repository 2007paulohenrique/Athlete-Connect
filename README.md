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

<!-- -- ALTER TABLE formacao ADD CONSTRAINT FK_formacao_2
--     FOREIGN KEY (fk_usuario_id_usuario)
--     REFERENCES usuario (id_usuario)
--     ON DELETE CASCADE;
 
-- ALTER TABLE formacao ADD CONSTRAINT FK_formacao_3
--     FOREIGN KEY (fk_curso_id_curso)
--     REFERENCES curso (id_curso)
--     ON DELETE CASCADE;
 
-- ALTER TABLE formacao ADD CONSTRAINT FK_formacao_4
--     FOREIGN KEY (fk_grau_formacao_id_grau_formacao)
--     REFERENCES grau_formacao (id_grau_formacao);
 
-- ALTER TABLE marca ADD CONSTRAINT FK_marca_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;

-- ALTER TABLE perfil ADD CONSTRAINT FK_perfil_2
--     FOREIGN KEY (fk_midia_id_midia)
--     REFERENCES midia (id_midia)
--     ON DELETE CASCADE;
 
-- ALTER TABLE esporte ADD CONSTRAINT FK_esporte_2
--     FOREIGN KEY (fk_midia_id_icone)
--     REFERENCES midia (id_midia)
--     ON DELETE CASCADE;
 
-- ALTER TABLE compartilhamento ADD CONSTRAINT FK_compartilhamento_2
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE CASCADE;
 
-- ALTER TABLE compartilhamento ADD CONSTRAINT FK_compartilhamento_3
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE comentario ADD CONSTRAINT FK_comentario_2
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE CASCADE;
 
-- ALTER TABLE comentario ADD CONSTRAINT FK_comentario_3
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE postagem ADD CONSTRAINT FK_postagem_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE midia ADD CONSTRAINT FK_midia_2
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE CASCADE;
 
-- ALTER TABLE usuario ADD CONSTRAINT FK_usuario_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE pesquisa ADD CONSTRAINT FK_pesquisa_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE denuncia ADD CONSTRAINT FK_denuncia_2
--     FOREIGN KEY (fk_perfil_id_autor, fk_perfil_id_denunciado)
--     REFERENCES perfil (id_perfil, id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE denuncia ADD CONSTRAINT FK_denuncia_3
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE SET NULL;
 
-- ALTER TABLE segue ADD CONSTRAINT FK_segue_1
--     FOREIGN KEY (fk_perfil_id_seguidor)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE segue ADD CONSTRAINT FK_segue_2
--     FOREIGN KEY (fk_perfil_id_seguido)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE responde ADD CONSTRAINT FK_responde_1
--     FOREIGN KEY (fk_comentario_id_resposta)
--     REFERENCES comentario (id_comentario)
--     ON DELETE CASCADE;
 
-- ALTER TABLE responde ADD CONSTRAINT FK_responde_2
--     FOREIGN KEY (fk_comentario_id_respondido)
--     REFERENCES comentario (id_comentario)
--     ON DELETE CASCADE;
 
-- ALTER TABLE curso_instituicao ADD CONSTRAINT FK_curso_instituicao_1
--     FOREIGN KEY (fk_instituicao_id_instituicao)
--     REFERENCES instituicao (id_instituicao)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE curso_instituicao ADD CONSTRAINT FK_curso_instituicao_2
--     FOREIGN KEY (fk_curso_id_curso)
--     REFERENCES curso (id_curso)
--     ON DELETE SET NULL;
 
-- ALTER TABLE postagem_hashtag ADD CONSTRAINT FK_postagem_hashtag_1
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE SET NULL;
 
-- ALTER TABLE postagem_hashtag ADD CONSTRAINT FK_postagem_hashtag_2
--     FOREIGN KEY (fk_hashtag_id_hashtag)
--     REFERENCES hashtag (id_hashtag)
--     ON DELETE SET NULL;
 
-- ALTER TABLE categorias_esporte ADD CONSTRAINT FK_categorias_esporte_1
--     FOREIGN KEY (fk_categoria_esporte_id_categoria_esporte)
--     REFERENCES categoria_esporte (id_categoria_esporte)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE categorias_esporte ADD CONSTRAINT FK_categorias_esporte_2
--     FOREIGN KEY (fk_esporte_id_esporte)
--     REFERENCES esporte (id_esporte)
--     ON DELETE SET NULL;
 
-- ALTER TABLE preferencia ADD CONSTRAINT FK_preferencia_1
--     FOREIGN KEY (fk_usuario_id_usuario)
--     REFERENCES usuario (id_usuario)
--     ON DELETE SET NULL;
 
-- ALTER TABLE preferencia ADD CONSTRAINT FK_preferencia_2
--     FOREIGN KEY (fk_esporte_id_esporte)
--     REFERENCES esporte (id_esporte)
--     ON DELETE SET NULL;
 
-- ALTER TABLE motivos_denuncia ADD CONSTRAINT FK_motivos_denuncia_1
--     FOREIGN KEY (fk_motivo_denuncia_id_motivo_denuncia)
--     REFERENCES motivo_denuncia (id_motivo_denuncia)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE motivos_denuncia ADD CONSTRAINT FK_motivos_denuncia_2
--     FOREIGN KEY (fk_denuncia_id_denuncia)
--     REFERENCES denuncia (id_denuncia)
--     ON DELETE SET NULL;
 
-- ALTER TABLE compartilhado ADD CONSTRAINT FK_compartilhado_1
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE compartilhado ADD CONSTRAINT FK_compartilhado_2
--     FOREIGN KEY (fk_compartilhamento_id_compartilhamento)
--     REFERENCES compartilhamento (id_compartilhamento)
--     ON DELETE SET NULL;
 
-- ALTER TABLE marcacao_comentario ADD CONSTRAINT FK_marcacao_comentario_1
--     FOREIGN KEY (fk_comentario_id_comentario)
--     REFERENCES comentario (id_comentario)
--     ON DELETE SET NULL;
 
-- ALTER TABLE marcacao_comentario ADD CONSTRAINT FK_marcacao_comentario_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE SET NULL;
 
-- ALTER TABLE marcacao_postagem ADD CONSTRAINT FK_marcacao_postagem_1
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE SET NULL;
 
-- ALTER TABLE marcacao_postagem ADD CONSTRAINT FK_marcacao_postagem_2
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE SET NULL;
 
-- ALTER TABLE local_favorito ADD CONSTRAINT FK_local_favorito_1
--     FOREIGN KEY (fk_usuario_id_usuario)
--     REFERENCES usuario (id_usuario)
--     ON DELETE SET NULL;
 
-- ALTER TABLE local_favorito ADD CONSTRAINT FK_local_favorito_2
--     FOREIGN KEY (fk_endereco_id_endereco)
--     REFERENCES endereco (id_endereco)
--     ON DELETE SET NULL;
 
-- ALTER TABLE evento_endereco ADD CONSTRAINT FK_evento_endereco_1
--     FOREIGN KEY (fk_endereco_id_endereco)
--     REFERENCES endereco (id_endereco)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE evento_endereco ADD CONSTRAINT FK_evento_endereco_2
--     FOREIGN KEY (fk_evento_id_evento)
--     REFERENCES evento (id_evento)
--     ON DELETE SET NULL;
 
-- ALTER TABLE esporte_hashtag ADD CONSTRAINT FK_esporte_hashtag_1
--     FOREIGN KEY (fk_esporte_id_esporte)
--     REFERENCES esporte (id_esporte)
--     ON DELETE RESTRICT;
 
-- ALTER TABLE esporte_hashtag ADD CONSTRAINT FK_esporte_hashtag_2
--     FOREIGN KEY (fk_hashtag_id_hashtag)
--     REFERENCES hashtag (id_hashtag)
--     ON DELETE SET NULL;
 
-- ALTER TABLE foto_perfil ADD CONSTRAINT FK_foto_perfil_1
--     FOREIGN KEY (fk_midia_id_midia)
--     REFERENCES midia (id_midia)
--     ON DELETE SET NULL;
 
-- ALTER TABLE foto_perfil ADD CONSTRAINT FK_foto_perfil_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE SET NULL;
 
-- ALTER TABLE banner ADD CONSTRAINT FK_banner_1
--     FOREIGN KEY (fk_midia_id_midia)
--     REFERENCES midia (id_midia)
--     ON DELETE SET NULL;
 
-- ALTER TABLE banner ADD CONSTRAINT FK_banner_2
--     FOREIGN KEY (fk_evento_id_evento)
--     REFERENCES evento (id_evento)
--     ON DELETE SET NULL;
 
-- ALTER TABLE curte ADD CONSTRAINT FK_curte_1
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE SET NULL;
 
-- ALTER TABLE curte ADD CONSTRAINT FK_curte_2
--     FOREIGN KEY (fk_postagem_id_postagem)
--     REFERENCES postagem (id_postagem)
--     ON DELETE SET NULL;
 
-- ALTER TABLE notificacao ADD CONSTRAINT FK_notificacao_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil);
 
-- ALTER TABLE evento ADD CONSTRAINT FK_evento_2
--     FOREIGN KEY (fk_marca_id_marca)
--     REFERENCES marca (id_marca)
--     ON DELETE CASCADE;
 
-- ALTER TABLE flash ADD CONSTRAINT FK_flash_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil)
--     ON DELETE CASCADE;
 
-- ALTER TABLE flash ADD CONSTRAINT FK_flash_3
--     FOREIGN KEY (fk_midia_id_midia)
--     REFERENCES midia (id_midia)
--     ON DELETE CASCADE;
 
-- ALTER TABLE interacao ADD CONSTRAINT FK_interacao_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil);
 
-- ALTER TABLE interacao ADD CONSTRAINT FK_interacao_3
--     FOREIGN KEY (fk_live_id_live)
--     REFERENCES live (id_live);
 
-- ALTER TABLE configuracao ADD CONSTRAINT FK_configuracao_1
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil);
 
-- ALTER TABLE live ADD CONSTRAINT FK_live_2
--     FOREIGN KEY (fk_perfil_id_perfil)
--     REFERENCES perfil (id_perfil); -->