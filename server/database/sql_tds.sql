CREATE TABLE IF NOT EXISTS perfil (
    id_perfil int PRIMARY KEY AUTO_INCREMENT,
    email varchar(255) NOT NULL UNIQUE,
    senha varchar(60) NOT NULL,
    nome varchar(30) NOT NULL UNIQUE,
    verificado boolean NOT NULL,
    biografia varchar(150),
    ativo boolean NOT NULL,
    privado boolean NOT NULL,
    fk_midia_id_midia int UNIQUE
);

CREATE TABLE IF NOT EXISTS postagem (
    id_postagem int PRIMARY KEY AUTO_INCREMENT,
    legenda text,
    data_publicacao datetime NOT NULL,
    fk_perfil_id_perfil int NOT NULL
);

CREATE TABLE IF NOT EXISTS midia (
    id_midia int PRIMARY KEY AUTO_INCREMENT,
    caminho varchar(255) NOT NULL UNIQUE,
    tipo varchar(10) NOT NULL,
    formato varchar(10) NOT NULL,
    fk_postagem_id_postagem int
);

ALTER TABLE postagem
ADD CONSTRAINT postagem_ibfk_1 FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil);

ALTER TABLE midia
ADD CONSTRAINT midia_ibfk_1 FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem);

ALTER TABLE perfil
ADD CONSTRAINT perfil_ibfk_1 FOREIGN KEY (fk_midia_id_midia) REFERENCES midia(id_midia);

CREATE TABLE IF NOT EXISTS marca (
    id_marca int PRIMARY KEY AUTO_INCREMENT,
    nome_legal varchar(100) NOT NULL UNIQUE,
    nome_fantasia varchar(100) NOT NULL UNIQUE,
    descricao varchar(255),
    website varchar(255) UNIQUE,
    ativo boolean NOT NULL,
    numero_processo varchar(50) NOT NULL UNIQUE,
    nome_titular varchar(100) NOT NULL,
    cnpj_cpf_titular varchar(14) NOT NULL,
    data_registro date NOT NULL,
    fk_perfil_id_perfil int NOT NULL UNIQUE,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS esporte (
    id_esporte int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(50) NOT NULL UNIQUE,
    descricao varchar(255) NOT NULL UNIQUE,
    fk_midia_id_icone int NOT NULL UNIQUE,
    FOREIGN KEY (fk_midia_id_icone) REFERENCES midia(id_midia)
);

CREATE TABLE IF NOT EXISTS categoria_esporte (
    id_categoria_esporte int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(50) NOT NULL UNIQUE,
    descricao varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS compartilhamento (
    id_compartilhamento int PRIMARY KEY AUTO_INCREMENT,
    legenda varchar(255),
    fk_postagem_id_postagem int NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem),
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS comentario (
    id_comentario int PRIMARY KEY AUTO_INCREMENT,
    texto varchar(255) NOT NULL,
    data_comentario datetime NOT NULL,
    fk_postagem_id_postagem int NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem),
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS estado (
	id_estado int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(30) NOT NULL UNIQUE,
    sigla char(2) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cidade (
	id_cidade int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(100) NOT NULL UNIQUE,
    fk_estado_id_estado int NOT NULL,
    FOREIGN KEY (fk_estado_id_estado) REFERENCES estado(id_estado)
);

CREATE TABLE IF NOT EXISTS instituicao (
    id_instituicao int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(100) NOT NULL UNIQUE,
	fk_cidade_id_cidade int NOT NULL,
    FOREIGN KEY (fk_cidade_id_cidade) REFERENCES cidade(id_cidade)
);

CREATE TABLE IF NOT EXISTS curso (
    id_curso int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS hashtag (
    id_hashtag int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario int PRIMARY KEY AUTO_INCREMENT,
    fk_perfil_id_perfil int NOT NULL UNIQUE,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS pesquisa (
    id_pesquisa int PRIMARY KEY AUTO_INCREMENT,
    texto varchar(50) NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS endereco (
    id_endereco int PRIMARY KEY AUTO_INCREMENT,
    logradouro varchar(100) NOT NULL,
    numero varchar(10) NOT NULL,
    complemento varchar(50),
    bairro varchar(50),
    cep char(8),
    descricao varchar(255) NOT NULL,
    fk_cidade_id_cidade int NOT NULL,
    FOREIGN KEY (fk_cidade_id_cidade) REFERENCES cidade(id_cidade)
);

CREATE TABLE IF NOT EXISTS denuncia (
    id_denuncia int PRIMARY KEY AUTO_INCREMENT,
    descricao varchar(255),
    fk_perfil_id_autor int NOT NULL,
    fk_perfil_id_denunciado int,
    fk_postagem_id_postagem int,
    FOREIGN KEY (fk_perfil_id_autor) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_perfil_id_denunciado) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem)
);

CREATE TABLE IF NOT EXISTS motivo_denuncia (
    id_motivo_denuncia int PRIMARY KEY AUTO_INCREMENT,
    motivo varchar(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS segue (
    fk_perfil_id_seguidor int NOT NULL,
    fk_perfil_id_seguido int NOT NULL,
    FOREIGN KEY (fk_perfil_id_seguidor) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_perfil_id_seguido) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS responde (
    fk_comentario_id_resposta int NOT NULL,
    fk_comentario_id_respondido int NOT NULL,
    FOREIGN KEY (fk_comentario_id_resposta) REFERENCES comentario(id_comentario),
    FOREIGN KEY (fk_comentario_id_respondido) REFERENCES comentario(id_comentario)
);

CREATE TABLE IF NOT EXISTS curso_instituicao (
    id_curso_instituicao int PRIMARY KEY AUTO_INCREMENT,
    fk_instituicao_id_instituicao int NOT NULL,
    fk_curso_id_curso int NOT NULL,
    FOREIGN KEY (fk_instituicao_id_instituicao) REFERENCES instituicao(id_instituicao),
    FOREIGN KEY (fk_curso_id_curso) REFERENCES curso(id_curso)
);

CREATE TABLE IF NOT EXISTS postagem_hashtag (
    fk_postagem_id_postagem int NOT NULL,
    fk_hashtag_id_hashtag int NOT NULL,
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem),
    FOREIGN KEY (fk_hashtag_id_hashtag) REFERENCES hashtag(id_hashtag)
);

CREATE TABLE IF NOT EXISTS categorias_esporte (
    fk_esporte_id_esporte int NOT NULL,
    fk_categoria_esporte_id_categoria_esporte int NOT NULL,
    FOREIGN KEY (fk_categoria_esporte_id_categoria_esporte) REFERENCES categoria_esporte(id_categoria_esporte),
    FOREIGN KEY (fk_esporte_id_esporte) REFERENCES esporte(id_esporte)
);

CREATE TABLE IF NOT EXISTS preferencia (
    fk_perfil_id_perfil int NOT NULL,
    fk_esporte_id_esporte int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_esporte_id_esporte) REFERENCES esporte(id_esporte)
);

CREATE TABLE IF NOT EXISTS motivos_denuncia (
    fk_motivo_denuncia_id_motivo_denuncia int NOT NULL,
    fk_denuncia_id_denuncia int NOT NULL,
    FOREIGN KEY (fk_motivo_denuncia_id_motivo_denuncia) REFERENCES motivo_denuncia(id_motivo_denuncia),
    FOREIGN KEY (fk_denuncia_id_denuncia) REFERENCES denuncia(id_denuncia)
);

CREATE TABLE IF NOT EXISTS compartilhado (
    fk_perfil_id_perfil int NOT NULL,
    fk_compartilhamento_id_compartilhamento int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_compartilhamento_id_compartilhamento) REFERENCES compartilhamento(id_compartilhamento)
);

CREATE TABLE IF NOT EXISTS marcacao_comentario (
    fk_comentario_id_comentario int NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_comentario_id_comentario) REFERENCES comentario(id_comentario),
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS marcacao_postagem (
    fk_perfil_id_perfil int NOT NULL,
    fk_postagem_id_postagem int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem)
);

CREATE TABLE IF NOT EXISTS local_favorito (
    fk_usuario_id_usuario int NOT NULL,
    fk_endereco_id_endereco int NOT NULL,
    FOREIGN KEY (fk_usuario_id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (fk_endereco_id_endereco) REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS evento_endereco (
    fk_endereco_id_endereco int NOT NULL,
    fk_evento_id_evento int NOT NULL,
    FOREIGN KEY (fk_endereco_id_endereco) REFERENCES endereco(id_endereco)
);

CREATE TABLE IF NOT EXISTS esporte_hashtag (
    fk_esporte_id_esporte int NOT NULL,
    fk_hashtag_id_hashtag int NOT NULL,
    FOREIGN KEY (fk_esporte_id_esporte) REFERENCES esporte(id_esporte),
    FOREIGN KEY (fk_hashtag_id_hashtag) REFERENCES hashtag(id_hashtag)
);

CREATE TABLE IF NOT EXISTS evento (
    id_evento int PRIMARY KEY AUTO_INCREMENT,
    nome varchar(100) NOT NULL UNIQUE,
    descricao text NOT NULL,
    inicio datetime NOT NULL,
    fim datetime,
    fk_marca_id_marca int NOT NULL,
	fk_midia_id_midia int UNIQUE,
    FOREIGN KEY (fk_marca_id_marca) REFERENCES marca(id_marca),
    FOREIGN KEY (fk_midia_id_midia) REFERENCES midia(id_midia)
);

CREATE TABLE IF NOT EXISTS curte (
    fk_perfil_id_perfil int NOT NULL,
    fk_postagem_id_postagem int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_postagem_id_postagem) REFERENCES postagem(id_postagem)
);

CREATE TABLE IF NOT EXISTS grau_formacao (
    id_grau_formacao int PRIMARY KEY AUTO_INCREMENT,
    grau varchar(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao int PRIMARY KEY AUTO_INCREMENT,
    mensagem varchar(50) NOT NULL,
    lancamento datetime NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS flash (
    id_flash int PRIMARY KEY AUTO_INCREMENT,
    duracao_horas tinyint NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    fk_midia_id_midia int NOT NULL UNIQUE,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_midia_id_midia) REFERENCES midia(id_midia)
);

CREATE TABLE IF NOT EXISTS live (
    id_live int PRIMARY KEY AUTO_INCREMENT,
    inicio datetime NOT NULL,
    fim datetime,
    curtidas_totais int,
    fk_perfil_id_perfil int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS interacao (
    id_interacao int PRIMARY KEY AUTO_INCREMENT,
    texto varchar(255) NOT NULL,
    momento datetime NOT NULL,
    fk_perfil_id_perfil int NOT NULL,
    fk_live_id_live int NOT NULL,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (fk_live_id_live) REFERENCES live(id_live)
);

CREATE TABLE IF NOT EXISTS configuracao (
    id_configuracao int PRIMARY KEY AUTO_INCREMENT,
    permissao_camera boolean NOT NULL,
    permissao_microfone boolean NOT NULL,
    permissao_fotos_videos boolean NOT NULL,
    permissao_localizacao boolean NOT NULL,
    visibilidade_curtidas boolean NOT NULL,
    visibilidade_compartilhamentos boolean NOT NULL,
    visibilidade_comentarios boolean NOT NULL,
    visibilidade_seguidores boolean NOT NULL,
    visibilidade_seguindo boolean NOT NULL,
    permissao_marcacao varchar(20) NOT NULL,
    permissao_compartilhamento varchar(20) NOT NULL,
    permissao_comentario varchar(20) NOT NULL,
    notificacoes boolean NOT NULL,
    notificacoes_email boolean NOT NULL,
    fk_perfil_id_perfil int NOT NULL UNIQUE,
    FOREIGN KEY (fk_perfil_id_perfil) REFERENCES perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS formacao (
    id_formacao int PRIMARY KEY AUTO_INCREMENT,
    inicio date NOT NULL,
    conclusao date NOT NULL,
    fk_grau_formacao_id_grau_formacao int NOT NULL,
    fk_usuario_id_usuario int NOT NULL,
    fk_curso_instituicao_id_curso_instituicao int NOT NULL,
    FOREIGN KEY (fk_grau_formacao_id_grau_formacao) REFERENCES grau_formacao(id_grau_formacao),
    FOREIGN KEY (fk_usuario_id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (fk_curso_instituicao_id_curso_instituicao) REFERENCES curso_instituicao(id_curso_instituicao)
);